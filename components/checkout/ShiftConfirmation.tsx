"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Clock, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import { formatExpiry } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ShiftConfirmationProps {
  shiftId: string;
  onComplete?: () => void; // works as "reset" or "cancel"
}

interface ShiftData {
  id: string;
  status: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAddress: string;
  depositMemo?: string;
  depositMin?: string;
  depositMax?: string;
  refundAddress?: string;
  settleAddress: string;
  averageShiftSeconds?: string;
  settleCoinNetworkFee?: string;
  networkFeeUsd?: string;
  createdAt: string;
  expiresAt: string;
  type?: string;
}

export default function ShiftConfirmation({
  shiftId,
  onComplete,
}: ShiftConfirmationProps) {
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Poll SideShift API every few seconds
  useEffect(() => {
    let interval: any;
    const fetchShift = async () => {
      try {
        const res = await fetch(`/api/shift?id=${shiftId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch shift");
        setShift(json);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShift();
    interval = setInterval(fetchShift, 5000); // poll every 5s

    return () => clearInterval(interval);
  }, [shiftId]);

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return (
          <div className="flex items-center gap-2 text-yellow-300">
            <Clock className="w-4 h-4 animate-pulse" /> Waiting for your deposit
          </div>
        );
      case "confirming":
        return (
          <div className="flex items-center gap-2 text-blue-300">
            <Loader2 className="w-4 h-4 animate-spin" /> Confirming on-chain
          </div>
        );
      case "settled":
      case "completed":
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-4 h-4" /> Tip completed successfully
          </div>
        );
      case "refunded":
        return <div className="text-red-400">Deposit refunded or expired</div>;
      default:
        return <div className="text-zinc-400">{status}</div>;
    }
  };

  if (loading)
    return (
      <div className="p-6 bg-zinc-500/10 rounded-3xl text-white flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading shift
        details...
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-zinc-500/10 rounded-3xl text-red-400 text-sm">
        {error}
      </div>
    );

  if (!shift)
    return (
      <div className="p-6 bg-zinc-500/10 rounded-3xl text-white/50 text-sm">
        No shift found.
      </div>
    );

  const qrValue = shift.depositMemo
    ? `${shift.depositAddress}?memo=${shift.depositMemo}`
    : shift.depositAddress;

  // Calculate human-readable ETA
  const avgTime = shift.averageShiftSeconds
    ? Math.round(Number(shift.averageShiftSeconds))
    : null;

  const expiresIn =
    shift.expiresAt &&
    Math.max(
      0,
      Math.floor(
        (new Date(shift.expiresAt).getTime() - new Date().getTime()) / 1000 / 60
      )
    );

  return (
    <div className="relative bg-zinc-500/10 p-6 rounded-3xl backdrop-blur-3xl text-white shadow-lg space-y-5">
      {/* Header + Cancel */}

      {/* QR Code */}
      <div className="flex justify-center p-4 w-fit bg-white rounded-3xl">
        <QRCodeSVG value={qrValue} size={160} />
      </div>

      {/* Deposit Info */}
      <div className="space-y-2 text-sm">
        <div className="text-zinc-400">Send exactly:</div>
        <div className="font-semibold text-lg">
          {shift.depositMin
            ? `${shift.depositMin} – ${shift.depositMax} ${shift.depositCoin}`
            : shift.depositCoin.toUpperCase()}
        </div>
        <div className="text-zinc-400">To address:</div>
        <div className="font-mono text-xs break-all flex gap-2 items-center">
          {shift.depositAddress}
          <button
            onClick={() => handleCopy(shift.depositAddress)}
            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 bg-zinc-500/10 px-3 py-1 rounded-full"
            title="Copy address"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {shift.depositMemo && (
          <>
            <div className="text-zinc-400 mt-1">Memo / Tag:</div>
            <div className="font-mono text-xs text-zinc-200">
              {shift.depositMemo}
            </div>
          </>
        )}
      </div>

      {/* Shift Details Summary */}
      <Accordion type="single" collapsible defaultValue="details">
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="text-sm text-zinc-300 hover:no-underline">
            View Details
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-zinc-500/10 rounded-2xl p-4 space-y-2 text-xs text-zinc-300 mt-2">
              <div className="flex justify-between">
                <span>From:</span>
                <span>
                  {shift.depositCoin.toUpperCase()} on {shift.depositNetwork}
                </span>
              </div>

              <div className="flex justify-between">
                <span>To:</span>
                <span>
                  {shift.settleCoin.toUpperCase()} on {shift.settleNetwork}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Network fee:</span>
                <span>
                  {shift.settleCoinNetworkFee
                    ? `${shift.settleCoinNetworkFee} ${shift.settleCoin}`
                    : "~"}{" "}
                  (~${shift.networkFeeUsd || "?"})
                </span>
              </div>

              {avgTime && (
                <div className="flex justify-between">
                  <span>Avg processing time:</span>
                  <span>{avgTime}s</span>
                </div>
              )}

              {shift?.expiresAt && (
                <div className="flex justify-between text-yellow-300">
                  <span>Expires in:</span>
                  <span>{formatExpiry(shift.expiresAt)}</span>
                </div>
              )}

              {shift.refundAddress && (
                <div className="flex justify-between">
                  <span>Refund address:</span>
                  <span className="text-[10px] break-all">
                    {shortenAddress(shift.refundAddress)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{shift.type || "variable"}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Status */}
      <div className="pt-2 border-t border-zinc-700/40">
        <h4 className="font-semibold text-sm text-zinc-300 mb-1">Status</h4>
        {renderStatus(shift.status)}
      </div>

      {/* Done Button */}
      {shift.status === "settled" || shift.status === "completed" ? (
        <Button
          className="w-full mt-3 rounded-full py-5 text-base font-semibold"
          onClick={onComplete}
        >
          Done
        </Button>
      ) : null}

      {/* Info Footer */}
      <div className="flex items-center gap-2 text-[10px] text-white/50 pt-3 border-t border-zinc-700/40">
        <Info className="w-3 h-3" />
        <span>
          SideShift automatically converts and settles once your deposit is
          confirmed on-chain.
        </span>
      </div>
    </div>
  );
}
