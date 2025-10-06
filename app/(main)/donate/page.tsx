"use client";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import DonateHeader from "@/components/donate/DonateHeader";
import DonationForm from "@/components/donate/DonationForm";
import DonationResult from "@/components/donate/DonationResult";
import { useSearchParams } from "next/navigation";

function DonatePageInner() {
  const searchParams = useSearchParams();
  const streamerName = searchParams.get("streamer") || "Streamer";
  const settleAddress =
    searchParams.get("wallet") || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
  const preferredToken = searchParams.get("token") || "usdc";
  const preferredChain = searchParams.get("chain") || "ethereum";

  const [depositAddress, setDepositAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState(preferredToken);
  const [amount, setAmount] = useState("");

  return (
    <div className="container flex justify-center pt-24 pb-12 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DonateHeader streamerName={streamerName} />

        <Card>
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
            <CardDescription>
              Choose your preferred cryptocurrency and amount
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!depositAddress ? (
              <DonationForm
                settleAddress={settleAddress}
                preferredToken={preferredToken}
                preferredChain={preferredChain}
                onDonationReady={(addr, t, amt) => {
                  setDepositAddress(addr);
                  setSelectedToken(t);
                  setAmount(amt);
                }}
              />
            ) : (
              <DonationResult
                depositAddress={depositAddress}
                amount={amount}
                token={selectedToken}
                onReset={() => setDepositAddress("")}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ShiftTip • Powered by SideShift.ai
        </div>
      </motion.div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Suspense fallback={<div className="text-center pt-24">Loading...</div>}>
        <DonatePageInner />
      </Suspense>
    </div>
  );
}
