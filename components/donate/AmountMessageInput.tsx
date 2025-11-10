"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

interface AmountMessageInputProps {
  donorName: string;
  setDonorName: (name: string) => void;
  message: string;
  setMessage: (msg: string) => void;
}

export function AmountMessageInput({
  donorName,
  setDonorName,
  message,
  setMessage,
}: AmountMessageInputProps) {
  const [speaking, setSpeaking] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const speakFallback = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice =
      window.speechSynthesis
        .getVoices()
        .find((v) => v.name.includes("Google")) || null;
    utterance.onend = () => {
      setSpeaking(false);
      setTimeout(() => setShowOverlay(false), 1000);
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const testMessageTTS = async () => {
    if (!message) return;
    const text = `${donorName || "You"} says: ${message}`;
    setShowOverlay(true);
    setSpeaking(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "en_us_male" }),
      });

      const data = await res.json();
      if (!res.ok || !data.audio) throw new Error("TTS failed");

      const audio = new Audio(data.audio);
      audio.onended = () => {
        setSpeaking(false);
        setTimeout(() => setShowOverlay(false), 1000);
      };
      await audio.play();
    } catch (err) {
      console.warn("Server TTS failed, falling back:", err);
      speakFallback(text);
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="space-y-2 relative">
        <Label>Message <span className="text-white/50">(optional)</span></Label>
        <Textarea
          rows={3}
          placeholder="Say something nice..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          size="sm"
          className="absolute right-2 top-0 flex items-center gap-1"
          onClick={testMessageTTS}
          disabled={!message || speaking}
        >
          <Volume2 className="w-4 h-4" />
          {speaking ? "Speaking..." : "Preview"}
        </Button>
      </div>

      <AnimatePresence>
        {showOverlay && message && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="fixed bottom-8 right-8 pointer-events-none z-50"
          >
            <div className="relative bg-background/70 backdrop-blur-xl border-2 border-primary rounded-2xl shadow-2xl p-6 min-w-[350px]">
              <h3 className="text-lg font-semibold">{donorName || "You"}</h3>
              <p className="italic text-sm text-muted-foreground mt-1">
                "{message}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
