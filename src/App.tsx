import { useState } from 'react';
import type { Entry, Settings, ThemeAnalysis } from './types';
import { loadAnalysis, loadEntries, loadSettings } from './lib/storage';
import { Recorder } from './components/Recorder';
import { EntryList } from './components/EntryList';
import { ThemesView } from './components/ThemesView';
import { SettingsPanel } from './components/Settings';
import './App.css';

type Tab = 'record' | 'history' | 'themes' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'record', label: '记录' },
  { id: 'history', label: '历史' },
  { id: 'themes', label: '主题' },
  { id: 'settings', label: '设置' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('record');
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [analysis, setAnalysis] = useState<ThemeAnalysis | null>(() => loadAnalysis());

  const refreshEntries = () => setEntries(loadEntries());

  return (
    <div className="app">
      <header className="app-header">
        <h1>思考记录</h1>
      </header>

      <main className="app-main">
        {tab === 'record' && <Recorder onSaved={refreshEntries} />}
        {tab === 'history' && <EntryList entries={entries} onChange={refreshEntries} />}
        {tab === 'themes' && (
          <ThemesView
            entries={entries}
            settings={settings}
            analysis={analysis}
            onAnalyzed={setAnalysis}
            onGoToSettings={() => setTab('settings')}
          />
        )}
        {tab === 'settings' && <SettingsPanel settings={settings} onChange={setSettings} />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
