import { EvaluationAnalysis, EvaluationResult, NoteItem, Rival, WeaknessType } from '../types/game';
import { getNoteFrequency } from './musicGrammar';

// Analyze objective musical properties of player's composition
export function analyzeComposition(notes: NoteItem[]): EvaluationAnalysis {
  if (!notes || notes.length === 0) {
    return {
      pitchVariance: 0,
      rhythmicVariety: 0,
      restCount: 0,
      octaveContrast: 0,
      patternCoherence: 0,
      sharpCount: 0,
      noteCount: 0,
    };
  }

  const pitchSet = new Set<string>();
  const durationSet = new Set<number>();
  let restCount = 0;
  let sharpCount = 0;
  let minOctave = 3;
  let maxOctave = 1;

  for (const n of notes) {
    if (n.pitch === '-') {
      restCount++;
    } else {
      pitchSet.add(n.pitch);
      if (n.sharp) sharpCount++;
      if (n.octave < minOctave) minOctave = n.octave;
      if (n.octave > maxOctave) maxOctave = n.octave;
    }
    durationSet.add(n.duration);
  }

  const octaveContrast = maxOctave - minOctave; // 0, 1, or 2

  // Measure pattern coherence: check for melodic intervals, scalar runs, arpeggio symmetry
  let patternCoherence = 50;
  let ascendingSteps = 0;
  let descendingSteps = 0;
  let octaveJumps = 0;

  for (let i = 1; i < notes.length; i++) {
    const prev = notes[i - 1];
    const curr = notes[i];
    if (prev.pitch !== '-' && curr.pitch !== '-') {
      const prevFreq = getNoteFrequency(prev.pitch, prev.sharp, prev.octave);
      const currFreq = getNoteFrequency(curr.pitch, curr.sharp, curr.octave);
      if (currFreq > prevFreq) ascendingSteps++;
      if (currFreq < prevFreq) descendingSteps++;
      if (Math.abs(curr.octave - prev.octave) >= 1) octaveJumps++;
    }
  }

  // Balanced melodic motion rewards coherence
  if (ascendingSteps > 0 && descendingSteps > 0) patternCoherence += 20;
  if (octaveJumps > 0) patternCoherence += 15;
  if (durationSet.size >= 2) patternCoherence += 15;

  return {
    pitchVariance: pitchSet.size,
    rhythmicVariety: durationSet.size,
    restCount,
    octaveContrast,
    patternCoherence: Math.min(100, patternCoherence),
    sharpCount,
    noteCount: notes.length,
  };
}

