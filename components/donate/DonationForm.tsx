"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSideShift } from "./useSideShift";
import { fetchTokenBalance, TokenBalance } from "@/lib/fetchTokenBalance";
import { fetchSideShiftTokens } from "@/lib/fetchSideShiftTokens";

// Components
import { WalletInfo } from "./WalletInfo";
import { TokenSelector } from "./TokenSelector";
import { AmountMessageInput } from "./AmountMessageInput";

interface DonationFormProps {
  onDonationReady: (
    address: string,
    token: string,
    amount: string,
    chain: string
  ) => void;
  settleAddress: string;
  preferredToken: string;
  preferredChain: string;
}

export default function DonationForm({
  onDonationReady,
  settleAddress,
  preferredToken,
  preferredChain,
}: DonationFormProps) {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [selectedTokenChain, setSelectedTokenChain] =
    useState<TokenBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [allTokens, setAllTokens] = useState<TokenBalance[]>([]);

  const { loading, generateDonation, openAdvancedSwap } = useSideShift();

  useEffect(() => {
    fetchSideShiftTokens().then(setAllTokens);
  }, []);

  useEffect(() => {
    if (!selectedTokenChain || !address) return;

    setLoadingBalance(true);
    fetchTokenBalance(
      address,
      selectedTokenChain.contractAddress,
      selectedTokenChain.chain
    )
      .then((bal: TokenBalance) => setBalances([bal]))
      .catch(console.error)
      .finally(() => setLoadingBalance(false));
  }, [selectedTokenChain, address]);

  const handleGenerate = async () => {
   return alert("In development, will go live in wave2!.");
    //if (!amount || parseFloat(amount) <= 0)
     // return alert("Enter a valid amount.");
   // if (parseFloat(amount) > selectedTokenChain.usdValue)
   //   return alert("You cannot donate more than your wallet balance.");

   // const data = await generateDonation(
   //   selectedTokenChain.symbol,
   //   amount,
   //   preferredToken,
   //   preferredChain,
   //   settleAddress
   // );

 //   const addressOut =
  //    data?.depositAddress || `${selectedTokenChain.symbol}-mock-${Date.now()}`;

  //  onDonationReady(
  //    addressOut,
  //    selectedTokenChain.symbol,
  //    amount,
   //   selectedTokenChain.chain
  //  );
  };

  return (
    <div className="space-y-4">
      <WalletInfo
        address={address}
        donorName={donorName}
        setDonorName={setDonorName}
        isConnected={isConnected}
      />

      <TokenSelector
        selectedTokenChain={selectedTokenChain}
        setSelectedTokenChain={setSelectedTokenChain}
        allTokens={allTokens}
        loading={loading}
        balances={balances}
        loadingBalance={loadingBalance}
      />

      <AmountMessageInput
        donorName={donorName}
        setDonorName={setDonorName}
        amount={amount}
        setAmount={setAmount}
        message={message}
        setMessage={setMessage}
      />

      <Button
        onClick={handleGenerate}
        disabled={loading || !amount || !selectedTokenChain || loadingBalance}
        className="w-full"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Send ShiftTip
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          selectedTokenChain &&
          openAdvancedSwap(
            selectedTokenChain.symbol,
            preferredToken,
            preferredChain,
            settleAddress
          )
        }
      >
        Use Advanced Swap via SideShift
      </Button>
    </div>
  );
}
