import { useEffect, useRef, useState } from "react";

// Minimal shape of the Web Speech API - not in standard TS lib.dom types.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Browser-native voice-to-text (Chrome's Web Speech API - it sends audio to
 * Google's speech service, so it needs an internet connection and only
 * works in Chromium browsers; there is no offline fallback). `supported`
 * is false anywhere else, and callers must hide the voice UI rather than
 * show a button that silently does nothing.
 */
export function useSpeechRecognition(language: string, onFinalResult: (text: string) => void) {
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  function start() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    setError(null);
    setInterimTranscript("");
    const recognition = new Ctor();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          onFinalResultRef.current(r[0].transcript);
        } else {
          interim += r[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };
    recognition.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Microphone access was denied." : `Voice input error: ${e.error}`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { supported, listening, interimTranscript, error, start, stop };
}
