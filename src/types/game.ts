export type Pitch = 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'b' | '-';

export type Duration = 1 | 2 | 4 | 8 | 16 | 32;

export type Octave = 1 | 2 | 3;

export interface NoteItem {
  id: string;
  pitch: Pitch;
  sharp: boolean;     // Only allowed on c, d, f, g, a (not on e or b)
  octave: Octave;     // 1, 2, 3
  duration: Duration; // 1, 2, 4, 8, 16, 32
  dotted: boolean;    // adds 50% length
}

export interface Composition {
  id: string;
  name: string;
  notes: NoteItem[];
  bpm: number;
  createdAt: number;
  author?: string;
  rivalDefeated?: string;
}

export type SoundfontType = 'original' | 'grave' | 'agudo' | 'radio' | 'arcade' | 'polyphonic';

export type WeaknessType =
  | 'HIGH_PITCH_CONTRAST'    // Valentão: large octave leaps and high registers
  | 'PATTERN_BREAK'          // CDF: unexpected rhythm shifts, syncopation
  | 'CHROMATIC_TENSION'      // Emo: sharp notes (#), minor dissonance
  | 'RESTS_AND_SYNC'         // Skatista: pauses and rhythmic silences
  | 'SUSTAINED_LOW'          // Fofoqueira: long low notes
  | 'MINIMALIST_REPOSE'      // Metaleiro: simple clean melody
  | 'MULTI_PHASE_INVERSION'; // Chefe: rich balanced dynamic range

export interface Rival {
  id: string;
  name: string;
  title: string;
  personality: string;
  avatarColor: string;
  signatureDescription: string;
  signature: NoteItem[];
  bpm: number;
  weaknessType: WeaknessType;
  weaknessHint: string;
  revealedClue: string;
  tier: 1 | 2 | 3 | 4;
  isBoss?: boolean;
  bossPhase?: number;
  dialogueIntro: string;
  dialogueDefeat: string;
  dialogueWin: string;
}

export interface EvaluationAnalysis {
  pitchVariance: number;
  rhythmicVariety: number;
  restCount: number;
  octaveContrast: number;
  patternCoherence: number;
  sharpCount: number;
  noteCount: number;
}

export interface EvaluationResult {
  baseScore: number;
  weaknessMatch: number;      // 0 to 100%
  isCritical: boolean;        // >= 75%
  isWin: boolean;             // overall score & weakness passed
  comboMultiplier: number;
  totalScore: number;
  reputationGained: number;
  feedbackTitle: string;
  feedbackMessage: string;
  weaknessDetail: string;
  analysis: EvaluationAnalysis;
}

export interface YardEventChoice {
  text: string;
  description: string;
  actionType: 'REPUTATION' | 'BATTERY' | 'CODE' | 'RADIO' | 'SKIP';
  value?: number;
  rewardCode?: string;
  outcomeText: string;
}

export interface YardEvent {
  id: string;
  title: string;
  character: string;
  situation: string;
  choices: YardEventChoice[];
}

export interface NotebookPage {
  id: string;
  pageNumber: number;
  title: string;
  category: 'LORE' | 'GRAMMAR' | 'RIVALS' | 'SECRETS' | 'THEORY';
  content: string[];
  stickers: string[];
  sampleCode?: string;
  isUnlockedByDefault: boolean;
  unlockConditionHint: string;
}

export type GameScreen =
  | 'TITLE'
  | 'YARD'
  | 'RIVAL_INTRO'
  | 'LISTENING'
  | 'COMPOSER'
  | 'EVALUATING'
  | 'DUEL_RESULT'
  | 'FREESTYLE'
  | 'NOTEBOOK'
  | 'TRAINING'
  | 'RADIO'
  | 'POWER_OFF'
  | 'RUN_COMPLETE';

export interface GameSettings {
  soundVolume: number;
  haptics: boolean;
  screenShake: boolean;
  highContrast: boolean;
  soundfont: SoundfontType;
  phoneColor: 'classic-grey' | 'cyan-rebel' | 'electric-yellow' | 'ruby-red';
}
