import React, { useEffect, useState } from 'react';
import { EvaluationResult, NoteItem, Rival, SoundfontType } from '../types/game';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { evaluateDuel } from '../services/evaluationEngine';
import { RetroPhone } from './RetroPhone';
import { RivalAvatar } from './RivalAvatar';
import { Volume2, Play, ArrowLeft, Zap, Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface DuelViewProps {
  rival: Rival;
  day: number;
  battery: number;
  soundfont: SoundfontType;
  phoneColor: string;
  onDuelWon: (result: EvaluationResult, notes: NoteItem[]) => void;
  onDuelLost: (result: EvaluationResult) => void;
  onBackToYard: () => void;
  onOpenSlots: () => void;
  onDrainBattery: (amount: number) => void;
}

export type DuelPhase = 'INTRO' | 'LISTENING' | 'COMPOSING' | 'EVALUATING' | 'RESULT';

export const DuelView: React.FC<DuelViewProps> = ({
  rival,
  day,
  battery,
  soundfont,
  phoneColor,
  onDuelWon,
  onDuelLost,
  onBackToYard,
  onOpenSlots,
  onDrainBattery,
}) => {
  const [phase, setPhase] = useState<DuelPhase>('INTRO');
  const [playerNotes, setPlayerNotes] = useState<NoteItem[]>([]);
  const [playerBpm, setPlayerBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingIndex, setPlayingIndex] = useState<number>(-1);
  const [rivalAvatarState, setRivalAvatarState] = useState<'idle' | 'listening' | 'critical' | 'defeated' | 'triumphant'>('idle');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isCriticalFlashing, setIsCriticalFlashing] = useState<boolean>(false);

  // Play Rival Signature Melody on enter
  const handlePlayRivalSignature = async () => {
    setPhase('LISTENING');
    setIsPlaying(true);
    setRivalAvatarState('listening');

    // Drain slight battery for listening
    onDrainBattery(1);

    await audioEngine.playSequence(
      rival.signature,
      rival.bpm,
      'original',
      (idx) => {
        setPlayingIndex(idx);
      },
      () => {
        setIsPlaying(false);
        setPlayingIndex(-1);
        setRivalAvatarState('idle');
        setPhase('COMPOSING');
      }
    );
  };

  // Play player composed notes
  const handlePlayPlayerMelody = async () => {
    if (playerNotes.length === 0 || isPlaying) return;
    setIsPlaying(true);
    onDrainBattery(1);

    await audioEngine.playSequence(
      playerNotes,
      playerBpm,
      soundfont,
      (idx) => {
        setPlayingIndex(idx);
      },
      () => {
        setIsPlaying(false);
        setPlayingIndex(-1);
      }
    );
  };

  const handleStopPlayback = () => {
    audioEngine.stopAllPlayback();
    setIsPlaying(false);
    setPlayingIndex(-1);
  };

  // Submit player composition for duel evaluation
  const handleSubmitDuel = async () => {
    if (playerNotes.length === 0) return;
    handleStopPlayback();

    setPhase('EVALUATING');
    onDrainBattery(2);

    // Evaluate deterministic music theory
    const result = evaluateDuel(playerNotes, rival);
    setEvaluationResult(result);

    if (result.isCritical) {
      // Critical Hit Sequence: flash LCD & play chiptune boom
      setIsCriticalFlashing(true);
      setRivalAvatarState('critical');
      audioEngine.playCriticalHitSound();
      triggerHaptic('critical');

      setTimeout(() => {
        setIsCriticalFlashing(false);
      }, 400);
    }

    // Brief evaluation suspense
    setTimeout(() => {
      setPhase('RESULT');
      if (result.isWin) {
        setRivalAvatarState('defeated');
        audioEngine.playVictoryJingle();
        triggerHaptic('victory');
      } else {
        setRivalAvatarState('triumphant');
        audioEngine.playDefeatSound();
        triggerHaptic('error');
      }
    }, 900);
  };

  const handleProceedAfterResult = () => {
    if (!evaluationResult) return;
    if (evaluationResult.isWin) {
      onDuelWon(evaluationResult, playerNotes);
    } else {
      onDuelLost(evaluationResult);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col gap-4 p-3 sm:p-5 relative ${
      isCriticalFlashing ? 'bg-white invert duration-100' : ''
    }`}>
      {/* Top Duel Navigation & Header */}
      <div className="flex justify-between items-center bg-[#181a1d] border border-[#2d3138] rounded-2xl p-3 sm:p-4 shadow-xl">
        <button
          type="button"
          onClick={onBackToYard}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#202328] border border-[#2e323a] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Abandonar Duelo</span>
        </button>

        <div className="text-center">
          <div className="text-[10px] text-[#D5B84A] uppercase font-bold tracking-widest">
            {rival.isBoss ? '👑 CONFRONTO SUPREMO' : `DUELO MUSICAL • DIA ${day.toString().padStart(2, '0')}`}
          </div>
          <div className="text-sm sm:text-base font-bold text-white tracking-wide">
            {rival.name}
          </div>
        </div>

        <div className="text-xs font-bold text-gray-300 bg-[#202328] px-3 py-1.5 rounded-lg border border-[#2e323a]">
          Bateria: <span className={battery <= 20 ? 'text-[#B84D4D]' : 'text-emerald-400'}>{battery}%</span>
        </div>
      </div>

      {/* Main Duel Arena Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Rival Persona, Signature Audition & Clues */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Rival Profile Box */}
          <div className="bg-[#181a1d] border border-[#2d3138] rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <RivalAvatar rival={rival} state={rivalAvatarState} size="lg" />

            <h3 className="text-lg font-bold text-white mt-3">{rival.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{rival.title}</p>

            {/* Dialogue Bubble */}
            <div className="bg-[#121417] border border-[#292d35] rounded-2xl p-3.5 text-xs text-gray-300 italic mb-4 w-full relative">
              <span className="text-white font-bold block mb-1">"{rival.dialogueIntro}"</span>
            </div>

            {/* Signature Audition Box */}
            <div className="w-full bg-[#1e2023] border border-[#303338] rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-300">Assinatura Sonora:</span>
                <span className="text-[11px] font-mono text-[#D5B84A]">{rival.bpm} BPM</span>
              </div>
              <div className="font-mono text-xs text-[#D5B84A] bg-[#121417] p-2 rounded-xl border border-[#26282d] break-all">
                {rival.signatureDescription}
              </div>

              <button
                id="duel-btn-listen-signature"
                type="button"
                onClick={handlePlayRivalSignature}
                disabled={isPlaying}
                className="w-full mt-1 py-2.5 bg-gradient-to-r from-[#4C7D9E] to-[#345c75] text-white font-bold text-xs rounded-xl shadow hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>{phase === 'LISTENING' ? 'ESCUTANDO ASSINATURA...' : 'ESCUTAR ASSINATURA NOVAMENTE'}</span>
              </button>
            </div>

            {/* Fraqueza Clue Banner */}
            <div className="w-full mt-3 bg-[#D5B84A]/10 border border-[#D5B84A]/30 rounded-2xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D5B84A] mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Pista Musical de Fraqueza</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">{rival.weaknessHint}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Player Handset & Composer */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <RetroPhone
            notes={playerNotes}
            bpm={playerBpm}
            battery={battery}
            day={day}
            soundfont={soundfont}
            phoneColor={phoneColor}
            isPlaying={isPlaying}
            playingIndex={playingIndex}
            screenTitle={`DUELO VS ${rival.name.toUpperCase()}`}
            onNotesChange={setPlayerNotes}
            onBpmChange={setPlayerBpm}
            onPlay={handlePlayPlayerMelody}
            onStop={handleStopPlayback}
            onSubmit={handleSubmitDuel}
            onOpenSlots={onOpenSlots}
            actionButtonLabel="ENVIAR"
            actionButtonDisabled={playerNotes.length === 0 || isPlaying}
          />
        </div>
      </div>

      {/* Duel Evaluation Result Modal */}
      {phase === 'RESULT' && evaluationResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#181a1d] border-2 border-[#2d3138] rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
            {/* Victory / Defeat Header Icon */}
            {evaluationResult.isWin ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#B84D4D]/20 border-2 border-[#B84D4D] text-[#B84D4D] flex items-center justify-center mb-3">
                <XCircle className="w-9 h-9" />
              </div>
            )}

            <h2 className="text-xl font-bold text-white mb-1">{evaluationResult.feedbackTitle}</h2>
            <p className="text-xs text-gray-300 mb-4">{evaluationResult.feedbackMessage}</p>

            {/* Score Breakdown Card */}
            <div className="w-full bg-[#121417] border border-[#23272d] rounded-2xl p-4 flex flex-col gap-2.5 mb-4 text-left">
              {/* Weakness Match Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-400">Exploração da Fraqueza:</span>
                  <span className={evaluationResult.weaknessMatch >= 75 ? 'text-[#D5B84A]' : 'text-gray-300'}>
                    {evaluationResult.weaknessMatch}%
                  </span>
                </div>
                <div className="w-full bg-[#202328] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      evaluationResult.weaknessMatch >= 75
                        ? 'bg-gradient-to-r from-[#D5B84A] to-amber-300'
                        : 'bg-[#4C7D9E]'
                    }`}
                    style={{ width: `${evaluationResult.weaknessMatch}%` }}
                  />
                </div>
              </div>

              {/* Combo & Rep Details */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#23272d]">
                <div>
                  <span className="text-gray-500 block text-[10px] font-bold">MULTIPLICADOR:</span>
                  <span className="text-white font-bold">{evaluationResult.comboMultiplier}x Combo</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] font-bold">REPUTAÇÃO:</span>
                  <span className="text-[#D5B84A] font-bold">+{evaluationResult.reputationGained} PTS</span>
                </div>
              </div>

              {/* Weakness Feedback */}
              <div className="text-[11px] text-gray-300 bg-[#1a1d22] p-2.5 rounded-xl border border-[#2a2e36] mt-1">
                {evaluationResult.weaknessDetail}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-2">
              <button
                id="duel-result-btn-proceed"
                type="button"
                onClick={handleProceedAfterResult}
                className="w-full py-3 bg-gradient-to-r from-[#D5B84A] to-[#b8972f] text-black font-bold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                {evaluationResult.isWin ? 'CONTINUAR (FREESTYLE)' : 'TENTAR NOVAMENTE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
