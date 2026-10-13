import React, { useState } from 'react';
import { YardEvent, YardEventChoice } from '../types/game';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { MessageSquare, Sparkles, Check, ArrowRight } from 'lucide-react';

interface EventModalProps {
  event: YardEvent;
  onChoiceSelected: (choice: YardEventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onChoiceSelected,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<YardEventChoice | null>(null);

  const handleSelectChoice = (choice: YardEventChoice) => {
    setSelectedChoice(choice);
    audioEngine.playKeyClick();
    triggerHaptic('confirm');
  };

  const handleConfirm = () => {
    if (selectedChoice) {
      onChoiceSelected(selectedChoice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-[#181a1d] border-2 border-[#D5B84A]/60 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#2d3138] shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#D5B84A]/20 border border-[#D5B84A] text-[#D5B84A] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#D5B84A] font-bold uppercase tracking-wider block">
              EVENTO DO RECREIO
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">{event.title}</h2>
          </div>
        </div>

        {/* Character Bubble */}
        <div className="bg-[#121417] border border-[#25282f] rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-[#D5B84A]">{event.character}:</span>
          <p className="text-xs text-gray-300 leading-relaxed italic">
            "{event.situation}"
          </p>
        </div>

        {/* Choices List or Outcome */}
        {!selectedChoice ? (
          <div className="flex flex-col gap-2.5 my-2">
            <span className="text-xs font-bold text-gray-400">O que você decide fazer?</span>
            {event.choices.map((choice, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                className="p-3.5 bg-[#1e2023] border border-[#2e323a] rounded-2xl text-left hover:border-[#D5B84A] transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#D5B84A] transition flex items-center justify-between">
                  <span>{choice.text}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#D5B84A] transition" />
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {choice.description}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Choice Outcome Screen */
          <div className="flex flex-col gap-3 my-2 animate-in fade-in duration-200">
            <div className="bg-[#1e2023] border border-[#3c414a] rounded-2xl p-4">
              <span className="text-xs font-bold text-[#D5B84A] block mb-1">CONSEQUÊNCIA:</span>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedChoice.outcomeText}
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 bg-gradient-to-r from-[#D5B84A] to-[#b3952f] text-black font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              CONTINUAR PELO PÁTIO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
