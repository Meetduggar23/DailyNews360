import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Pause, Play, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextToSpeechProps {
  text: string;
  className?: string;
}

type SpeechState = "idle" | "playing" | "paused";

/**
 * Text-to-Speech control for article content.
 * Uses the browser's Web Speech API (no external dependencies).
 */
export function TextToSpeech({ text, className }: TextToSpeechProps) {
  const [state, setState] = useState<SpeechState>("idle");
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || !text) return;

    // If paused, resume
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Strip HTML and create utterance
    const cleanText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to pick a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Natural"),
    );
    const english = voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    else if (english) utterance.voice = english;

    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState("playing");
  }, [text, state]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setState("paused");
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setState("idle");
  }, []);

  if (!supported) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-mist">
        <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
        Speech not supported
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {state === "idle" ? (
        <button
          onClick={speak}
          aria-label="Listen to this article"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          Listen
        </button>
      ) : state === "playing" ? (
        <>
          <button
            onClick={pause}
            aria-label="Pause listening"
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            Pause
          </button>
          <button
            onClick={stop}
            aria-label="Stop listening"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line text-mist transition-colors hover:border-accent hover:text-accent"
          >
            <StopCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={speak}
            aria-label="Resume listening"
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Resume
          </button>
          <button
            onClick={stop}
            aria-label="Stop listening"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line text-mist transition-colors hover:border-accent hover:text-accent"
          >
            <StopCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
