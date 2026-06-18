import { useState } from 'react';
import type { ComponentType } from 'react';
import type { Entry, ThemeAnalysis } from './types';
import { loadAnalysis, loadEntries } from './lib/storage';
import { Recorder } from './components/Recorder';
import { DayList } from './components/DayList';
import { ThemesView } from './components/ThemesView';
import { IconMic, IconHistory, IconThemes } from './components/icons';
import { Starfield } from './components/Starfield';
import './App.css';

type IconCmp = ComponentType<{ size?: number; className?: string }>;

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

const TABS: { id: Tab; label: string; Icon: IconCmp }[] = [
  { id: 'record', label: '记录', Icon: IconMic },
  { id: 'history', label: '历史', Icon: IconHistory },
  { id: 'themes', label: '主题', Icon: IconThemes },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('record');
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [analysis, setAnalysis] = useState<ThemeAnalysis | null>(() => loadAnalysis());

  const refreshEntries = () => setEntries(loadEntries());

  return (
    <>
      <Starfield />
      <div className="app">
        <main className="app-main">
          <div className="view" key={tab}>
            {tab === 'record' && (
              <>
                <div className="greeting">
                  <div className="greeting-date">{todayLabel()}</div>
                  <h2>{getGreeting()}</h2>
                  <p>此刻,你在想些什么?</p>
                </div>
                <Recorder onSaved={refreshEntries} />
              </>
            )}
            {tab === 'history' && <DayList entries={entries} onChange={refreshEntries} />}
            {tab === 'themes' && (
              <ThemesView entries={entries} analysis={analysis} onAnalyzed={setAnalysis} />
            )}
          </div>
        </main>

        <nav className="tabbar">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={tab === id ? 'tab active' : 'tab'}
              onClick={() => setTab(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
