"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";

import { useSideShift } from "./useSideShift";
import { fetchSideShiftTokens } from "@/lib/fetchSideShiftTokens";

import TokenChainSelector from "../token-selector/TokenChainSelector";
import PairRateDisplay from "../checkout/PairRateDisplay";
import ShiftConfirmation from "../checkout/ShiftConfirmation";

import { WalletInfo } from "./WalletInfo";
import { AmountInput } from "./AmountInput";
import { AmountMessageInput } from "./AmountMessageInput";

type DonateStep = "token" | "details" | "review";

interface DonationFormProps {
  onDonationReady: (
    address: string,
    token: string,
    amount: string,
    chain: string
  ) => void;
  creatorWallet: string;
  preferredToken: string;
  preferredChain: string;
}

export default function DonationForm({
  creatorWallet,
  preferredToken,
  preferredChain,
}: DonationFormProps) {
  const { address: donorWallet, isConnected } = useAccount();
  const { loading } = useSideShift();

  const [currentStep, setCurrentStep] = useState<DonateStep>("token");

  const [selectedTokenChain, setSelectedTokenChain] = useState<{
    symbol: string;
    chain: string;
    balance: number;
    usdValue: number;
    decimals: number;
  } | null>(null);

  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");

  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [step, setStep] = useState<"form" | "confirmation" | "cancelling">(
    "form"
  );

  useEffect(() => {
    fetchSideShiftTokens();
  }, []);

  // Auto-cancel on unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!activeShift?.shiftId) return;

      await fetch("/api/shift/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: activeShift.shiftId }),
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeShift]);

  const handleContinue = (shiftData: any) => {
    const shiftId =
      shiftData?.shiftId || shiftData?.id || shiftData?.shift?.shiftId;

    if (!shiftId) {
      alert("Failed to create shift");
      return;
    }

    setActiveShift({ ...shiftData, shiftId });
    setStep("confirmation");
  };

  const handleReset = async () => {
    if (activeShift?.shiftId) {
      try {
        setStep("cancelling");
        await fetch("/api/shift/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: activeShift.shiftId }),
        });
      } catch {}
    }

    setActiveShift(null);
    setAmount("");
    setMessage("");
    setStep("form");
    setCurrentStep("token");
  };

  const steps = ["Token", "Review"] as const;
  type DonateStep = "token" | "review";

  const stepIndex = currentStep === "token" ? 0 : 1;

  return (
    <div className="w-full min-w-5xl mx-auto">
      {/* Progress */}
      <div className="flex justify-center gap-6 mb-8">
        {steps.map((label, i) => {
          const step = i === 0 ? "token" : "review";
          const canGo =
            step === "token" ||
            (step === "review" && selectedTokenChain && amount);

          return (
            <button
              key={label}
              onClick={() => canGo && setCurrentStep(step)}
              disabled={!canGo}
              className="flex items-center gap-2 disabled:cursor-not-allowed"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${
              i < stepIndex
                ? "bg-primary/70 text-black"
                : i === stepIndex
                ? "bg-white text-black"
                : "bg-white/10 text-white/50"
            }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === stepIndex ? "text-white" : "text-white/50"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="w-full  mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6 bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl">
          <h2 className="text-xl font-semibold text-white"></h2>

          <WalletInfo
            address={donorWallet}
            donorName={donorName}
            setDonorName={setDonorName}
            isConnected={isConnected}
          />

          <AmountInput
            amount={amount}
            setAmount={setAmount}
            selectedToken={selectedTokenChain?.symbol}
            selectedChain={selectedTokenChain?.chain}
            tokenUsdPrice={
              selectedTokenChain
                ? selectedTokenChain.usdValue / selectedTokenChain.balance
                : 0
            }
            tokenBalance={selectedTokenChain?.balance}
          />

          <AmountMessageInput
            donorName={donorName}
            setDonorName={setDonorName}
            message={message}
            setMessage={setMessage}
          />
        </div>
        <AnimatePresence mode="wait">
          {currentStep === "token" && (
            <motion.div
              key="token"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Select Token & Chain
              </h2>

              <TokenChainSelector
                onSelect={(coin, network, balance, usdValue) => {
                  setSelectedTokenChain({
                    symbol: coin,
                    chain: network,
                    balance,
                    usdValue,
                    decimals: 18,
                  });
                  setCurrentStep("review");
                }}
              />
            </motion.div>
          )}

          {currentStep === "review" && selectedTokenChain && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl"
            >
              {step === "form" && (
                <PairRateDisplay
                  fromToken={selectedTokenChain.symbol}
                  fromChain={selectedTokenChain.chain}
                  toToken={preferredToken}
                  toChain={preferredChain}
                  amount={amount}
                  creatorWallet={creatorWallet}
                  donorWallet={donorWallet || ""}
                  refundAddress={donorWallet || ""}
                  onContinue={handleContinue}
                />
              )}

              {step === "confirmation" && !activeShift?.shiftId && (
                <div className="text-center text-white/70">
                  Preparing your shift…
                </div>
              )}

              {step === "confirmation" && activeShift?.shiftId && (
                <ShiftConfirmation
                  shiftId={activeShift.shiftId}
                  onComplete={handleReset}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
