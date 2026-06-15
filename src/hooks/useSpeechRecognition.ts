import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeech } from '@capacitor-community/speech-recognition';

interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  finalText: string;
  interimText: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const isNative = Capacitor.isNativePlatform();

function getWebCtor(): { new (): SpeechRecognition } | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

// Works two ways:
// - In the browser: Web Speech API (webkitSpeechRecognition), auto-restart for long sessions.
// - In the native iOS app: @capacitor-community/speech-recognition (iOS Speech framework),
//   which ends a session on a pause; we commit that segment and restart while recording.
export function useSpeechRecognition(lang = 'zh-CN'): UseSpeechRecognition {
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wantRef = useRef(false);
  const committedRef = useRef(''); // finalized text (native)
  const segmentRef = useRef(''); // current live segment (native)
  const webRef = useRef<SpeechRecognition | null>(null);

  const webCtor = isNative ? null : getWebCtor();
  const supported = isNative || webCtor !== null;

  // ---- Web Speech API ----
  useEffect(() => {
    if (isNative || !webCtor) return;
    const recognition = new webCtor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) finalChunk += text;
        else interim += text;
      }
      if (finalChunk) setFinalText((prev) => prev + finalChunk);
      setInterimText(interim);
    };
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') setError(event.error);
    };
    recognition.onend = () => {
      setInterimText('');
      if (wantRef.current) {
        try {
          recognition.start();
        } catch {
          // restart throttled; next onend retries
        }
      } else {
        setListening(false);
      }
    };

    webRef.current = recognition;
    return () => {
      wantRef.current = false;
      recognition.onend = null;
      recognition.abort();
    };
  }, [webCtor, lang]);

  // ---- Native iOS speech ----
  useEffect(() => {
    if (!isNative) return;
    const partial = NativeSpeech.addListener('partialResults', (data: { matches?: string[] }) => {
      const seg = data.matches?.[0] ?? '';
      segmentRef.current = seg;
      setInterimText(seg);
    });
    const state = NativeSpeech.addListener(
      'listeningState',
      (data: { status?: string }) => {
        if (data.status !== 'stopped') return;
        if (segmentRef.current) {
          committedRef.current += segmentRef.current;
          setFinalText(committedRef.current);
        }
        segmentRef.current = '';
        setInterimText('');
        if (wantRef.current) {
          NativeSpeech.start({ language: lang, partialResults: true, popup: false }).catch((e) =>
            setError(String(e)),
          );
        } else {
          setListening(false);
        }
      },
    );

    return () => {
      wantRef.current = false;
      void partial.then((h) => h.remove());
      void state.then((h) => h.remove());
      NativeSpeech.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    setError(null);
    wantRef.current = true;
    setListening(true);
    if (isNative) {
      NativeSpeech.requestPermissions()
        .then(() =>
          NativeSpeech.start({ language: lang, partialResults: true, popup: false }),
        )
        .catch((e) => {
          setError(String(e));
          setListening(false);
        });
    } else {
      try {
        webRef.current?.start();
      } catch {
        // already started
      }
    }
  }, [lang]);

  const stop = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    if (isNative) NativeSpeech.stop().catch(() => {});
    else webRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    committedRef.current = '';
    segmentRef.current = '';
    setFinalText('');
    setInterimText('');
  }, []);

  return { supported, listening, finalText, interimText, error, start, stop, reset };
}
