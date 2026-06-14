import { useCallback, useEffect, useRef, useState } from 'react';

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

function getCtor(): { new (): SpeechRecognition } | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

// Wraps the browser SpeechRecognition API for continuous Chinese dictation.
// Chrome ends a session after a pause, so we auto-restart while the user is
// still recording to support long thinking sessions.
export function useSpeechRecognition(lang = 'zh-CN'): UseSpeechRecognition {
  const ctor = getCtor();
  const supported = ctor !== null;

  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wantListeningRef = useRef(false);

  useEffect(() => {
    if (!ctor) return;
    const recognition = new ctor();
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
      // "no-speech" / "aborted" are expected during normal use; ignore them.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setInterimText('');
      if (wantListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // start() throws if called too quickly; the next onend retries.
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      wantListeningRef.current = false;
      recognition.onend = null;
      recognition.abort();
    };
  }, [ctor, lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    wantListeningRef.current = true;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      // Already started — ignore.
    }
  }, []);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    setListening(false);
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setFinalText('');
    setInterimText('');
  }, []);

  return { supported, listening, finalText, interimText, error, start, stop, reset };
}
