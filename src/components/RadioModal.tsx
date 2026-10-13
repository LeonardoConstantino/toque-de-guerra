import React, { useState } from 'react';
import { Composition, SoundfontType } from '../types/game';
import { parseCompositionString } from '../services/musicGrammar';
import { audioEngine } from '../services/audioEngine';
import { Radio, Play, Square, X, Sparkles, TrendingUp, Music } from 'lucide-react';

interface RadioModalProps {
  playerSlots: (Composition | null)[];
  soundfont: SoundfontType;
  onClose: () => void;
}

interface RadioTrack {
  id: string;
  rank: number;
  title: string;
  artist: string;
  notes: string;
  bpm: number;
  votes: number;
}

const SCHOOL_CHART_TRACKS: RadioTrack[] = [
  {
    id: 't1',
    rank: 1,
    title: 'Axel F do 8º Ano',
    artist: 'DJ Beto (Cantina)',
    notes: '8f2 8#g2 8f2 16f2 8#a2 8f2 8#d2',
    bpm: 140,
    votes: 428,
  },
  {
    id: 't2',
    rank: 2,
    title: 'Marcha do Grêmio',
    artist: 'A CDF',
    notes: '8c2 8d2 8e2 8f2 8g2 8a2 4b2 4c3',
    bpm: 130,
    votes: 350,
  },
  {
    id: 't3',
    rank: 3,
    title: 'Drop da Rampa',
    artist: 'O Skatista',
    notes: '16c2 16c2 8e2 16g2 16g2 8c3',
    bpm: 160,
    votes: 312,
  },
  {
    id: 't4',
    rank: 4,
    title: 'Lágrima Monofônica',
    artist: 'O Emo',
    notes: '4.e2 4.d2 2.c2',
    bpm: 90,
    votes: 285,
  },
  {
    id: 't5',
    rank: 5,
    title: 'O Riff Proibido',
    artist: 'O Metaleiro',
    notes: '16#f2 16#a2 16#c3 8#f3',
    bpm: 175,
    votes: 260,
  },
];

export const RadioModal: React.FC<RadioModalProps> = ({
  playerSlots,
  soundfont,
  onClose,
}) => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const handlePlayRadioTrack = async (track: RadioTrack) => {
    if (playingTrackId === track.id) {
      audioEngine.stopAllPlayback();
      setPlayingTrackId(null);
      return;
    }

    setPlayingTrackId(track.id);
    const parsedNotes = parseCompositionString(track.notes);
    await audioEngine.playSequence(
      parsedNotes,
      track.bpm,
      'radio', // play with retro radio lo-fi filter!
      undefined,
      () => setPlayingTrackId(null)
    );
  };

  const handlePlayPlayerTrack = async (comp: Composition) => {
    if (playingTrackId === comp.id) {
      audioEngine.stopAllPlayback();
      setPlayingTrackId(null);
      return;
    }

    setPlayingTrackId(comp.id);
    await audioEngine.playSequence(
      comp.notes,
      comp.bpm,
      'radio',
      undefined,
      () => setPlayingTrackId(null)
    );
  };

  const activePlayerComps = playerSlots.filter((c): c is Composition => c !== null);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-[#181a1d] border-2 border-[#4C7D9E]/60 rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Radio Station Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#2d3138] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4C7D9E]/20 border border-[#4C7D9E] text-[#4C7D9E] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Rádio do Pátio FM 104.5</h2>
                <span className="bg-[#B84D4D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                  NO AR
                </span>
              </div>
              <p className="text-xs text-gray-400">Transmissão clandestina das caixas da cantina</p>
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

        {/* Radio Banner */}
        <div className="bg-[#121417] border border-[#25282f] rounded-2xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <p className="text-xs text-gray-300 italic">
            "Olá pátio! Aqui é o grêmio tocando os toques mais requisitados da semana nos celulares da galera!"
          </p>
        </div>

        {/* Top School Chart list */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#D5B84A] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>TOP HITS DO RECREIO (PARADA DA SEMANA)</span>
          </span>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {SCHOOL_CHART_TRACKS.map(track => {
              const isPlaying = playingTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className="bg-[#1e2023] border border-[#2d3138] rounded-xl p-2.5 flex justify-between items-center gap-2 hover:border-[#4C7D9E]/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 text-center font-mono font-bold text-xs text-[#D5B84A]">
                      #{track.rank}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{track.title}</div>
                      <div className="text-[10px] text-gray-400">{track.artist} • {track.votes} votos</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayRadioTrack(track)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                      isPlaying
                        ? 'bg-[#B84D4D] text-white shadow'
                        : 'bg-[#282b30] text-gray-300 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#4C7D9E]" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Saved Hits on the Radio */}
        <div className="border-t border-[#2d3138] pt-3 flex flex-col gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-[#D5B84A]" />
            <span>SEUS TOQUES SALVOS (TESTAR NA FREQUÊNCIA DA RÁDIO)</span>
          </span>

          {activePlayerComps.length === 0 ? (
            <div className="text-xs text-gray-500 italic p-3 text-center bg-[#121417] rounded-xl">
              Você ainda não salvou toques nos seus 7 slots para transmitir na rádio.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
              {activePlayerComps.map((comp) => {
                const isPlaying = playingTrackId === comp.id;
                return (
                  <div
                    key={comp.id}
                    className="bg-[#121417] border border-[#2a2d33] rounded-xl p-2 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{comp.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{comp.notes.length} notas • {comp.bpm} BPM</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayPlayerTrack(comp)}
                      className="p-1.5 rounded-lg bg-[#202328] text-[#D5B84A] hover:bg-[#2c3038] transition"
                    >
                      {isPlaying ? <Square className="w-3 h-3 text-[#B84D4D]" /> : <Play className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#2d3138]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#202328] hover:bg-[#2c3038] text-white rounded-xl text-xs font-bold transition"
          >
            Fechar Rádio
          </button>
        </div>
      </div>
    </div>
  );
};
