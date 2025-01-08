// src/utils/transposeChords.js
import { Transposer } from 'chord-transposer';

export const transposeChords = (chords, semitones) => {
  return Transposer.transpose(chords).up(semitones).toString();
};
