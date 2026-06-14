import { useState } from 'react';
import type { Entry } from '../types';
import { deleteEntry, updateEntry } from '../lib/storage';

interface Props {
  entries: Entry[];
  onChange: () => void;
}

function formatDateTime(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EntryList({ entries, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  if (entries.length === 0) {
    return (
      <div className="panel">
        <p className="muted">还没有记录。去「记录」说点什么吧。</p>
      </div>
    );
  }

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

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
      {entries.map((entry) => (
        <div className="card" key={entry.id}>
          <div className="card-date">{formatDateTime(entry.createdAt)}</div>
          {editingId === entry.id ? (
            <>
              <textarea
                className="draft"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
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
                <button className="ghost small" onClick={() => startEdit(entry)}>
                  编辑
                </button>
                <button className="ghost small danger" onClick={() => remove(entry.id)}>
                  删除
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
