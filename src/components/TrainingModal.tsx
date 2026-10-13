import React, { useState } from 'react';
import { NoteItem, Rival, SoundfontType } from '../types/game';
import { RIVALS_DATABASE } from '../data/rivals';
import { analyzeComposition, evaluateDuel } from '../services/evaluationEngine';
import { RetroPhone } from './RetroPhone';
import { RivalAvatar } from './RivalAvatar';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { Wrench, X, Sparkles, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface TrainingModalProps {
  soundfont: SoundfontType;
  phoneColor: string;
  onClose: () => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  soundfont,
  phoneColor,
  onClose,
}) => {
  const [selectedRivalId, setSelectedRivalId] = useState<string>(RIVALS_DATABASE[0].id);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingIndex, setPlayingIndex] = useState<number>(-1);

  const selectedRival = RIVALS_DATABASE.find(r => r.id === selectedRivalId) || RIVALS_DATABASE[0];
  const liveAnalysis = analyzeComposition(notes);
  const liveEvaluation = evaluateDuel(notes, selectedRival);

  const handlePlayNotes = async () => {
    if (notes.length === 0 || isPlaying) return;
    setIsPlaying(true);
    await audioEngine.playSequence(
      notes,
      bpm,
      soundfont,
      (idx) => setPlayingIndex(idx),
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

  const handleListenRival = async () => {
    setIsPlaying(true);
    await audioEngine.playSequence(
      selectedRival.signature,
      selectedRival.bpm,
      'original',
      (idx) => setPlayingIndex(idx),
      () => {
        setIsPlaying(false);
        setPlayingIndex(-1);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#181a1d] border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto my-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#2d3138] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Laboratório de Treino</h2>
                <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  BATERIA INFINITA (∞)
                </span>
              </div>
              <p className="text-xs text-gray-400">Experimente composições e veja a reação matemática em tempo real</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#202328] text-gray-400 hover:text-white border border-[#2e323a] transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rival Selector Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RIVALS_DATABASE.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelectedRivalId(r.id);
                audioEngine.playKeyClick();
              }}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 border transition ${
                r.id === selectedRivalId
                  ? 'bg-emerald-500/10 border-emerald-400 text-white font-bold'
                  : 'bg-[#151719] border-[#25282e] text-gray-400 hover:text-white'
              }`}
            >
              <RivalAvatar rival={r} size="sm" />
              <div className="text-left">
                <div className="text-xs">{r.name}</div>
                <div className="text-[10px] text-gray-500 font-normal">{r.weaknessType}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Training Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Real-time Weakness Feedback & Theory */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Target Rival Profile Box */}
            <div className="bg-[#121417] border border-[#262930] rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{selectedRival.name}</span>
                <button
                  type="button"
                  onClick={handleListenRival}
                  disabled={isPlaying}
                  className="px-2.5 py-1 bg-[#202328] hover:bg-[#2c3038] text-xs font-bold text-[#D5B84A] rounded-lg border border-[#353942] flex items-center gap-1 transition"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Ouvir Assinatura</span>
                </button>
              </div>
              <div className="text-xs text-gray-300 bg-[#1a1d22] p-2.5 rounded-xl border border-[#2c3038]">
                <span className="font-bold text-emerald-400 block mb-0.5">Pista de Fraqueza:</span>
                {selectedRival.weaknessHint}
              </div>
              <div className="text-[11px] text-gray-400 italic">
                {selectedRival.revealedClue}
              </div>
            </div>

            {/* Live Musical Score Diagnostics */}
            <div className="bg-[#121417] border border-[#262930] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compatibilidade de Fraqueza:</span>
                </span>
                <span className={`text-xs font-mono font-bold ${liveEvaluation.weaknessMatch >= 75 ? 'text-[#D5B84A]' : 'text-gray-300'}`}>
                  {liveEvaluation.weaknessMatch}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#202328] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    liveEvaluation.weaknessMatch >= 75
                      ? 'bg-gradient-to-r from-[#D5B84A] to-amber-300'
                      : liveEvaluation.weaknessMatch >= 50
                      ? 'bg-emerald-400'
                      : 'bg-gray-600'
                  }`}
                  style={{ width: `${liveEvaluation.weaknessMatch}%` }}
                />
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="bg-[#1a1d22] p-2 rounded-lg border border-[#282b32]">
                  <span className="text-gray-500 block">NOTAS:</span>
                  <span className="text-white font-bold">{liveAnalysis.noteCount}</span>
                </div>
                <div className="bg-[#1a1d22] p-2 rounded-lg border border-[#282b32]">
                  <span className="text-gray-500 block">SUSTENIDOS:</span>
                  <span className="text-[#6B4C9E] font-bold">{liveAnalysis.sharpCount}</span>
                </div>
                <div className="bg-[#1a1d22] p-2 rounded-lg border border-[#282b32]">
                  <span className="text-gray-500 block">CONTRASTE:</span>
                  <span className="text-[#4C7D9E] font-bold">Oit. {liveAnalysis.octaveContrast}</span>
                </div>
              </div>

              {/* Real-time Musical Assessment */}
              <div className="text-[11px] text-gray-300 bg-[#1a1d22] p-2.5 rounded-xl border border-[#282b32]">
                {liveEvaluation.weaknessDetail}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Phone Handset */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <RetroPhone
              notes={notes}
              bpm={bpm}
              battery={100}
              day={1}
              soundfont={soundfont}
              phoneColor={phoneColor}
              isPlaying={isPlaying}
              playingIndex={playingIndex}
              screenTitle="LABORATÓRIO"
              onNotesChange={setNotes}
              onBpmChange={setBpm}
              onPlay={handlePlayNotes}
              onStop={handleStopPlayback}
              onSubmit={handlePlayNotes}
              actionButtonLabel="TESTAR"
              actionButtonDisabled={notes.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
