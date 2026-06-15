import { useState } from 'react';
import type { Settings } from '../types';
import { saveSettings } from '../lib/storage';

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export function SettingsPanel({ settings, onChange }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const next: Settings = { apiKey: apiKey.trim(), model };
    saveSettings(next);
    onChange(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="panel">
      <label className="field">
        <span>Groq API Key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="gsk_..."
          autoComplete="off"
        />
      </label>
      <p className="muted small">
        在 console.groq.com 登录 → API Keys → Create key（免费,不用绑卡,扣不了费）。key
        只存在你这个浏览器里,不会上传到任何服务器。
      </p>

      <label className="field">
        <span>模型（均免费）</span>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="llama-3.3-70b-versatile">Llama 3.3 70B（默认,额度大）</option>
          <option value="qwen/qwen3-32b">Qwen3 32B（中文更细,记录少时用）</option>
        </select>
      </label>

      <div className="row">
        <button className="primary" onClick={save}>
          {saved ? '已保存' : '保存'}
        </button>
      </div>
    </div>
  );
}
