import { useEffect, useState } from 'react';
import type { Entry, ThemeAnalysis } from '../types';
import { analyzeThemes } from '../lib/analyze';
import { saveAnalysis } from '../lib/storage';

interface Props {
  entries: Entry[];
  analysis: ThemeAnalysis | null;
  onAnalyzed: (analysis: ThemeAnalysis) => void;
}

export function ThemesView({ entries, analysis, onAnalyzed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the last 7 days — "最近的状态".
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => e.createdAt >= since);
  const upToDate = analysis !== null && analysis.entryCount === recent.length;

  const run = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeThemes(recent);
      saveAnalysis(result);
      onAnalyzed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on open when the last-7-day records changed.
  useEffect(() => {
    if (recent.length === 0 || loading || upToDate) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recent.length]);

  if (recent.length === 0) {
    return (
      <div className="panel">
        <p className="muted">近 7 天还没有记录。去「记录」说点什么吧。</p>
      </div>
    );
  }

  return (
    <div className="themes">
      <div className="panel">
        <div className="row between">
          <div>
            <strong>近 7 天状态</strong>
            <div className="muted small">基于最近 7 天的 {recent.length} 条记录</div>
          </div>
          <button className="ghost small" onClick={run} disabled={loading}>
            {loading ? '分析中…' : '刷新'}
          </button>
        </div>
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
