// Data is bundled directly — no runtime fetch needed.
// To update 2026 season data, edit src/data/ipl2026.json and rebuild.
import data from '../data/ipl2026.json';
import type { IPL2026Data } from '../types';

export function useIPL2026() {
  return {
    data: data as IPL2026Data,
    loading: false,
    error: null,
  };
}
