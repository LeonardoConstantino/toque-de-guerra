import React, { useState } from 'react';
import { Composition, NoteItem, SoundfontType } from '../types/game';
import { compositionToString } from '../services/musicGrammar';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { Music, Play, Square, Save, Trash2, Copy, Check, X, AlertTriangle } from 'lucide-react';

interface RepertoireModalProps {
  slots: (Composition | null)[];
  soundfont: SoundfontType;
  pendingSaveNotes?: NoteItem[];
  pendingSaveBpm?: number;
  rivalDefeatedName?: string;
  onSaveToSlot: (slotIndex: number, composition: Composition) => void;
  onLoadToComposer?: (composition: Composition) => void;
  onClose: () => void;
}

export const RepertoireModal: React.FC<RepertoireModalProps> = ({
  slots,
  soundfont,
  pendingSaveNotes,
  pendingSaveBpm = 120,
  rivalDefeatedName,
  onSaveToSlot,
  onLoadToComposer,
  onClose,
}) => {
  const [playingSlot, setPlayingSlot] = useState<number | null>(null);
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null);
  const [overwriteConfirmSlot, setOverwriteConfirmSlot] = useState<number | null>(null);
  const [customName, setCustomName] = useState<string>(
    rivalDefeatedName ? `Hit vs ${rivalDefeatedName}` : 'Meu Toque de Guerra'
  );

  const handlePlaySlot = async (index: number, comp: Composition) => {
    if (playingSlot === index) {
      audioEngine.stopAllPlayback();
      setPlayingSlot(null);
      return;
    }

    setPlayingSlot(index);
    await audioEngine.playSequence(
      comp.notes,
      comp.bpm,
      soundfont,
      undefined,
      () => {
        setPlayingSlot(null);
      }
    );
  };

  const handleSaveToTargetSlot = (slotIndex: number) => {
    if (!pendingSaveNotes || pendingSaveNotes.length === 0) return;

    // If slot is occupied and not yet confirmed, ask confirmation
    if (slots[slotIndex] && overwriteConfirmSlot !== slotIndex) {
      setOverwriteConfirmSlot(slotIndex);
      return;
    }

    const newComposition: Composition = {
      id: `slot_${slotIndex}_${Date.now()}`,
      name: customName || `Slot ${slotIndex + 1}`,
      notes: pendingSaveNotes,
      bpm: pendingSaveBpm,
      createdAt: Date.now(),
      author: 'Jogador',
      rivalDefeated: rivalDefeatedName,
    };

    audioEngine.playKeyClick();
    triggerHaptic('confirm');
    onSaveToSlot(slotIndex, newComposition);
    setOverwriteConfirmSlot(null);
  };

  const handleCopyCode = (index: number, comp: Composition) => {
    const code = compositionToString(comp.notes);
    navigator.clipboard.writeText(code);
    setCopiedSlot(index);
    setTimeout(() => setCopiedSlot(null), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-[#181a1d] border-2 border-[#2d3138] rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl flex flex-col text-left animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#2d3138] mb-3 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#202328] flex items-center justify-center text-[#D5B84A] border border-[#303338] shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Os 7 Slots de Memória</h2>
              <p className="text-xs text-gray-400">Repertório permanente do seu aparelho nesta run</p>
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

        {/* Pending Save Banner if player just won a duel */}
        {pendingSaveNotes && pendingSaveNotes.length > 0 && (
          <div className="bg-[#D5B84A]/10 border border-[#D5B84A]/30 rounded-2xl p-3.5 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#D5B84A]">SALVAR TOQUE RECÉM-CRIADO:</span>
              <span className="text-[11px] font-mono text-gray-300">{pendingSaveNotes.length} notas • {pendingSaveBpm} BPM</span>
            </div>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nome do seu toque..."
              className="w-full bg-[#121417] border border-[#303338] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D5B84A]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Escolha um dos 7 slots abaixo para gravar. Se o slot estiver ocupado, ele será substituído.
            </p>
          </div>
        )}

        {/* 7 Slots List */}
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {[...Array(7)].map((_, idx) => {
            const comp = slots[idx];
            const isPlaying = playingSlot === idx;
            const isOverwriteTarget = overwriteConfirmSlot === idx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                  comp
                    ? 'bg-[#1e2023] border-[#303338] hover:border-[#42464d]'
                    : 'bg-[#151719] border-dashed border-[#282a2e]'
                }`}
              >
                {/* Slot Info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#121417] border border-[#2a2d33] flex items-center justify-center font-mono font-bold text-xs text-[#D5B84A]">
                    {idx + 1}
                  </div>

                  <div>
                    {comp ? (
                      <>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{comp.name}</span>
                          {comp.rivalDefeated && (
                            <span className="text-[10px] bg-[#4C7D9E]/20 text-[#4C7D9E] px-1.5 rounded">
                              vs {comp.rivalDefeated}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {comp.notes.length} notas • {comp.bpm} BPM • {new Date(comp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 italic">
                        [Slot Vazio]
                      </div>
                    )}
                  </div>
                </div>

                {/* Slot Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {comp && (
                    <>
                      {/* Play Button */}
                      <button
                        type="button"
                        onClick={() => handlePlaySlot(idx, comp)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                          isPlaying
                            ? 'bg-[#B84D4D] text-white shadow'
                            : 'bg-[#282b30] text-gray-300 hover:text-white hover:bg-[#32363d]'
                        }`}
                        title="Tocar melodia do slot"
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#D5B84A]" />}
                      </button>

                      {/* Copy Code */}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(idx, comp)}
                        className="p-2 rounded-xl bg-[#282b30] text-gray-300 hover:text-white transition"
                        title="Copiar código do Composer"
                      >
                        {copiedSlot === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Load to Composer if in yard */}
                      {onLoadToComposer && (
                        <button
                          type="button"
                          onClick={() => onLoadToComposer(comp)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#282b30] text-gray-300 hover:text-white text-[11px] font-bold transition"
                        >
                          Carregar
                        </button>
                      )}
                    </>
                  )}

                  {/* Save to Slot button if pending save */}
                  {pendingSaveNotes && pendingSaveNotes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSaveToTargetSlot(idx)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                        isOverwriteTarget
                          ? 'bg-[#B84D4D] text-white animate-pulse'
                          : 'bg-[#D5B84A] text-black hover:brightness-110'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isOverwriteTarget ? 'CONFIRMAR SOBRESCREVER?' : comp ? 'Substituir' : 'Gravar'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#2d3138] flex justify-between items-center text-xs text-gray-400">
          <span>7 slots permanentes • Escolha com estratégia</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#202328] hover:bg-[#2c3038] text-white rounded-xl font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
