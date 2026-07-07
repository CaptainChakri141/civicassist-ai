import { useState, useEffect, useRef } from 'react';

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (err: unknown) => void;
  start: () => void;
  stop: () => void;
}

// Extend Window interface for Web Speech API in TypeScript
interface IWindow extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);


  useEffect(() => {
    const win = window as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    synthesisRef.current = window.speechSynthesis;

    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
      };

      rec.onerror = (err: unknown) => {
        console.error('Speech recognition error:', err);

        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    // Cleanup speech on unmount
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startListening = (lang: string = 'en') => {
    if (!recognitionRef.current) return;
    try {
      if (lang === 'es') recognitionRef.current.lang = 'es-ES';
      else if (lang === 'fr') recognitionRef.current.lang = 'fr-FR';
      else if (lang === 'hi') recognitionRef.current.lang = 'hi-IN';
      else recognitionRef.current.lang = 'en-US';

      setTranscript('');
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Speech recognition start issue:', e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('Speech recognition stop issue:', e);
    }
  };

  const speakText = (text: string, lang: string = 'en') => {
    if (!synthesisRef.current) return;

    // Clear previous speech first
    synthesisRef.current.cancel();

    // Remove markdown elements for cleaner reading
    const cleanText = text
      .replace(/[*#_`~-]/g, '') // remove markdown characters
      .replace(/\[\s?\]/g, '')  // remove empty checkboxes
      .replace(/\[x\]/g, 'checked')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to match voice language
    if (lang === 'es') utterance.lang = 'es-ES';
    else if (lang === 'fr') utterance.lang = 'fr-FR';
    else if (lang === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    setIsSpeaking(false);
  };

  return {
    isListening,
    transcript,
    isSpeaking,
    hasSpeechSupport,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
}
