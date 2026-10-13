import React from 'react';
import { Rival, SoundfontType } from '../types/game';
import { RivalAvatar } from './RivalAvatar';
import { BookOpen, Radio, Play, Trophy, Sparkles, BatteryMedium, Volume2, Music, Wrench } from 'lucide-react';

interface YardViewProps {
  day: number;
  battery: number;
  reputation: number;
  currentRival: Rival;
  completedRivalIds: string[];
  soundfont: SoundfontType;
  onStartDuel: () => void;
  onOpenNotebook: () => void;
  onOpenRadio: () => void;
  onOpenSlots: () => void;
  onOpenTraining: () => void;
  onSoundfontChange: (sf: SoundfontType) => void;
  onColorChange: (color: 'classic-grey' | 'cyan-rebel' | 'electric-yellow' | 'ruby-red') => void;
  phoneColor: string;
}

export const YardView: React.FC<YardViewProps> = ({
  day,
  battery,
  reputation,
  currentRival,
  completedRivalIds,
  soundfont,
  onStartDuel,
  onOpenNotebook,
  onOpenRadio,
  onOpenSlots,
  onOpenTraining,
  onSoundfontChange,
  onColorChange,
  phoneColor,
}) => {
  const soundfonts: { id: SoundfontType; name: string; desc: string }[] = [
    { id: 'original', name: 'Original 3310', desc: 'Monofônico clássico' },
    { id: 'grave', name: 'Grave / Bass', desc: 'Oitava encorpada' },
    { id: 'agudo', name: 'Agudo / Lead', desc: 'Brilho penetrante' },
    { id: 'radio', name: 'Rádio Lo-Fi', desc: 'Ondas médias e ruído' },
    { id: 'arcade', name: 'Arcade 8-Bit', desc: 'Chiptune crocante' },
    { id: 'polyphonic', name: 'Polifônico', desc: 'Harmonia dupla (Easter Egg)' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 p-3 sm:p-5">
      {/* Top Yard Status HUD */}
      <div className="bg-[#181a1d] border border-[#2d3138] rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3 shadow-xl">
        {/* Day & Atmosphere */}
        <div className="flex items-center gap-3">
          <div className="bg-[#4C7D9E]/20 border border-[#4C7D9E] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-[#4C7D9E] font-bold block">PÁTIO ESCOLAR</span>
            <span className="text-lg font-bold text-white tracking-wider">DIA {day.toString().padStart(2, '0')}</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">O Recreio das Frequências</h1>
            <p className="text-xs text-gray-400">Escute a assinatura dos rivais antes de compor.</p>
          </div>
        </div>

        {/* Rep & Battery Counters */}
        <div className="flex items-center gap-3">
          {/* Reputation */}
          <div className="flex items-center gap-1.5 bg-[#202328] px-3 py-1.5 rounded-xl border border-[#32363e]">
            <Trophy className="w-4 h-4 text-[#D5B84A]" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Reputação</div>
              <div className="text-sm font-bold text-[#D5B84A]">{reputation} PTS</div>
            </div>
          </div>

          {/* Battery */}
          <div className="flex items-center gap-1.5 bg-[#202328] px-3 py-1.5 rounded-xl border border-[#32363e]">
            <BatteryMedium className={`w-4 h-4 ${battery <= 20 ? 'text-[#B84D4D] animate-pulse' : 'text-emerald-400'}`} />
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Bateria</div>
              <div className={`text-sm font-bold ${battery <= 20 ? 'text-[#B84D4D]' : 'text-emerald-400'}`}>
                {battery}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Yard Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Column: Current Duel Face-off Banner */}
        <div className="lg:col-span-8 bg-[#181a1d] border border-[#2d3138] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          {/* School Yard Ambience Overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4C7D9E]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Next Rival Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#D5B84A] uppercase tracking-wider bg-[#D5B84A]/10 px-2.5 py-1 rounded-full border border-[#D5B84A]/30 inline-block mb-1">
                {currentRival.isBoss ? '👑 CONFRONTO FINAL' : `PRÓXIMO DUELO • TIER ${currentRival.tier}`}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{currentRival.name}</h2>
              <p className="text-xs text-gray-400">{currentRival.title}</p>
            </div>

            {/* Completed badge or rivalry marker */}
            <div className="text-right text-xs text-gray-400">
              {completedRivalIds.includes(currentRival.id) ? (
                <span className="text-emerald-400 font-bold">★ JÁ DERROTADO</span>
              ) : (
                <span className="text-[#B84D4D] font-bold">DESAFIO PENDENTE</span>
              )}
            </div>
          </div>

          {/* Rival Profile Box */}
          <div className="bg-[#121417] border border-[#23272d] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 my-2">
            <RivalAvatar rival={currentRival} size="md" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-gray-300 italic mb-2">"{currentRival.dialogueIntro}"</p>
              <div className="text-xs bg-[#1a1d22] p-2.5 rounded-xl border border-[#2a2e36] text-gray-300">
                <span className="font-bold text-white block mb-0.5">Assinatura Sonora:</span>
                <span className="font-mono text-[#D5B84A]">{currentRival.signatureDescription}</span>
              </div>
            </div>
          </div>

          {/* Action Call: Enter Duel */}
          <div className="mt-4 pt-4 border-t border-[#23272d] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-gray-400 text-center sm:text-left">
              <span>{currentRival.weaknessHint}</span>
            </div>

            <button
              id="yard-btn-start-duel"
              type="button"
              onClick={onStartDuel}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#D5B84A] to-[#b3952f] text-black font-bold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>INICIAR DUELO MUSICAL</span>
            </button>
          </div>
        </div>

        {/* Right Column: Shortcuts & Meta Tools */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* O Caderno de Códigos Button */}
          <button
            id="yard-btn-notebook"
            type="button"
            onClick={onOpenNotebook}
            className="p-4 bg-gradient-to-br from-[#faf5eb] to-[#e8decb] text-[#23272d] rounded-2xl shadow-lg border-2 border-[#d5c5ae] hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#23272d] text-[#faf5eb] flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-[#D5B84A]" />
              </div>
              <div>
                <div className="font-handwriting text-lg font-bold leading-none text-[#1b1e22]">O Caderno</div>
                <div className="text-[11px] text-[#555] mt-0.5">Dossiês, pistas & hits secretos</div>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#23272d] text-white px-2 py-1 rounded-lg">ABRIR</span>
          </button>

          {/* 7 Slots Repertório */}
          <button
            id="yard-btn-slots"
            type="button"
            onClick={onOpenSlots}
            className="p-3.5 bg-[#181a1d] border border-[#2d3138] rounded-2xl hover:border-[#D5B84A]/50 transition flex items-center justify-between text-left text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#202328] flex items-center justify-center text-[#D5B84A]">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold">7 Slots de Memória</div>
                <div className="text-[11px] text-gray-400">Repertório de toques salvos</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">7/7</span>
          </button>

          {/* Rádio do Pátio */}
          <button
            id="yard-btn-radio"
            type="button"
            onClick={onOpenRadio}
            className="p-3.5 bg-[#181a1d] border border-[#2d3138] rounded-2xl hover:border-[#4C7D9E]/50 transition flex items-center justify-between text-left text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#202328] flex items-center justify-center text-[#4C7D9E]">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold">Rádio do Pátio</div>
                <div className="text-[11px] text-gray-400">Tabela de toques da escola</div>
              </div>
            </div>
            <span className="text-xs text-[#4C7D9E] font-bold">AO VIVO</span>
          </button>

          {/* Modo Treino */}
          <button
            id="yard-btn-training"
            type="button"
            onClick={onOpenTraining}
            className="p-3.5 bg-[#181a1d] border border-[#2d3138] rounded-2xl hover:border-emerald-500/50 transition flex items-center justify-between text-left text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#202328] flex items-center justify-center text-emerald-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold">Modo Treino</div>
                <div className="text-[11px] text-gray-400">Bateria infinita & laboratório</div>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold">LIVRE</span>
          </button>
        </div>
      </div>

      {/* Bottom Customization & Soundfonts Deck */}
      <div className="bg-[#181a1d] border border-[#2d3138] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        {/* Soundfont Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-gray-400 font-bold flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[#D5B84A]" /> Soundfont:
          </span>
          {soundfonts.map(sf => (
            <button
              key={sf.id}
              type="button"
              onClick={() => onSoundfontChange(sf.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                soundfont === sf.id
                  ? 'bg-[#D5B84A] text-black shadow'
                  : 'bg-[#202328] text-gray-400 hover:text-white'
              }`}
            >
              {sf.name}
            </button>
          ))}
        </div>

        {/* Phone Shell Color Changer */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold">Carcaça:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'classic-grey', bg: 'bg-[#3a3d42]', label: 'Grafite' },
              { id: 'cyan-rebel', bg: 'bg-[#2e536b]', label: 'Azul' },
              { id: 'electric-yellow', bg: 'bg-[#8f7528]', label: 'Amarelo' },
              { id: 'ruby-red', bg: 'bg-[#7a2e2e]', label: 'Rubi' },
            ].map(col => (
              <button
                key={col.id}
                type="button"
                onClick={() => onColorChange(col.id as any)}
                className={`w-5 h-5 rounded-full ${col.bg} border-2 ${
                  phoneColor === col.id ? 'border-white scale-110 shadow' : 'border-transparent opacity-70'
                }`}
                title={col.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
