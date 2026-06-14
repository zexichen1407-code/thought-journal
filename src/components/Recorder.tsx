import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { addEntry } from '../lib/storage';

interface Props {
  onSaved: () => void;
}

export function Recorder({ onSaved }: Props) {
  const { supported, listening, finalText, interimText, error, start, stop, reset } =
    useSpeechRecognition('zh-CN');
  const [draft, setDraft] = useState('');
  const consumedRef = useRef(0);

  // Append newly finalized speech to the editable draft without clobbering manual edits.
  useEffect(() => {
    if (finalText.length > consumedRef.current) {
      const delta = finalText.slice(consumedRef.current);
      consumedRef.current = finalText.length;
      setDraft((prev) => prev + delta);
    }
  }, [finalText]);

  const clear = () => {
    stop();
    reset();
    consumedRef.current = 0;
    setDraft('');
  };

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    addEntry(text);
    clear();
    onSaved();
  };

  if (!supported) {
    return (
      <div className="panel">
        <p>当前浏览器不支持语音识别。请用桌面版 Chrome，或在手机上用 Chrome / Safari 打开。</p>
        <p className="muted">你也可以直接在下面手动输入今天的想法。</p>
        <textarea
          className="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="写下今天的想法…"
          rows={6}
        />
        <div className="row">
          <button className="primary" onClick={save} disabled={!draft.trim()}>
            保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="mic-wrap">
        <button
          className={listening ? 'mic recording' : 'mic'}
          onClick={listening ? stop : start}
          aria-label={listening ? '停止录音' : '开始录音'}
        >
          {listening ? '■' : '●'}
        </button>
        <div className="mic-label">{listening ? '正在听…再点一下停止' : '点一下开始说'}</div>
      </div>

      {listening && interimText && <div className="interim">{interimText}</div>}
      {error && <div className="error">语音识别出错：{error}</div>}

      <textarea
        className="draft"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="说话会自动转成文字出现在这里，也可以手动修改…"
        rows={6}
      />

      <div className="row">
        <button className="primary" onClick={save} disabled={!draft.trim()}>
          保存
        </button>
        <button className="ghost" onClick={clear} disabled={!draft && !listening}>
          清空
        </button>
      </div>
    </div>
  );
}
