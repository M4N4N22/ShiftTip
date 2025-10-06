"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Coins } from "lucide-react";

interface AmountMessageInputProps {
  amount: string;
  setAmount: (amt: string) => void;
  donorName: string;
  setDonorName: (don: string) => void;
  message: string;
  setMessage: (msg: string) => void;
}

export const AmountMessageInput = ({
  amount,
  setAmount,
  donorName,
  setDonorName,
  message,
  setMessage,
}: AmountMessageInputProps) => {
  const [speaking, setSpeaking] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const testMessageTTS = () => {
    if (!message) return;

    const donationPreview = {
      id: Date.now(),
      donor: donorName || "You",
      amount: amount || "0",
      currency: "USD",
      message,
    };

    setShowOverlay(true);

    if ("speechSynthesis" in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `${donationPreview.donor} donated ${donationPreview.amount} dollars! ${
          donationPreview.message ? `They said: ${donationPreview.message}` : ""
        }`
      );

      // Wait until voices are loaded (some browsers delay it)
      const setBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();

        // Try finding a natural English voice (Google or Microsoft)
        const preferred =
          voices.find((v) =>
            v.name.toLowerCase().includes("google us english male")
          ) ||
          voices.find((v) =>
            v.name.toLowerCase().includes("google us english female")
          ) ||
          voices.find((v) => v.name.toLowerCase().includes("google")) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];

        if (preferred) utterance.voice = preferred;
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        // Some browsers need a dummy call to populate voices
        window.speechSynthesis.onvoiceschanged = setBestVoice;
      } else {
        setBestVoice();
      }

      // Slightly faster, more lively tone
      utterance.rate = 1;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      utterance.onend = () => {
        setSpeaking(false);
        setTimeout(() => setShowOverlay(false), 1000);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="space-y-2">
        <Label>Amount (USD equivalent)</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2 relative">
        <Label>Message (Optional)</Label>
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
          {speaking ? "Speaking..." : "Test Overlay"}
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
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary  to-primary blur-xl opacity-60 animate-pulse" />

              <div className="relative bg-background backdrop-blur-lg border-2 border-primary rounded-2xl shadow-2xl p-6 min-w-[400px]">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">
                        {donorName || "You"}
                      </h3>
                      {speaking && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Volume2 className="w-5 h-5 text-accent" />
                        </motion.div>
                      )}
                    </div>

                    <div className="text-3xl font-bold gradient-text mb-2">
                      ${amount || "0"}
                    </div>

                    {message && (
                      <p className="text-sm text-muted-foreground italic">
                        "{message}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
