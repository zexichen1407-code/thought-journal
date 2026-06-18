import { useEffect, useRef, useState } from 'react';
import type { DailySummaries, Entry } from '../types';
import { summarizeDay } from '../lib/analyze';
import {
  deleteEntry,
  loadDailySummaries,
  saveDailySummaries,
  updateEntry,
} from '../lib/storage';
import { IconChevron } from './icons';

interface Props {
  entries: Entry[];
  onChange: () => void;
}

interface Day {
  date: string; // YYYY-MM-DD
  entries: Entry[];
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function timeLabel(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function fmtDay(date: string): { title: string; weekday: string; rel: string } {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - dt.getTime()) / 86400000);
  const rel = diff === 0 ? '今天' : diff === 1 ? '昨天' : diff === 2 ? '前天' : '';
  return { title: `${m}月${d}日`, weekday: WEEKDAYS[dt.getDay()], rel };
}

function groupByDay(entries: Entry[]): Day[] {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = dayKey(e.createdAt);
    const arr = map.get(k) ?? [];
    arr.push(e);
    map.set(k, arr);
  }
  return [...map.entries()]
    .map(([date, es]) => ({
      date,
      entries: es.sort((a, b) => a.createdAt - b.createdAt),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest day first
}

export function DayList({ entries, onChange }: Props) {
  const days = groupByDay(entries);
  const [summaries, setSummaries] = useState<DailySummaries>(() => loadDailySummaries());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const generatingRef = useRef(false);

  // Generate any missing/stale day summary, one at a time (avoids rate limits).
  useEffect(() => {
    if (generatingRef.current) return;
    const need = days.find((d) => {
      const s = summaries[d.date];
      return !s || s.count !== d.entries.length;
    });
    if (!need) return;

    generatingRef.current = true;
    summarizeDay(need.entries)
      .then((text) => {
        setSummaries((prev) => {
          const next = { ...prev, [need.date]: { count: need.entries.length, text } };
          saveDailySummaries(next);
          return next;
        });
      })
      .catch(() => {
        /* leave unsummarized; retries when the view changes */
      })
      .finally(() => {
        generatingRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, summaries]);

  if (days.length === 0) {
    return (
      <div className="panel">
        <p className="muted">还没有记录。去「记录」说点什么吧。</p>
      </div>
    );
  }

  const saveEdit = (id: string) => {
    const text = editText.trim();
    if (text) updateEntry(id, text);
    setEditingId(null);
    onChange();
  };

  const remove = (id: string) => {
    if (confirm('删除这条记录？')) {
      deleteEntry(id);
      onChange();
    }
  };

  return (
    <div className="list">
      {days.map((day) => {
        const s = summaries[day.date];
        const open = expanded === day.date;
        const f = fmtDay(day.date);
        return (
          <div className="card" key={day.date}>
            <button
              className="day-head"
              onClick={() => setExpanded(open ? null : day.date)}
            >
              <div className="day-head-top">
                <div className="day-date">
                  {f.title}
                  <span className="day-weekday">{f.weekday}</span>
                  {f.rel && <span className="day-rel">{f.rel}</span>}
                </div>
                <span className="day-count">{day.entries.length} 条</span>
              </div>
              <div className="day-summary">
                {s ? s.text : '小结生成中…'}
              </div>
              <div className="day-toggle">
                <span>{open ? '收起' : '展开详情'}</span>
                <IconChevron size={14} className={open ? 'chev open' : 'chev'} />
              </div>
            </button>

            {open && (
              <div className="day-details">
                {day.entries.map((entry) => (
                  <div className="entry" key={entry.id}>
                    <div className="card-date">{timeLabel(entry.createdAt)}</div>
                    {editingId === entry.id ? (
                      <>
                        <textarea
                          className="draft"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                        />
                        <div className="row">
                          <button className="primary" onClick={() => saveEdit(entry.id)}>
                            保存
                          </button>
                          <button className="ghost" onClick={() => setEditingId(null)}>
                            取消
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="card-text">{entry.text}</div>
                        <div className="row">
                          <button
                            className="ghost small"
                            onClick={() => {
                              setEditingId(entry.id);
                              setEditText(entry.text);
                            }}
                          >
                            编辑
                          </button>
                          <button
                            className="ghost small danger"
                            onClick={() => remove(entry.id)}
                          >
                            删除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
