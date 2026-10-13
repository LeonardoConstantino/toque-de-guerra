import React, { useEffect, useState } from 'react';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { RotateCcw, BatteryWarning } from 'lucide-react';

interface ShutdownScreenProps {
  day: number;
  reputation: number;
  duelsWon: number;
  onRestartRun: () => void;
}

export const ShutdownScreen: React.FC<ShutdownScreenProps> = ({
  day,
  reputation,
  duelsWon,
  onRestartRun,
}) => {
  const [fadeState, setFadeState] = useState<'dying' | 'blackout' | 'summary'>('dying');

  useEffect(() => {
    // Phase 1: Dying buzz and contrast collapse
    audioEngine.playPowerOffSound();
    triggerHaptic('error');

    const timer1 = setTimeout(() => {
      setFadeState('blackout');
    }, 1200);

    const timer2 = setTimeout(() => {
      setFadeState('summary');
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] z-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-y-auto">
      {fadeState === 'dying' && (
        <div className="flex flex-col items-center gap-3 animate-pulse my-auto">
          <div className="w-16 h-10 border-2 border-gray-600 rounded flex items-center justify-center">
            <span className="font-lcd text-xs text-gray-400">0%</span>
          </div>
          <span className="font-lcd text-lg text-gray-500 tracking-widest">DESLIGANDO...</span>
        </div>
      )}

      {fadeState === 'blackout' && (
        <div className="text-gray-600 font-mono text-sm tracking-widest animate-pulse my-auto">
          ...
        </div>
      )}

      {fadeState === 'summary' && (
        <div className="max-w-md w-full flex flex-col items-center gap-4 sm:gap-5 animate-in fade-in duration-1000 my-auto py-4">
          {/* Shutdown Icon */}
          <div className="w-16 h-16 rounded-3xl bg-[#1a1c1f] border border-[#2b2f36] flex items-center justify-center text-gray-500 shadow-xl">
            <BatteryWarning className="w-8 h-8 text-[#B84D4D]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">O RECREIO ACABOU.</h1>
            <p className="text-xs text-gray-400 mt-1">A bateria do seu aparelho chegou ao fim.</p>
          </div>

          {/* Run Statistics Summary */}
          <div className="w-full bg-[#141619] border border-[#262a30] rounded-2xl p-4 flex flex-col gap-3 text-left">
            <span className="text-[11px] font-bold text-[#D5B84A] uppercase tracking-wider">
              REGISTRO DO DIA • RESUMO DA RUN
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#1c1f24] p-2.5 rounded-xl border border-[#2f343d]">
                <span className="text-gray-500 block text-[10px]">DIA ATINGIDO:</span>
                <span className="text-white font-bold text-sm">Dia {day.toString().padStart(2, '0')}</span>
              </div>
              <div className="bg-[#1c1f24] p-2.5 rounded-xl border border-[#2f343d]">
                <span className="text-gray-500 block text-[10px]">DUELOS VENCIDOS:</span>
                <span className="text-white font-bold text-sm">{duelsWon} vitórias</span>
              </div>
            </div>

            <div className="bg-[#1c1f24] p-2.5 rounded-xl border border-[#2f343d] flex justify-between items-center text-xs">
              <span className="text-gray-400">Reputação Conquistada no Pátio:</span>
              <span className="text-[#D5B84A] font-bold text-sm font-mono">{reputation} PTS</span>
            </div>
          </div>

          {/* Restart / New Day button */}
          <button
            id="shutdown-btn-restart"
            type="button"
            onClick={() => {
              audioEngine.playSchoolBell();
              onRestartRun();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-[#faf5eb] to-[#e6decb] text-[#141619] font-bold text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NOVO DIA DE AULA (NOVA RUN)</span>
          </button>
        </div>
      )}
    </div>
  );
};
