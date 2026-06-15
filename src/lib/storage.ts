import type { DailySummaries, Entry, ThemeAnalysis } from '../types';

const ENTRIES_KEY = 'tj_entries';
const ANALYSIS_KEY = 'tj_analysis';
const DAILY_KEY = 'tj_dailies';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadEntries(): Entry[] {
  return read<Entry[]>(ENTRIES_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function addEntry(text: string): Entry {
  const entries = read<Entry[]>(ENTRIES_KEY, []);
  const entry: Entry = { id: crypto.randomUUID(), createdAt: Date.now(), text };
  entries.push(entry);
  write(ENTRIES_KEY, entries);
  return entry;
}

export function updateEntry(id: string, text: string): void {
  const entries = read<Entry[]>(ENTRIES_KEY, []);
  const next = entries.map((e) => (e.id === id ? { ...e, text } : e));
  write(ENTRIES_KEY, next);
}

export function deleteEntry(id: string): void {
  const entries = read<Entry[]>(ENTRIES_KEY, []);
  write(ENTRIES_KEY, entries.filter((e) => e.id !== id));
}

export function loadAnalysis(): ThemeAnalysis | null {
  return read<ThemeAnalysis | null>(ANALYSIS_KEY, null);
}

export function saveAnalysis(analysis: ThemeAnalysis): void {
  write(ANALYSIS_KEY, analysis);
}

export function loadDailySummaries(): DailySummaries {
  return read<DailySummaries>(DAILY_KEY, {});
}

export function saveDailySummaries(map: DailySummaries): void {
  write(DAILY_KEY, map);
}
