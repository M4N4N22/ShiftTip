"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Coins } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Donation {
  id: number;
  donor: string;
  amount: string;
  currency: string;
  message: string;
}

export default function overlay() {
  const searchParams = useSearchParams();
  const streamerName = searchParams.get("streamer") || "Streamer";

  const [currentDonation, setCurrentDonation] = useState<Donation | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const mockDonations: Donation[] = [
      {
        id: 1,
        donor: "CryptoFan42",
        amount: "50",
        currency: "USDC",
        message: "Love your content! Keep it up!",
      },
      {
        id: 2,
        donor: "Anonymous",
        amount: "100",
        currency: "USDC",
        message: "Here's a donation to support you!",
      },
      {
        id: 3,
        donor: "Web3Supporter",
        amount: "25",
        currency: "USDC",
        message: "Amazing stream today!",
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      const donation = mockDonations[index % mockDonations.length];
      setCurrentDonation(donation);
      speakDonation(donation);
      index++;

      // Clear after 8 seconds
      setTimeout(() => {
        setCurrentDonation(null);
      }, 8000);
    }, 15000); // Show new donation every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const speakDonation = (donation: Donation) => {
    if ("speechSynthesis" in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `${donation.donor} donated ${donation.amount} dollars! ${
          donation.message ? `They said: ${donation.message}` : ""
        }`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      <AnimatePresence>
        {currentDonation && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-xl opacity-60 animate-pulse" />

              {/* Main card */}
              <div className="relative bg-card/95 backdrop-blur-lg border-2 border-primary rounded-2xl shadow-2xl p-6 min-w-[400px]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">
                        {currentDonation.donor}
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
                      ${currentDonation.amount}
                    </div>

                    {currentDonation.message && (
                      <p className="text-sm text-muted-foreground italic">
                        "{currentDonation.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)",
                  }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling coins animation */}
      <AnimatePresence>
        {currentDonation && (
          <>
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`coin-${currentDonation.id}-${i}`}
                initial={{
                  opacity: 1,
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: 360 * 3,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: "easeIn",
                  delay: i * 0.1,
                }}
                className="absolute pointer-events-none"
              >
                <Coins className="w-6 h-6 text-primary opacity-60" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
