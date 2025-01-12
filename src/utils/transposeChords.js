// src/utils/transposeChords.js
import { Transposer } from 'chord-transposer';

// Notas em ordem cromática
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALTERNATIVE_NOTES = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

// Converte nota alternativa para padrão (ex: Bb -> A#)
const normalizeNote = (note) => {
  const baseNote = note.replace('m', '');
  const isMinor = note.includes('m');
  const normalized = ALTERNATIVE_NOTES[baseNote] || baseNote;
  return normalized + (isMinor ? 'm' : '');
};

// Calcula a diferença em semitons entre duas notas
const getSemitones = (fromNote, toNote) => {
  const from = normalizeNote(fromNote.replace('m', ''));
  const to = normalizeNote(toNote.replace('m', ''));
  
  const fromIndex = NOTES.indexOf(from);
  const toIndex = NOTES.indexOf(to);
  
  if (fromIndex === -1 || toIndex === -1) return 0;
  
  let semitones = toIndex - fromIndex;
  if (semitones < 0) semitones += 12;
  
  // Se ambas as notas são menores ou maiores, mantém a diferença
  // Se uma é menor e outra maior, ajusta conforme necessário
  const fromIsMinor = fromNote.includes('m');
  const toIsMinor = toNote.includes('m');
  if (fromIsMinor !== toIsMinor) {
    semitones = (semitones + 3) % 12;
  }
  
  return semitones;
};

// Gera lista de todos os tons possíveis a partir de um tom original
const getAllKeys = (originalKey) => {
  const baseNote = normalizeNote(originalKey.replace('m', ''));
  const isMinor = originalKey.includes('m');
  const startIndex = NOTES.indexOf(baseNote);
  
  if (startIndex === -1) return [];
  
  return NOTES.map((note, index) => {
    const semitones = (index - startIndex + 12) % 12;
    const displayNote = note + (isMinor ? 'm' : '');
    const difference = semitones === 0 ? '' : ` (${semitones > 6 ? semitones - 12 : semitones > 0 ? '+' + semitones : semitones})`;
    return {
      note: displayNote,
      semitones,
      display: displayNote + difference
    };
  });
};

export { normalizeNote, getSemitones, getAllKeys };

// Função original de transposição
export const transposeChords = (chords, semitones) => {
  return Transposer.transpose(chords).up(semitones).toString();
};
