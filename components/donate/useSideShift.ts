"use client";
import { useEffect, useState } from "react";

export function useSideShift() {
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sideshift.ai/static/js/main.js";
    script.async = true;
    script.onload = () => console.log("SideShift widget loaded ✅");
    document.body.appendChild(script);
  }, []);

  const openAdvancedSwap = (
    selectedToken: string,
    settleToken: string,
    settleChain: string,
    settleAddress: string
  ) => {
    if (!selectedToken) {
      alert("Please select a token first.");
      return;
    }

    const settleMethod = `${settleToken}`.toLowerCase();

    (window as any).__SIDESHIFT__ = {
      parentAffiliateId: "IiPWFUbXev",
      defaultDepositMethodId: settleToken,
      defaultSettleMethodId: "usdc",
      settleAddress:settleAddress,
      type: "variable",
      theme: "dark",
    };

    const sideshift = (window as any).sideshift;
    if (sideshift && typeof sideshift.show === "function") {
      sideshift.show();
    } else {
      console.error("SideShift not initialized yet.");
    }
  };

  const generateDonation = async (
    selectedToken: string,
    amount: string,
    settleToken: string,
    settleChain: string,
    settleAddress: string
  ) => {
    setLoading(true);
    const settleMethod = `${settleToken}${settleChain}`.toLowerCase();

    try {
      const response = await fetch("https://sideshift.ai/api/v2/shifts/fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositMethod: selectedToken,
          settleMethod,
          depositAmount: amount,
          settleAddress,
        }),
      });

      return await response.json();
    } catch (e) {
      console.error("SideShift API error:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateDonation, openAdvancedSwap };
}