// Evaluate duel between player composition and rival
export function evaluateDuel(notes: NoteItem[], rival: Rival): EvaluationResult {
  const analysis = analyzeComposition(notes);

  if (notes.length < 3) {
    return {
      baseScore: 10,
      weaknessMatch: 0,
      isCritical: false,
      isWin: false,
      comboMultiplier: 1.0,
      totalScore: 10,
      reputationGained: 0,
      feedbackTitle: 'Toque Incompleto',
      feedbackMessage: 'Seu toque foi curto demais para impressionar o pátio. Digite pelo menos 3 notas!',
      weaknessDetail: 'Toque muito curto.',
      analysis,
    };
  }

  let weaknessMatch = 30; // base floor
  let weaknessDetail = '';

  switch (rival.weaknessType) {
    case 'HIGH_PITCH_CONTRAST': {
      // Bully: vulnerable to octave jumps and high registers (octave 3 + sharp leaps)
      let contrastScore = 0;
      if (analysis.octaveContrast >= 2) contrastScore += 45;
      else if (analysis.octaveContrast === 1) contrastScore += 25;

      const hasOctave3 = notes.some(n => n.octave === 3 && n.pitch !== '-');
      const hasOctave1 = notes.some(n => n.octave === 1 && n.pitch !== '-');
      if (hasOctave3 && hasOctave1) contrastScore += 25;
      else if (hasOctave3) contrastScore += 15;

      if (analysis.pitchVariance >= 4) contrastScore += 15;

      weaknessMatch = Math.min(100, 20 + contrastScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'Explorou com maestria o contraste de registro! O Valentão não alcançou os agudos!'
        : 'Você precisa de maior contraste entre notas graves e agudas (Oitava 3 vs Oitava 1).';
      break;
    }

    case 'PATTERN_BREAK': {
      // CDF: vulnerable to syncopation, unexpected rhythm shifts and broken diatonic scale
      let breakScore = 0;
      if (analysis.rhythmicVariety >= 3) breakScore += 40;
      else if (analysis.rhythmicVariety === 2) breakScore += 20;

      const hasDotted = notes.some(n => n.dotted);
      if (hasDotted) breakScore += 20;

      if (analysis.restCount >= 1) breakScore += 15;
      if (analysis.octaveContrast >= 1) breakScore += 15;

      weaknessMatch = Math.min(100, 20 + breakScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'Quebra de padrão cirúrgica! A CDF perdeu a conta com sua síncope!'
        : 'A CDF prevê melodias simples. Varie as durações (8/9) e use notas pontuadas para surpreendê-la.';
      break;
    }

    case 'CHROMATIC_TENSION': {
      // Emo: vulnerable to sharp notes (#), chromatic minor tension
      let sharpScore = 0;
      if (analysis.sharpCount >= 3) sharpScore += 55;
      else if (analysis.sharpCount >= 2) sharpScore += 40;
      else if (analysis.sharpCount >= 1) sharpScore += 25;

      const hasDotted = notes.some(n => n.dotted);
      if (hasDotted) sharpScore += 15;
      if (analysis.pitchVariance >= 3) sharpScore += 15;

      weaknessMatch = Math.min(100, 15 + sharpScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'Tensão cromática devastadora! O Emo se emocionou com os sustenidos (#)!'
        : 'O Emo reage a sustenidos e tensão cromática. Pressione a tecla [#] nas notas C, D, F, G ou A.';
      break;
    }

    case 'RESTS_AND_SYNC': {
      // Skatista: vulnerable to dramatic pauses and rhythmic rests
      let restScore = 0;
      if (analysis.restCount >= 2) restScore += 50;
      else if (analysis.restCount === 1) restScore += 30;

      const hasFastNotes = notes.some(n => n.duration >= 16);
      if (hasFastNotes) restScore += 25;
      if (analysis.rhythmicVariety >= 2) restScore += 15;

      weaknessMatch = Math.min(100, 20 + restScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'Drop rítmico perfeito! As pausas (0) criaram um ritmo irresistível!'
        : 'O Skatista precisa de silêncio e drops. Use a tecla [0] para inserir pausas estratégicas.';
      break;
    }

    case 'SUSTAINED_LOW': {
      // Fofoqueira: vulnerable to long, sustained low-register notes (octave 1)
      let lowScore = 0;
      const longLowNotes = notes.filter(n => n.octave === 1 && (n.duration === 1 || n.duration === 2 || n.duration === 4) && n.pitch !== '-');
      if (longLowNotes.length >= 3) lowScore += 60;
      else if (longLowNotes.length >= 2) lowScore += 40;
      else if (longLowNotes.length >= 1) lowScore += 25;

      if (notes.some(n => n.octave === 1)) lowScore += 15;

      weaknessMatch = Math.min(100, 15 + lowScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'Notas graves e firmes silenciaram a fofoca com autoridade!'
        : 'A Fofoqueira fala rápido demais. Responda com notas longas e graves na Oitava 1.';
      break;
    }

    case 'MINIMALIST_REPOSE': {
      // Metaleiro: vulnerable to calm, elegant minimalist melodic phrase (5-8 notes without frantic spam)
      let cleanScore = 0;
      if (notes.length >= 4 && notes.length <= 8) cleanScore += 45;
      if (analysis.pitchVariance >= 3 && analysis.pitchVariance <= 5) cleanScore += 25;
      if (analysis.sharpCount === 0 || analysis.sharpCount === 1) cleanScore += 15;

      weaknessMatch = Math.min(100, 20 + cleanScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'A melodia limpa e refinada desarmou o peso do metal!'
        : 'O Metaleiro já tem barulho suficiente. Crie uma frase melódica limpa e elegante de 4 a 7 notas.';
      break;
    }

    case 'MULTI_PHASE_INVERSION': {
      // Boss: requires rich combination of contrast, variety and rhythm
      let bossScore = 0;
      if (analysis.octaveContrast >= 1) bossScore += 25;
      if (analysis.rhythmicVariety >= 2) bossScore += 25;
      if (analysis.sharpCount >= 1) bossScore += 20;
      if (analysis.restCount >= 1) bossScore += 15;

      weaknessMatch = Math.min(100, 15 + bossScore);
      weaknessDetail = weaknessMatch >= 75
        ? 'Composição magistral! O Chefe do Recreio reconheceu seu domínio absoluto!'
        : 'O Chefe exige um toque completo: combine contraste de oitavas (*), sustenidos (#) e pausas (0).';
      break;
    }
  }

  // Base score based on musical coherence and length
  const baseScore = Math.min(100, Math.round(
    (analysis.patternCoherence * 0.4) +
    (analysis.pitchVariance * 7) +
    (analysis.rhythmicVariety * 8) +
    (Math.min(notes.length, 12) * 2.5)
  ));

  // Combo multiplier if sequential scale or symmetry is detected
  let comboMultiplier = 1.0;
  if (analysis.patternCoherence >= 80) comboMultiplier = 1.4;
  else if (analysis.patternCoherence >= 65) comboMultiplier = 1.2;

  const isCritical = weaknessMatch >= 75;
  if (isCritical) comboMultiplier += 0.4;

  const totalScore = Math.round((baseScore * 0.4 + weaknessMatch * 0.6) * comboMultiplier);
  const isWin = weaknessMatch >= 50 && totalScore >= 45;

  // Reputation reward
  let reputationGained = 0;
  if (isWin) {
    reputationGained = Math.round(20 + (isCritical ? 15 : 0) + (rival.isBoss ? 25 : 10));
  }

  let feedbackTitle = isWin
    ? (isCritical ? 'CRITICAL HIT! VITÓRIA ÉPICA!' : 'VITÓRIA NO PÁTIO!')
    : 'DUELO PERDIDO';

  let feedbackMessage = isWin
    ? (isCritical
        ? `O pátio inteiro parou para ouvir! ${rival.name} não teve resposta para a sua criação.`
        : `Seu toque superou a assinatura de ${rival.name}! A galera ao redor aplaudiu.`)
    : `${rival.name} guardou o celular com desdém. Seu toque não explorou a fraqueza sonora certa.`;

  return {
    baseScore,
    weaknessMatch,
    isCritical,
    isWin,
    comboMultiplier: Number(comboMultiplier.toFixed(1)),
    totalScore,
    reputationGained,
    feedbackTitle,
    feedbackMessage,
    weaknessDetail,
    analysis,
  };
}
