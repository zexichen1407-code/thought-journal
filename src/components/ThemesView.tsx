import { useState } from 'react';
import type { Entry, Settings, ThemeAnalysis } from '../types';
import { analyzeThemes } from '../lib/deepseek';
import { saveAnalysis } from '../lib/storage';

interface Props {
  entries: Entry[];
  settings: Settings;
  analysis: ThemeAnalysis | null;
  onAnalyzed: (analysis: ThemeAnalysis) => void;
  onGoToSettings: () => void;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ThemesView({ entries, settings, analysis, onAnalyzed, onGoToSettings }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeThemes(entries, settings.apiKey, settings.model);
      saveAnalysis(result);
      onAnalyzed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!settings.apiKey) {
    return (
      <div className="panel">
        <p>主题分析需要一个 DeepSeek API key。</p>
        <button className="primary" onClick={onGoToSettings}>
          去设置里填 key
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="panel">
        <p className="muted">先去「记录」攒几条想法，再来生成主题分析。</p>
      </div>
    );
  }

  const stale = analysis !== null && analysis.entryCount < entries.length;

  return (
    <div className="themes">
      <div className="panel">
        <div className="row between">
          <button className="primary" onClick={run} disabled={loading}>
            {loading ? '分析中…' : analysis ? '重新分析' : '生成主题分析'}
          </button>
          {analysis && (
            <span className="muted small">
              上次分析 {formatDate(analysis.analyzedAt)}（{analysis.entryCount} 条）
            </span>
          )}
        </div>
        {stale && !loading && (
          <p className="muted small">已有新记录，点「重新分析」更新主题。</p>
        )}
        {error && <div className="error">分析失败：{error}</div>}
      </div>

      {analysis && (
        <>
          {analysis.overview && <div className="overview">{analysis.overview}</div>}
          {analysis.themes.map((theme, i) => (
            <div className="theme-card" key={i}>
              <h3>{theme.title}</h3>
              <p className="theme-summary">{theme.summary}</p>
              <div className="theme-core">
                <span className="tag">核心观点</span>
                {theme.core_view}
              </div>

              {theme.evolution.length > 0 && (
                <div className="timeline">
                  <div className="tag">观点演变</div>
                  {theme.evolution.map((step, j) => (
                    <div className="timeline-step" key={j}>
                      <div className="timeline-date">{step.date}</div>
                      <div className="timeline-text">{step.thought}</div>
                    </div>
                  ))}
                </div>
              )}

              {theme.open_questions && theme.open_questions.length > 0 && (
                <div className="questions">
                  <div className="tag">还没想清楚</div>
                  <ul>
                    {theme.open_questions.map((q, k) => (
                      <li key={k}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
