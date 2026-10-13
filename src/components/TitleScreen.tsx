import React from 'react';
import { audioEngine } from '../services/audioEngine';
import { Play, Wrench, BookOpen, Volume2, Sparkles, Music } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenTraining: () => void;
  onOpenNotebook: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenTraining,
  onOpenNotebook,
}) => {
  const handleStart = () => {
    audioEngine.playSchoolBell();
    onStartGame();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center p-3 sm:p-6 select-none my-auto">
      {/* 2000s Handset Visual Pill */}
      <div className="inline-flex items-center gap-2 bg-[#202328] border border-[#343842] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs text-[#D5B84A] font-mono font-bold mb-3 sm:mb-4 shadow-lg animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        <span>RECREIO ESCOLAR • ANO 2000</span>
      </div>

      {/* Main Logo & Positioning Statement */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase mb-2 font-display">
        TOQUE DE GUERRA
      </h1>
      <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-md italic mb-5 sm:mb-8 px-2">
        "Seu celular é sua arma. Seu toque é sua identidade. E a bateria não espera."
      </p>

      {/* Retro LCD Mock Display Preview */}
      <div className="w-full max-w-xs sm:max-w-sm p-2.5 sm:p-3 bg-[#1e2023] rounded-2xl border-2 border-[#121315] shadow-2xl mb-5 sm:mb-8">
        <div className="lcd-screen w-full py-3 sm:py-4 px-3 rounded-lg flex flex-col items-center justify-center gap-1">
          <div className="font-lcd text-xs sm:text-sm text-[#42483d] tracking-widest">[MONO 3310 READY]</div>
          <div className="font-lcd text-xl sm:text-2xl text-[#101112] font-bold tracking-wider">
            ♪ 8c2 8#d2 4e2 8g2 4c3
          </div>
          <div className="font-lcd text-[11px] sm:text-xs text-[#42483d]">
            ESCUTE • COMPONHA • VENÇA
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-2.5 sm:gap-3">
        {/* Start Main Roguelite Run */}
        <button
          id="title-btn-start"
          type="button"
          onClick={handleStart}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#D5B84A] to-[#b8972f] text-black font-bold text-sm sm:text-base rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2.5"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span>ENTRAR NO RECREIO (NOVA RUN)</span>
        </button>

        {/* Practice Training Sandbox */}
        <button
          id="title-btn-training"
          type="button"
          onClick={onOpenTraining}
          className="w-full py-3 sm:py-3.5 bg-[#1e2023] border border-[#30343d] hover:border-emerald-500/50 text-white font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span>LABORATÓRIO DE TREINO (BATERIA ∞)</span>
        </button>

        {/* Open Notebook */}
        <button
          id="title-btn-notebook"
          type="button"
          onClick={onOpenNotebook}
          className="w-full py-2.5 sm:py-3 bg-[#181a1d] border border-[#2d3138] hover:border-[#faf5eb]/50 text-gray-300 hover:text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-[#faf5eb]" />
          <span>O CADERNO DE CÓDIGOS & DOSSIÊS</span>
        </button>
      </div>

      {/* Bottom Footer Credits */}
      <div className="mt-6 sm:mt-8 text-[10px] sm:text-[11px] text-gray-500 font-mono">
        Composição Monofônica sob Restrição • Web Audio API • 7 Slots Permanentes
      </div>
    </div>
  );
};
