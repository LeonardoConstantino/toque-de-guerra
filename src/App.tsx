import React, { useEffect, useState } from 'react';
import { Composition, EvaluationResult, GameScreen, NoteItem, Rival, SoundfontType, YardEvent, YardEventChoice } from './types/game';
import { RIVALS_DATABASE } from './data/rivals';
import { YARD_EVENTS_DATABASE } from './data/events';
import { NOTEBOOK_PAGES } from './data/notebook';
import { parseCompositionString } from './services/musicGrammar';
import { audioEngine } from './services/audioEngine';
import { TitleScreen } from './components/TitleScreen';
import { YardView } from './components/YardView';
import { DuelView } from './components/DuelView';
import { FreestyleModal } from './components/FreestyleModal';
import { RepertoireModal } from './components/RepertoireModal';
import { NotebookModal } from './components/NotebookModal';
import { RadioModal } from './components/RadioModal';
import { TrainingModal } from './components/TrainingModal';
import { EventModal } from './components/EventModal';
import { ShutdownScreen } from './components/ShutdownScreen';
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // Game Flow State
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [day, setDay] = useState<number>(1);
  const [battery, setBattery] = useState<number>(100);
  const [reputation, setReputation] = useState<number>(0);
  const [currentRivalIndex, setCurrentRivalIndex] = useState<number>(0);
  const [completedRivalIds, setCompletedRivalIds] = useState<string[]>([]);
  const [duelsWonCount, setDuelsWonCount] = useState<number>(0);

  // 7 Permanent Slots
  const [slots, setSlots] = useState<(Composition | null)[]>([
    null, null, null, null, null, null, null
  ]);

  // Meta Progression
  const [unlockedPageIds, setUnlockedPageIds] = useState<string[]>([
    'p1_rules', 'p2_grammar', 'p8_classics', 'p9_slots', 'p10_battery'
  ]);
  const [soundfont, setSoundfont] = useState<SoundfontType>('original');
  const [phoneColor, setPhoneColor] = useState<'classic-grey' | 'cyan-rebel' | 'electric-yellow' | 'ruby-red'>('classic-grey');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals & Sub-states
  const [activeModal, setActiveModal] = useState<'NONE' | 'NOTEBOOK' | 'SLOTS' | 'RADIO' | 'TRAINING' | 'EVENT'>('NONE');
  const [currentEvent, setCurrentEvent] = useState<YardEvent | null>(null);
  const [pendingSaveNotes, setPendingSaveNotes] = useState<NoteItem[] | null>(null);
  const [pendingRivalBeaten, setPendingRivalBeaten] = useState<string | undefined>(undefined);

  const currentRival = RIVALS_DATABASE[currentRivalIndex % RIVALS_DATABASE.length];

  // Battery drain handler (automatically checks for 0% battery shutdown)
  const handleDrainBattery = (amount: number) => {
    setBattery(prev => {
      const nextVal = Math.max(0, prev - amount);
      if (nextVal <= 0) {
        setScreen('POWER_OFF');
      }
      return nextVal;
    });
  };

  // Start new run
  const handleStartRun = () => {
    setDay(1);
    setBattery(100);
    setReputation(0);
    setCurrentRivalIndex(0);
    setCompletedRivalIds([]);
    setDuelsWonCount(0);
    setScreen('YARD');
    setActiveModal('NONE');
  };

  // Enter Duel
  const handleStartDuel = () => {
    setScreen('COMPOSER'); // in Duel view
  };

  // Duel Won -> Trigger 5-second Freestyle
  const handleDuelWon = (result: EvaluationResult, notes: NoteItem[]) => {
    setReputation(prev => prev + result.reputationGained);
    setDuelsWonCount(prev => prev + 1);

    if (!completedRivalIds.includes(currentRival.id)) {
      setCompletedRivalIds(prev => [...prev, currentRival.id]);
    }

    // Unlock corresponding dossier page in notebook
    const notebookPageMap: Record<string, string> = {
      'bully': 'p3_bully',
      'cdf': 'p4_cdf',
      'emo': 'p5_emo',
      'skater': 'p6_skater_gossip',
      'gossip': 'p6_skater_gossip',
      'metalhead': 'p7_metal_boss',
      'boss': 'p7_metal_boss',
    };
    const targetPageId = notebookPageMap[currentRival.id];
    if (targetPageId && !unlockedPageIds.includes(targetPageId)) {
      setUnlockedPageIds(prev => [...prev, targetPageId]);
    }

    setPendingSaveNotes(notes);
    setPendingRivalBeaten(currentRival.name);
    setScreen('FREESTYLE');
  };

  // Duel Lost -> Decompression
  const handleDuelLost = (result: EvaluationResult) => {
    // Player can retry or go back to yard
    setScreen('YARD');
  };

  // Finish Freestyle -> Prompt to Save to 7 slots
  const handleFinishFreestyle = (notes: NoteItem[]) => {
    setPendingSaveNotes(notes);
    setActiveModal('SLOTS');
    setScreen('YARD');

    // Advance to next event or next rival
    const nextIdx = currentRivalIndex + 1;
    setCurrentRivalIndex(nextIdx);

    // If step 2 or 5, trigger a yard event!
    if (nextIdx === 2 || nextIdx === 5) {
      const eventIdx = nextIdx === 2 ? 0 : 2;
      setCurrentEvent(YARD_EVENTS_DATABASE[eventIdx]);
      setActiveModal('EVENT');
    }

    // Advance day if boss defeated
    if (currentRival.isBoss) {
      setDay(prev => prev + 1);
    }
  };

  // Save composition to slot
  const handleSaveToSlot = (slotIndex: number, comp: Composition) => {
    setSlots(prev => {
      const updated = [...prev];
      updated[slotIndex] = comp;
      return updated;
    });
    setPendingSaveNotes(null);
    setPendingRivalBeaten(undefined);
  };

  // Handle Event Choices
  const handleEventChoice = (choice: YardEventChoice) => {
    if (choice.actionType === 'REPUTATION' && choice.value) {
      setReputation(prev => prev + choice.value!);
      handleDrainBattery(2);
    } else if (choice.actionType === 'BATTERY' && choice.value) {
      setBattery(prev => Math.min(100, prev + choice.value!));
    } else if (choice.actionType === 'RADIO' && choice.value) {
      setReputation(prev => prev + choice.value!);
      handleDrainBattery(3);
    } else if (choice.actionType === 'CODE' && choice.rewardCode) {
      // Unlock bonus page
      if (!unlockedPageIds.includes('p8_classics')) {
        setUnlockedPageIds(prev => [...prev, 'p8_classics']);
      }
    }
    setActiveModal('NONE');
    setCurrentEvent(null);
  };

  // Toggle sound mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  return (
    <div className="min-h-screen w-full bg-[#101214] text-[#e0e4eb] flex flex-col font-display relative overflow-x-hidden">
      {/* Top Universal Sound Toggle & Status Bar */}
      <header className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex justify-between items-center text-xs text-gray-400 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-white">TOQUE DE GUERRA</span>
          <span className="text-[10px] bg-[#22262d] px-2 py-0.5 rounded text-[#D5B84A] font-mono hidden sm:inline-block">
            V1.0 GDD ENGINE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 px-2.5 rounded-lg bg-[#1a1d22] text-gray-400 hover:text-white border border-[#2d3138] transition flex items-center gap-1.5"
            title={isMuted ? 'Desmutar som' : 'Mutar som'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#B84D4D]" /> : <Volume2 className="w-3.5 h-3.5 text-[#D5B84A]" />}
            <span className="text-[11px]">{isMuted ? 'Mudo' : 'Som Ativo'}</span>
          </button>
        </div>
      </header>

      {/* Main View Switcher */}
      <main className="flex-1 w-full flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto">
        {screen === 'TITLE' && (
          <TitleScreen
            onStartGame={handleStartRun}
            onOpenTraining={() => setActiveModal('TRAINING')}
            onOpenNotebook={() => setActiveModal('NOTEBOOK')}
          />
        )}

        {screen === 'YARD' && (
          <YardView
            day={day}
            battery={battery}
            reputation={reputation}
            currentRival={currentRival}
            completedRivalIds={completedRivalIds}
            soundfont={soundfont}
            phoneColor={phoneColor}
            onStartDuel={handleStartDuel}
            onOpenNotebook={() => setActiveModal('NOTEBOOK')}
            onOpenRadio={() => setActiveModal('RADIO')}
            onOpenSlots={() => setActiveModal('SLOTS')}
            onOpenTraining={() => setActiveModal('TRAINING')}
            onSoundfontChange={setSoundfont}
            onColorChange={setPhoneColor}
          />
        )}

        {screen === 'COMPOSER' && (
          <DuelView
            rival={currentRival}
            day={day}
            battery={battery}
            soundfont={soundfont}
            phoneColor={phoneColor}
            onDuelWon={handleDuelWon}
            onDuelLost={handleDuelLost}
            onBackToYard={() => setScreen('YARD')}
            onOpenSlots={() => setActiveModal('SLOTS')}
            onDrainBattery={handleDrainBattery}
          />
        )}

        {screen === 'FREESTYLE' && pendingSaveNotes && (
          <FreestyleModal
            initialNotes={pendingSaveNotes}
            soundfont={soundfont}
            phoneColor={phoneColor}
            onFinishFreestyle={handleFinishFreestyle}
          />
        )}

        {screen === 'POWER_OFF' && (
          <ShutdownScreen
            day={day}
            reputation={reputation}
            duelsWon={duelsWonCount}
            onRestartRun={handleStartRun}
          />
        )}
      </main>

      {/* Modals Layer */}
      {activeModal === 'NOTEBOOK' && (
        <NotebookModal
          unlockedPageIds={unlockedPageIds}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'SLOTS' && (
        <RepertoireModal
          slots={slots}
          soundfont={soundfont}
          pendingSaveNotes={pendingSaveNotes || undefined}
          rivalDefeatedName={pendingRivalBeaten}
          onSaveToSlot={handleSaveToSlot}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'RADIO' && (
        <RadioModal
          playerSlots={slots}
          soundfont={soundfont}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'TRAINING' && (
        <TrainingModal
          soundfont={soundfont}
          phoneColor={phoneColor}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'EVENT' && currentEvent && (
        <EventModal
          event={currentEvent}
          onChoiceSelected={handleEventChoice}
        />
      )}
    </div>
  );
}
