import React, { useEffect, useRef, useState } from 'react';
import {
  calculateNoteDurationMs,
  cycleOctave,
  decreaseDuration,
  generateNoteId,
  increaseDuration,
  noteToString,
  toggleDot,
  toggleSharp
} from '../services/musicGrammar';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { Duration, NoteItem, Octave, Pitch, SoundfontType } from '../types/game';
import { Play, Square, Trash2, Volume2, Music, Check, Zap } from 'lucide-react';

interface RetroPhoneProps {
  notes: NoteItem[];
  bpm: number;
  battery: number;
  day: number;
  soundfont: SoundfontType;
  phoneColor?: string;
  isReadOnly?: boolean;
  isPlaying?: boolean;
  playingIndex?: number;
  screenTitle?: string;
  onNotesChange?: (notes: NoteItem[]) => void;
  onBpmChange?: (bpm: number) => void;
  onPlay?: () => void;
  onStop?: () => void;
  onSubmit?: () => void;
  onOpenSlots?: () => void;
  actionButtonLabel?: string;
  actionButtonDisabled?: boolean;
}

export const RetroPhone: React.FC<RetroPhoneProps> = ({
  notes,
  bpm,
  battery,
  day,
  soundfont,
  phoneColor = 'classic-grey',
  isReadOnly = false,
  isPlaying = false,
  playingIndex = -1,
  screenTitle,
  onNotesChange,
  onBpmChange,
  onPlay,
  onStop,
  onSubmit,
  onOpenSlots,
  actionButtonLabel = 'ENVIAR',
  actionButtonDisabled = false,
}) => {
  // Composer internal states for next note creation
  const [currentOctave, setCurrentOctave] = useState<Octave>(2);
  const [currentDuration, setCurrentDuration] = useState<Duration>(4);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(notes.length - 1);
  const noteScrollRef = useRef<HTMLDivElement>(null);

  // Keep selected index in bounds
  useEffect(() => {
    setSelectedIndex(notes.length - 1);
    if (noteScrollRef.current) {
      noteScrollRef.current.scrollLeft = noteScrollRef.current.scrollWidth;
    }
  }, [notes.length]);

  // Adjust audio engine battery degradation on change
  useEffect(() => {
    audioEngine.setBatteryDegradation(battery);
  }, [battery]);

  // Handle Note Input (Key 1 to 7)
  const handleAddNote = (pitch: Pitch) => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    const newNote: NoteItem = {
      id: generateNoteId(),
      pitch,
      sharp: false,
      octave: currentOctave,
      duration: currentDuration,
      dotted: false,
    };

    // Audition the note sound instantly
    audioEngine.playNote(newNote, soundfont, calculateNoteDurationMs(newNote, bpm));

    if (onNotesChange) {
      const updated = [...notes, newNote];
      onNotesChange(updated);
      setSelectedIndex(updated.length - 1);
    }
  };

  // Handle Rest (Key 0)
  const handleAddRest = () => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    const newRest: NoteItem = {
      id: generateNoteId(),
      pitch: '-',
      sharp: false,
      octave: currentOctave,
      duration: currentDuration,
      dotted: false,
    };

    if (onNotesChange) {
      const updated = [...notes, newRest];
      onNotesChange(updated);
      setSelectedIndex(updated.length - 1);
    }
  };

  // Key 8: Decrease Duration (faster rhythm e.g. 4 -> 8 -> 16 -> 32)
  const handleDecreaseDuration = () => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    if (notes.length > 0 && selectedIndex >= 0 && selectedIndex < notes.length) {
      const updated = [...notes];
      const target = updated[selectedIndex];
      const newDur = decreaseDuration(target.duration);
      updated[selectedIndex] = { ...target, duration: newDur };
      setCurrentDuration(newDur);
      if (onNotesChange) onNotesChange(updated);
      audioEngine.playNote(updated[selectedIndex], soundfont);
    } else {
      setCurrentDuration(prev => decreaseDuration(prev));
    }
  };

  // Key 9: Increase Duration (slower rhythm e.g. 32 -> 16 -> 8 -> 4 -> 2 -> 1)
  const handleIncreaseDuration = () => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    if (notes.length > 0 && selectedIndex >= 0 && selectedIndex < notes.length) {
      const updated = [...notes];
      const target = updated[selectedIndex];
      const newDur = increaseDuration(target.duration);
      updated[selectedIndex] = { ...target, duration: newDur };
      setCurrentDuration(newDur);
      if (onNotesChange) onNotesChange(updated);
      audioEngine.playNote(updated[selectedIndex], soundfont);
    } else {
      setCurrentDuration(prev => increaseDuration(prev));
    }
  };

  // Key *: Cycle Octave (1 -> 2 -> 3 -> 1)
  const handleCycleOctave = () => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    const nextOctave = cycleOctave(currentOctave);
    setCurrentOctave(nextOctave);

    if (notes.length > 0 && selectedIndex >= 0 && selectedIndex < notes.length) {
      const updated = [...notes];
      const target = updated[selectedIndex];
      if (target.pitch !== '-') {
        updated[selectedIndex] = { ...target, octave: nextOctave };
        if (onNotesChange) onNotesChange(updated);
        audioEngine.playNote(updated[selectedIndex], soundfont);
      }
    }
  };

  // Key #: Toggle Sharp (#) on C, D, F, G, A
  const handleToggleSharp = () => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    if (notes.length > 0 && selectedIndex >= 0 && selectedIndex < notes.length) {
      const updated = [...notes];
      const target = updated[selectedIndex];
      const toggled = toggleSharp(target);
      updated[selectedIndex] = toggled;
      if (onNotesChange) onNotesChange(updated);
      audioEngine.playNote(toggled, soundfont);
    }
  };

  // Toggle Dot (.)
  const handleToggleDot = () => {
    if (isReadOnly) return;
    audioEngine.playKeyClick();
    triggerHaptic('note');

    if (notes.length > 0 && selectedIndex >= 0 && selectedIndex < notes.length) {
      const updated = [...notes];
      const target = updated[selectedIndex];
      const toggled = toggleDot(target);
      updated[selectedIndex] = toggled;
      if (onNotesChange) onNotesChange(updated);
      audioEngine.playNote(toggled, soundfont);
    }
  };

  // Backspace / Clear
  const handleDeleteLastNote = () => {
    if (isReadOnly || notes.length === 0) return;
    audioEngine.playKeyClick();
    triggerHaptic('error');

    if (onNotesChange) {
      const updated = notes.slice(0, -1);
      onNotesChange(updated);
      setSelectedIndex(updated.length - 1);
    }
  };

  // Cycle BPM (100 -> 120 -> 140 -> 160 -> 180 -> 100)
  const handleCycleBpm = () => {
    if (!onBpmChange) return;
    audioEngine.playKeyClick();
    const bpmSteps = [100, 120, 140, 160, 180];
    const nextIdx = (bpmSteps.indexOf(bpm) + 1) % bpmSteps.length;
    onBpmChange(bpmSteps[nextIdx]);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when user is in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case '1':
          setActiveKey('1');
          handleAddNote('c');
          break;
        case '2':
          setActiveKey('2');
          handleAddNote('d');
          break;
        case '3':
          setActiveKey('3');
          handleAddNote('e');
          break;
        case '4':
          setActiveKey('4');
          handleAddNote('f');
          break;
        case '5':
          setActiveKey('5');
          handleAddNote('g');
          break;
        case '6':
          setActiveKey('6');
          handleAddNote('a');
          break;
        case '7':
          setActiveKey('7');
          handleAddNote('b');
          break;
        case '0':
          setActiveKey('0');
          handleAddRest();
          break;
        case '8':
          setActiveKey('8');
          handleDecreaseDuration();
          break;
        case '9':
          setActiveKey('9');
          handleIncreaseDuration();
          break;
        case '*':
          setActiveKey('*');
          handleCycleOctave();
          break;
        case '#':
          setActiveKey('#');
          handleToggleSharp();
          break;
        case '.':
          setActiveKey('.');
          handleToggleDot();
          break;
        case 'Backspace':
          e.preventDefault();
          setActiveKey('clear');
          handleDeleteLastNote();
          break;
        case ' ':
          e.preventDefault();
          if (isPlaying && onStop) onStop();
          else if (!isPlaying && onPlay) onPlay();
          break;
        case 'Enter':
          e.preventDefault();
          if (onSubmit && !actionButtonDisabled) onSubmit();
          break;
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [notes, currentOctave, currentDuration, selectedIndex, bpm, isPlaying, isReadOnly, actionButtonDisabled]);

  // Battery status bars (5 total)
  const batteryBars = Math.max(0, Math.min(5, Math.ceil(battery / 20)));
  const isBatteryLow = battery <= 20;

  // Phone Shell color variations
  const shellBgClasses: Record<string, string> = {
    'classic-grey': 'bg-gradient-to-b from-[#3a3d42] via-[#282a2e] to-[#1a1b1d] border-[#4a4e54]',
    'cyan-rebel': 'bg-gradient-to-b from-[#2e536b] via-[#1c384d] to-[#122433] border-[#417699]',
    'electric-yellow': 'bg-gradient-to-b from-[#8f7528] via-[#5c4a16] to-[#362b0c] border-[#b89735]',
    'ruby-red': 'bg-gradient-to-b from-[#7a2e2e] via-[#4d1c1c] to-[#2b1010] border-[#9c3d3d]',
  };

  return (
    <div id="retro-phone-container" className="relative w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[360px] mx-auto flex flex-col items-center select-none">
      {/* Top Antenna Stub */}
      <div className="w-5 sm:w-6 h-3 sm:h-4 bg-[#232528] rounded-t-sm border border-b-0 border-[#3a3d42] self-end mr-6 sm:mr-8 shadow-inner" />

      {/* Main Handset Body Shell */}
      <div className={`w-full p-3.5 sm:p-5 rounded-[32px] sm:rounded-[40px] border-4 shadow-2xl ${shellBgClasses[phoneColor] || shellBgClasses['classic-grey']} relative`}>
        {/* Top Speaker Ear Grille */}
        <div className="flex justify-center items-center gap-1.5 mb-2 sm:mb-3">
          <div className="w-2 sm:w-2.5 h-1 bg-[#101112] rounded-full" />
          <div className="w-4 sm:w-5 h-1.5 bg-[#101112] rounded-full shadow-inner" />
          <div className="w-2 sm:w-2.5 h-1 bg-[#101112] rounded-full" />
        </div>

        {/* Model Badge */}
        <div className="text-center text-[9px] sm:text-[10px] tracking-widest text-[#7a818c] font-bold uppercase mb-1.5 sm:mb-2">
          TOQUE DE GUERRA • MONO 3310
        </div>

        {/* Outer LCD Screen Bezel Frame */}
        <div className="p-2 sm:p-3 bg-[#1e2023] rounded-2xl border-2 border-[#121315] shadow-inner mb-3 sm:mb-4">
          {/* Authentic LCD Screen */}
          <div
            className={`lcd-screen w-full h-[135px] sm:h-[160px] rounded-lg p-2 flex flex-col justify-between overflow-hidden relative ${
              isBatteryLow ? 'lcd-battery-critical' : ''
            }`}
          >
            {/* Screen Header Bar */}
            <div className="flex justify-between items-center text-[11px] sm:text-[14px] font-lcd border-b border-[#8e9d7c] pb-0.5 tracking-wider">
              {/* Day / Status Mode */}
              <div className="font-bold flex items-center gap-1">
                <span>{screenTitle || `DIA ${day.toString().padStart(2, '0')}`}</span>
                {isPlaying && (
                  <span className="inline-block w-2 h-2 bg-[#101112] rounded-full animate-ping" />
                )}
              </div>

              {/* Soundfont / BPM indicator */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[12px] opacity-80">{soundfont.toUpperCase()}</span>
                <span className="bg-[#9dae88] px-1 rounded text-[10px] sm:text-[11px] font-bold">{bpm} BPM</span>
              </div>

              {/* Battery Indicator Gauge */}
              <div className="flex items-center gap-0.5">
                <div className="flex gap-[1px] border border-[#101112] p-[1px] rounded-sm">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 sm:w-1.5 h-2 sm:h-2.5 ${
                        i < batteryBars ? 'bg-[#101112]' : 'bg-transparent'
                      } ${isBatteryLow ? 'animate-pulse' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold ml-0.5">{battery}%</span>
              </div>
            </div>

            {/* Note Editor Area / LCD Canvas Area */}
            <div
              ref={noteScrollRef}
              className="flex-1 my-0.5 sm:my-1 overflow-x-auto overflow-y-hidden whitespace-nowrap flex items-center scroll-smooth py-1 px-1"
            >
              {notes.length === 0 ? (
                <div className="w-full text-center text-[15px] sm:text-[18px] font-lcd text-[#42483d] animate-pulse">
                  [DIGITE NOTAS 1-7]
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5 font-lcd text-[18px] sm:text-[22px] tracking-wide text-[#101112]">
                  {notes.map((note, idx) => {
                    const isSelected = idx === selectedIndex;
                    const isCurrentlyPlaying = isPlaying && idx === playingIndex;
                    return (
                      <span
                        key={note.id || idx}
                        onClick={() => !isReadOnly && setSelectedIndex(idx)}
                        className={`cursor-pointer px-0.5 sm:px-1 rounded transition-colors ${
                          isCurrentlyPlaying
                            ? 'bg-[#101112] text-[#B7C6A3] scale-110 font-bold'
                            : isSelected
                            ? 'border-b-2 border-[#101112] bg-[#a8b894]'
                            : 'hover:bg-[#a8b894]'
                        }`}
                      >
                        {noteToString(note)}
                      </span>
                    );
                  })}
                  {/* Blinking insertion cursor */}
                  {!isReadOnly && !isPlaying && (
                    <span className="inline-block w-1.5 sm:w-2 h-4 sm:h-5 bg-[#101112] animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {/* Bottom LCD Status Bar */}
            <div className="flex justify-between items-center text-[11px] sm:text-[13px] font-lcd pt-0.5 border-t border-[#8e9d7c] tracking-wider">
              {/* Note Count & Octave State */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span>NOTAS: {notes.length}/50</span>
                <span className="bg-[#9dae88] px-1 rounded">OIT:{currentOctave}</span>
                <span className="bg-[#9dae88] px-1 rounded">DUR:1/{currentDuration}</span>
              </div>

              {/* Status Hint */}
              <div className="text-[10px] sm:text-[11px] truncate max-w-[100px] sm:max-w-[120px]">
                {isPlaying ? 'TOCANDO...' : isReadOnly ? 'LEITURA' : 'COMPONDO'}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Function Action Keys (Top navigation pill row) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
          {/* Play / Stop Button */}
          <button
            id="phone-btn-play"
            type="button"
            onClick={isPlaying ? onStop : onPlay}
            disabled={notes.length === 0}
            className={`nokia-func-key py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-white transition ${
              notes.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'
            }`}
            title="Ouvir melodia (Espaço)"
          >
            {isPlaying ? (
              <>
                <Square className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#B84D4D]" />
                <span className="text-[8px] sm:text-[9px] mt-0.5">PARAR</span>
              </>
            ) : (
              <>
                <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#D5B84A]" />
                <span className="text-[8px] sm:text-[9px] mt-0.5">OUVIR</span>
              </>
            )}
          </button>

          {/* BPM Tempo Button */}
          <button
            id="phone-btn-tempo"
            type="button"
            onClick={handleCycleBpm}
            className="nokia-func-key py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-white hover:brightness-110"
            title="Ajustar Andamento (BPM)"
          >
            <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#4C7D9E]" />
            <span className="text-[8px] sm:text-[9px] mt-0.5">TEMPO</span>
          </button>

          {/* Delete / Clear Note Button */}
          <button
            id="phone-btn-clear"
            type="button"
            onClick={handleDeleteLastNote}
            disabled={isReadOnly || notes.length === 0}
            className={`nokia-func-key py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-white transition ${
              isReadOnly || notes.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'
            }`}
            title="Apagar última nota (Backspace)"
          >
            <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#B84D4D]" />
            <span className="text-[8px] sm:text-[9px] mt-0.5">LIMPAR</span>
          </button>

          {/* Primary Action Button (Submit / Save) */}
          <button
            id="phone-btn-submit"
            type="button"
            onClick={onSubmit}
            disabled={actionButtonDisabled || notes.length === 0}
            className={`nokia-func-key py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition ${
              actionButtonDisabled || notes.length === 0
                ? 'opacity-40 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-b from-[#3a6e3a] to-[#204020] text-emerald-300 border-emerald-600 hover:brightness-125'
            }`}
            title="Enviar Toque (Enter)"
          >
            <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="text-[8px] sm:text-[9px] mt-0.5">{actionButtonLabel}</span>
          </button>
        </div>

        {/* Nokia 3310 Number Keypad (3x4 Grid) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {/* Key 1: Note C */}
          <button
            id="key-1"
            type="button"
            onClick={() => handleAddNote('c')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '1' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">1</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">c (Dó)</span>
          </button>

          {/* Key 2: Note D */}
          <button
            id="key-2"
            type="button"
            onClick={() => handleAddNote('d')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '2' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">2</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">d (Ré)</span>
          </button>

          {/* Key 3: Note E */}
          <button
            id="key-3"
            type="button"
            onClick={() => handleAddNote('e')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '3' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">3</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">e (Mi)</span>
          </button>

          {/* Key 4: Note F */}
          <button
            id="key-4"
            type="button"
            onClick={() => handleAddNote('f')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '4' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">4</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">f (Fá)</span>
          </button>

          {/* Key 5: Note G */}
          <button
            id="key-5"
            type="button"
            onClick={() => handleAddNote('g')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '5' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">5</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">g (Sol)</span>
          </button>

          {/* Key 6: Note A */}
          <button
            id="key-6"
            type="button"
            onClick={() => handleAddNote('a')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '6' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">6</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">a (Lá)</span>
          </button>

          {/* Key 7: Note B */}
          <button
            id="key-7"
            type="button"
            onClick={() => handleAddNote('b')}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '7' ? 'nokia-key-active' : ''
            }`}
          >
            <span className="text-xs sm:text-base font-bold">7</span>
            <span className="text-[9px] sm:text-[10px] text-[#D5B84A] font-mono font-bold tracking-wider">b (Si)</span>
          </button>

          {/* Key 8: Shorten Duration (acelera) */}
          <button
            id="key-8"
            type="button"
            onClick={handleDecreaseDuration}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '8' ? 'nokia-key-active' : ''
            }`}
            title="Reduzir Duração (8)"
          >
            <span className="text-xs sm:text-base font-bold">8</span>
            <span className="text-[8px] sm:text-[9px] text-[#4C7D9E] font-bold">DUR ⬇ (x2)</span>
          </button>

          {/* Key 9: Lengthen Duration (alonga) */}
          <button
            id="key-9"
            type="button"
            onClick={handleIncreaseDuration}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '9' ? 'nokia-key-active' : ''
            }`}
            title="Aumentar Duração (9)"
          >
            <span className="text-xs sm:text-base font-bold">9</span>
            <span className="text-[8px] sm:text-[9px] text-[#4C7D9E] font-bold">DUR ⬆ (/2)</span>
          </button>

          {/* Key *: Toggle Octave (1..3) */}
          <button
            id="key-star"
            type="button"
            onClick={handleCycleOctave}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '*' ? 'nokia-key-active' : ''
            }`}
            title="Alternar Oitava (*)"
          >
            <span className="text-xs sm:text-base font-bold">*</span>
            <span className="text-[8px] sm:text-[9px] text-[#B84D4D] font-bold">OITAVA ({currentOctave})</span>
          </button>

          {/* Key 0: Rest / Pause (-) */}
          <button
            id="key-0"
            type="button"
            onClick={handleAddRest}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '0' ? 'nokia-key-active' : ''
            }`}
            title="Pausa / Silêncio (0)"
          >
            <span className="text-xs sm:text-base font-bold">0</span>
            <span className="text-[8px] sm:text-[9px] text-gray-300 font-bold">PAUSA (-)</span>
          </button>

          {/* Key #: Toggle Sharp (#) */}
          <button
            id="key-hash"
            type="button"
            onClick={handleToggleSharp}
            disabled={isReadOnly}
            className={`nokia-key py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white ${
              activeKey === '#' ? 'nokia-key-active' : ''
            }`}
            title="Sustenido (#)"
          >
            <span className="text-xs sm:text-base font-bold">#</span>
            <span className="text-[8px] sm:text-[9px] text-[#6B4C9E] font-bold">SUSTENIDO (#)</span>
          </button>
        </div>

        {/* Bottom Mic & Quick Slots Trigger */}
        <div className="flex justify-between items-center mt-2.5 sm:mt-3 pt-2 border-t border-[#23262a] text-[9px] sm:text-[10px] text-gray-400">
          <button
            type="button"
            onClick={onOpenSlots}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Music className="w-3 h-3 text-[#D5B84A]" />
            <span>7 SLOTS REPERTÓRIO</span>
          </button>

          <button
            type="button"
            onClick={handleToggleDot}
            disabled={isReadOnly}
            className="flex items-center gap-1 hover:text-white transition px-2 py-0.5 bg-[#1e2023] rounded border border-[#303338]"
            title="Ponto de Aumento (.)"
          >
            <span className="font-bold">PONTO (.)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
