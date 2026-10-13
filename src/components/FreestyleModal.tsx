import React, { useEffect, useState } from 'react';
import { Composition, NoteItem, SoundfontType } from '../types/game';
import { RetroPhone } from './RetroPhone';
import { Sparkles, Music, Clock } from 'lucide-react';

interface FreestyleModalProps {
  initialNotes: NoteItem[];
  soundfont: SoundfontType;
  phoneColor: string;
  onFinishFreestyle: (notes: NoteItem[]) => void;
}

export const FreestyleModal: React.FC<FreestyleModalProps> = ({
  initialNotes,
  soundfont,
  phoneColor,
  onFinishFreestyle,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [bpm, setBpm] = useState<number>(130);
  const [timeLeft, setTimeLeft] = useState<number>(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinishFreestyle(notes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [notes, onFinishFreestyle]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#181a1d] border-2 border-[#D5B84A] rounded-3xl p-3.5 sm:p-5 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
        {/* Freestyle Top Banner */}
        <div className="flex items-center justify-between w-full mb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#D5B84A] font-bold">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>VITÓRIA! MODO FREESTYLE</span>
          </div>

          <div className="flex items-center gap-1 bg-[#D5B84A] text-black font-bold px-2.5 py-1 rounded-xl text-xs shadow animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>0{timeLeft}s</span>
          </div>
        </div>

        <p className="text-xs text-gray-300 mb-3 sm:mb-4 shrink-0">
          O pátio é todo seu! Toque o que quiser livremente antes de salvar nos 7 slots de memória.
        </p>

        {/* Handset in Freestyle Sandbox */}
        <div className="w-full">
          <RetroPhone
            notes={notes}
            bpm={bpm}
            battery={100}
            day={1}
            soundfont={soundfont}
            phoneColor={phoneColor}
            screenTitle="★ FREESTYLE ★"
            onNotesChange={setNotes}
            onBpmChange={setBpm}
            onSubmit={() => onFinishFreestyle(notes)}
            actionButtonLabel="GUARDAR"
          />
        </div>

        <button
          type="button"
          onClick={() => onFinishFreestyle(notes)}
          className="w-full mt-3 sm:mt-4 py-3 bg-gradient-to-r from-[#D5B84A] to-[#b3952f] text-black font-bold text-sm rounded-xl shadow hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
        >
          <Music className="w-4 h-4" />
          <span>AVANÇAR PARA OS 7 SLOTS DE MEMÓRIA</span>
        </button>
      </div>
    </div>
  );
};
