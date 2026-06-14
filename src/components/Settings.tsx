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
        <span>DeepSeek API Key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
        />
      </label>
      <p className="muted small">
        在 platform.deepseek.com 注册并创建 key（新账号送 500 万免费 token，30 天内有效）。key
        只存在你这个浏览器里，不会上传到任何服务器。
      </p>

      <label className="field">
        <span>模型</span>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="deepseek-chat">deepseek-chat（V4 Flash，免费/最便宜）</option>
          <option value="deepseek-v4-flash">deepseek-v4-flash（显式名，7/24 后用这个）</option>
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
