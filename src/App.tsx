import { useState } from 'react';
import type { Entry, ThemeAnalysis } from './types';
import { loadAnalysis, loadEntries } from './lib/storage';
import { Recorder } from './components/Recorder';
import { DayList } from './components/DayList';
import { ThemesView } from './components/ThemesView';
import './App.css';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5 || h >= 18) return '晚上好';
  if (h < 11) return '早上好';
  return '下午好';
}

function todayLabel(): string {
  const wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${wd[d.getDay()]}`;
}

type Tab = 'record' | 'history' | 'themes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'record', label: '记录' },
  { id: 'history', label: '历史' },
  { id: 'themes', label: '主题' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('record');
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [analysis, setAnalysis] = useState<ThemeAnalysis | null>(() => loadAnalysis());

  const refreshEntries = () => setEntries(loadEntries());

  return (
    <div className="app">
      <header className="app-header">
        <h1>思考记录</h1>
      </header>

      <main className="app-main">
        {tab === 'record' && (
          <>
            <div className="greeting">
              <div className="greeting-date">{todayLabel()}</div>
              <h2>{getGreeting()}</h2>
              <p>今天有什么思考想要记录?</p>
            </div>
            <Recorder onSaved={refreshEntries} />
          </>
        )}
        {tab === 'history' && <DayList entries={entries} onChange={refreshEntries} />}
        {tab === 'themes' && (
          <ThemesView entries={entries} analysis={analysis} onAnalyzed={setAnalysis} />
        )}
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
