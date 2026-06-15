export interface Entry {
  id: string;
  createdAt: number; // epoch ms
  text: string;
}

export interface Settings {
  apiKey: string;
  model: string;
}

export interface ThemeEvolution {
  date: string; // YYYY-MM-DD
  thought: string;
}

export interface Theme {
  title: string;
  summary: string;
  core_view: string;
  evolution: ThemeEvolution[];
  entry_refs?: string[];
  open_questions?: string[];
}

export interface ThemeAnalysis {
  overview: string;
  themes: Theme[];
  analyzedAt: number; // epoch ms
  entryCount: number;
}

export interface DaySummary {
  count: number; // entry count this summary was built from
  text: string;
}

// Keyed by date string YYYY-MM-DD.
export type DailySummaries = Record<string, DaySummary>;
