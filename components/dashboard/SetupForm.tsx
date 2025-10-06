"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount } from "wagmi";

interface SetupFormProps {
  streamerName: string;
  setStreamerName: (v: string) => void;
  walletAddress: string;
  setWalletAddress: (v: string) => void;
  donationToken: string;
  setDonationToken: (v: string) => void;
  donationChain: string;
  setDonationChain: (v: string) => void;
  handleSetup: () => void;
}

const supportedTokens = [
  { label: "USDC", value: "usdc" },
  { label: "USDT", value: "usdt" },
  { label: "DAI", value: "dai" },
  { label: "ETH", value: "eth" },
  { label: "BTC", value: "btc" },
  { label: "MATIC", value: "matic" },
  { label: "BNB", value: "bnb" },
  { label: "SOL", value: "sol" },
  { label: "AVAX", value: "avax" },
  { label: "LTC", value: "ltc" },
];

const supportedChains = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Polygon", value: "polygon" },
  { label: "Arbitrum", value: "arbitrum" },
  { label: "Optimism", value: "optimism" },
  { label: "BNB Chain", value: "bnb" },
  { label: "Avalanche", value: "avalanche" },
  { label: "Solana", value: "solana" },
];

export default function SetupForm({
  streamerName,
  setStreamerName,
  walletAddress,
  setWalletAddress,
  donationToken,
  setDonationToken,
  donationChain,
  setDonationChain,
  handleSetup,
}: SetupFormProps) {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address, setWalletAddress]);

  return (
    <Card className="min-w-xl">
      <CardHeader>
        <CardTitle>Setup Your Account</CardTitle>
        <CardDescription>
          Connect your wallet and select how you want to receive donations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Your Streaming Name</Label>
          <Input
            placeholder="YourStreamName"
            value={streamerName}
            onChange={(e) => setStreamerName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Wallet Address</Label>
          <Input
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            readOnly={isConnected}
          />
        </div>

        <div className=" flex gap-3 ">
          <div className="space-y-3 w-1/2">
            <Label>Preferred Donation Token</Label>
            <Select value={donationToken} onValueChange={setDonationToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token..." />
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 w-1/2">
            <Label>Preferred Chain</Label>
            <Select value={donationChain} onValueChange={setDonationChain}>
              <SelectTrigger>
                <SelectValue placeholder="Select chain..." />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSetup}
          className="w-full"
          disabled={
            !walletAddress || !streamerName || !donationToken || !donationChain
          }
        >
          Complete Setup
        </Button>
      </CardContent>
    </Card>
  );
}
