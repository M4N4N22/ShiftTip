"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSideShift } from "./useSideShift";
import { fetchSideShiftTokens } from "@/lib/fetchSideShiftTokens";
import PairRateDisplay from "../checkout/PairRateDisplay";
import TransactionFlow from "./TransactionFlow";
import ShiftConfirmation from "../checkout/ShiftConfirmation";
import { WalletInfo } from "./WalletInfo";
import TokenChainSelector from "../token-selector/TokenChainSelector";
import { AmountInput } from "./AmountInput";
import { AmountMessageInput } from "./AmountMessageInput";
import { motion, AnimatePresence } from "framer-motion";

type TokenBalance = {
  symbol: string;
  chain: string;
  contractAddress: string;
  usdValue: number;
  balance: number;
  decimals?: number;
};

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
  onDonationReady,
  creatorWallet,
  preferredToken,
  preferredChain,
}: DonationFormProps) {
  const { address: donorWallet, isConnected } = useAccount();
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
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [allTokens, setAllTokens] = useState<TokenBalance[]>([]);
  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [step, setStep] = useState<"form" | "confirmation" | "cancelling">(
    "form"
  );

  const { loading } = useSideShift();

  useEffect(() => {
    fetchSideShiftTokens().then(setAllTokens);
  }, []);

  // Auto-cancel shift if user closes or refreshes tab
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (activeShift?.shiftId) {
        try {
          await fetch("/api/shift/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: activeShift.shiftId }),
            keepalive: true, // allow request during unload
          });
          console.log(
            `[AUTO-CANCEL] Shift ${activeShift.shiftId} cancelled on unload`
          );
        } catch {
          console.warn(
            `[AUTO-CANCEL] Failed to cancel shift ${activeShift.shiftId}`
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeShift]);

  const handleContinue = async (shiftData: any) => {
    console.log(
      "[DonationForm] Received shift from PairRateDisplay:",
      shiftData
    );

    // Safely extract shiftId from any shape (flat or nested)
    const shiftId =
      shiftData?.shiftId ||
      shiftData?.id ||
      shiftData?.shift?.shiftId ||
      shiftData?.sideshift?.id;

    if (shiftId) {
      setActiveShift({
        ...shiftData,
        shiftId, // normalized field for consistency
      });
      setStep("confirmation");
      console.log("[DonationForm] Shift ready with ID:", shiftId);
    } else {
      console.error("[DonationForm] Missing shiftId in response:", shiftData);
      alert("Something went wrong. Shift could not be created.");
    }
  };

  const handleReset = async () => {
    if (activeShift?.shiftId) {
      try {
        setStep("cancelling");

        const res = await fetch("/api/shift/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: activeShift.shiftId }),
        });

        const json = await res.json();
        if (!res.ok)
          throw new Error(json.error || "Failed to cancel shift on SideShift");

        console.log("[DonationForm] Shift cancelled:", activeShift.shiftId);
      } catch (err: any) {
        console.error("[DonationForm] Cancel shift error:", err);
      }
    }

    setActiveShift(null);
    setStep("form");
  };

  return (
    <div>
      {/* Smoothly transitioning layout */}
      {/* Transaction flow visualization (optional) */}
      <TransactionFlow
        fromToken={selectedTokenChain?.symbol}
        fromChain={selectedTokenChain?.chain}
        toToken={preferredToken}
        toChain={preferredChain}
        fromAddress={donorWallet || ""}
        toAddress={creatorWallet}
      />
      <motion.div
        layout
        className={`mt-1 grid items-start gap-3 transition-all duration-500 ${
          selectedTokenChain
            ? "md:grid-cols-3 justify-start"
            : "md:grid-cols-2 justify-center mx-auto max-w-5xl"
        }`}
      >
        {/* Left side */}
        <motion.div layout className="gap-1 flex flex-col h-fit">
          <h2 className="text-xl font-semibold text-white bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl shadow-lg">
            Select Token & Chain
          </h2>
          <div className="space-y-4 bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl shadow-lg">
            <TokenChainSelector
              onSelect={(coin, network, balance, usdValue) => {
                setSelectedTokenChain({
                  symbol: coin,
                  chain: network,
                  balance,
                  usdValue,
                  decimals: 18,
                });
              }}
            />
          </div>
        </motion.div>

        {/* Middle side */}
        <motion.div layout className="gap-1 flex flex-col h-fit">
          <h2 className="text-xl font-semibold text-white bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl shadow-lg">
            Enter Name, Amount & Message
          </h2>
          <div className="space-y-6 bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl shadow-lg">
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
                selectedTokenChain?.usdValue && selectedTokenChain?.balance > 0
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
        </motion.div>

        {/* Right side (Review & Send) */}
        <AnimatePresence>
          {selectedTokenChain && (
            <motion.div
              key="review-send"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              className="gap-1 flex flex-col h-fit"
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl shadow-lg">
                {(step === "confirmation" || step === "cancelling") && (
                  <button
                    onClick={step === "cancelling" ? undefined : handleReset}
                    disabled={step === "cancelling"}
                    className={`text-sm px-3 py-1 rounded-full transition-colors ${
                      step === "cancelling"
                        ? "bg-zinc-500/30 text-white/50 cursor-not-allowed"
                        : "bg-zinc-400/10 text-white/50 hover:text-white"
                    }`}
                  >
                    {step === "cancelling" ? "Cancelling..." : "Back"}
                  </button>
                )}

                <h2 className="text-xl font-semibold text-white text-center flex-1">
                  Review & Send
                </h2>
                <div className="w-12" />
              </div>

              {/* Step 1: Pair Rate */}
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

              {/* Step 2: Loading */}
              {step === "confirmation" && !activeShift?.shiftId && (
                <div className="p-6 bg-zinc-500/10 text-white/70 text-sm rounded-3xl text-center">
                  Preparing your shift details...
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === "confirmation" && activeShift?.shiftId && (
                <ShiftConfirmation
                  shiftId={activeShift.shiftId}
                  onComplete={handleReset}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
