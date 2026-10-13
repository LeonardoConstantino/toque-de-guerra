import { Duration, NoteItem, Octave, Pitch } from '../types/game';

// Standard chromatic semitones from C
const PITCH_SEMITONES: Record<Pitch, number> = {
  'c': 0,
  'd': 2,
  'e': 4,
  'f': 5,
  'g': 7,
  'a': 9,
  'b': 11,
  '-': -1, // rest
};

// Available durations in musical notation
export const DURATIONS: Duration[] = [1, 2, 4, 8, 16, 32];

// Check if pitch allows a sharp per Nokia 3310 specification (E and B cannot have sharps)
export function canHaveSharp(pitch: Pitch): boolean {
  return pitch === 'c' || pitch === 'd' || pitch === 'f' || pitch === 'g' || pitch === 'a';
}

// Generate unique ID for notes
let noteIdCounter = 0;
export function generateNoteId(): string {
  return `n_${Date.now()}_${++noteIdCounter}`;
}

// Calculate precise frequency (Hz) for a given note
// Nokia 3310 Octave 1 corresponds to C4-B4 (middle octave), Octave 2 to C5-B5, Octave 3 to C6-B6
export function getNoteFrequency(pitch: Pitch, sharp: boolean, octave: Octave): number {
  if (pitch === '-') return 0;
  
  let semitone = PITCH_SEMITONES[pitch];
  if (sharp && canHaveSharp(pitch)) {
    semitone += 1;
  }

  // Base octave: Octave 1 begins at C4 (MIDI 60)
  // Octave 2 = MIDI 72 (C5)
  // Octave 3 = MIDI 84 (C6)
  const baseMidi = 48 + (octave * 12);
  const midiNote = baseMidi + semitone;

  // A4 (MIDI 69) is 440Hz
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Convert NoteItem to standard Nokia Composer text display format (e.g. "4c2", "8#d2", "16.g3", "4-")
export function noteToString(note: NoteItem): string {
  if (note.pitch === '-') {
    return `${note.duration}${note.dotted ? '.' : ''}-`;
  }
  const sharpStr = note.sharp ? '#' : '';
  const dotStr = note.dotted ? '.' : '';
  return `${note.duration}${dotStr}${sharpStr}${note.pitch}${note.octave}`;
}

// Format an entire composition array into a readable space-separated string
export function compositionToString(notes: NoteItem[]): string {
  return notes.map(noteToString).join(' ');
}

// Parse a standard Composer string back into NoteItem array
export function parseCompositionString(code: string): NoteItem[] {
  const tokens = code.trim().split(/\s+/).filter(Boolean);
  const result: NoteItem[] = [];

  for (const token of tokens) {
    const parsed = parseNoteToken(token);
    if (parsed) result.push(parsed);
  }

  return result;
}

// Parse individual token like "8#c2", "4.", "16.g3", "4-"
export function parseNoteToken(token: string): NoteItem | null {
  const match = token.toLowerCase().match(/^(\d{1,2})?(\.)?(#)?([cdefgab\-])(\d)?$/);
  if (!match) return null;

  const durationNum = match[1] ? parseInt(match[1], 10) : 4;
  const isDotted = Boolean(match[2]);
  const isSharp = Boolean(match[3]);
  const pitch = match[4] as Pitch;
  const octaveNum = match[5] ? parseInt(match[5], 10) : 2;

  const duration: Duration = ([1, 2, 4, 8, 16, 32].includes(durationNum) ? durationNum : 4) as Duration;
  const octave: Octave = ([1, 2, 3].includes(octaveNum) ? octaveNum : 2) as Octave;

  return {
    id: generateNoteId(),
    pitch,
    sharp: isSharp && canHaveSharp(pitch),
    octave,
    duration,
    dotted: isDotted,
  };
}

// Composer helper actions following authentic 3310 grammar:
// Key 8: reduces duration (doubles the rhythm speed, e.g. 4 -> 8 -> 16 -> 32)
export function decreaseDuration(current: Duration): Duration {
  const idx = DURATIONS.indexOf(current);
  if (idx < DURATIONS.length - 1) {
    return DURATIONS[idx + 1];
  }
  return DURATIONS[0]; // cycle back to 1
}

// Key 9: increases duration (halves the rhythm speed, e.g. 32 -> 16 -> 8 -> 4 -> 2 -> 1)
export function increaseDuration(current: Duration): Duration {
  const idx = DURATIONS.indexOf(current);
  if (idx > 0) {
    return DURATIONS[idx - 1];
  }
  return DURATIONS[DURATIONS.length - 1]; // cycle back to 32
}

// Key *: cycles octave (1 -> 2 -> 3 -> 1)
export function cycleOctave(current: Octave): Octave {
  if (current === 1) return 2;
  if (current === 2) return 3;
  return 1;
}

// Key #: toggles sharp on current note (if allowed)
export function toggleSharp(note: NoteItem): NoteItem {
  if (note.pitch === '-' || !canHaveSharp(note.pitch)) {
    return note;
  }
  return {
    ...note,
    sharp: !note.sharp,
  };
}

// Toggle dot on note
export function toggleDot(note: NoteItem): NoteItem {
  return {
    ...note,
    dotted: !note.dotted,
  };
}

// Calculate the duration in milliseconds for a note given the BPM
export function calculateNoteDurationMs(note: NoteItem, bpm: number): number {
  // Quarter note (duration 4) duration in ms = (60,000 / BPM)
  const quarterNoteMs = 60000 / bpm;
  // duration 1 = 4 quarter notes, duration 2 = 2 quarter notes, duration 4 = 1, duration 8 = 0.5, etc.
  const ratio = 4 / note.duration;
  let durationMs = quarterNoteMs * ratio;
  if (note.dotted) {
    durationMs *= 1.5;
  }
  return durationMs;
}
