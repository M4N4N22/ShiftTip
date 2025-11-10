"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner"; // ✅ Add toast
import { formatExpiry } from "@/lib/utils";

type Shift = {
  id: string;
  shiftId: string;
  creatorAddress: string;
  donorAddress: string;
  settleAddress: string;
  amount: number;
  token: string;
  network: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  cancellableAt: string;
};

export default function OngoingShifts() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [copiedShift, setCopiedShift] = useState<string | null>(null);

  // --- Fetch shifts from backend ---
  const fetchShifts = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch("/api/shift/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });
      const data = await res.json();
      if (res.ok) setShifts(data.shifts || []);
    } catch (err) {
      console.error("[ONGOING SHIFTS] Error fetching:", err);
      toast.error("Failed to fetch your donations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [address]);

  // --- Cancel shift handler ---
  const handleCancel = async (shiftId: string) => {
    setCancelling(shiftId);
    try {
      const res = await fetch("/api/shift/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: shiftId }),
      });

      const json = await res.json();

      if (!res.ok) {
        const message =
          json.error?.includes("5 minutes")
            ? "You can only cancel a shift after 5 minutes."
            : json.error || "Failed to cancel shift.";
        toast.error(message);
        throw new Error(message);
      }

      toast.success("Shift cancelled successfully!");
      console.log(`[ONGOING SHIFTS][${shiftId}] Cancelled successfully`);
      await fetchShifts();
    } catch (err: any) {
      console.error(`[ONGOING SHIFTS][${shiftId}] Cancel failed:`, err);
      toast.error(err.message || "Something went wrong while cancelling.");
    } finally {
      setCancelling(null);
    }
  };

  // --- Copy settle address ---
  const handleCopy = async (shiftId: string, address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedShift(shiftId);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopiedShift(null), 1500);
    } catch {
      console.error(`[ONGOING SHIFTS][${shiftId}] Failed to copy address`);
      toast.error("Failed to copy address.");
    }
  };

  // --- Loading state ---
  if (!address)
    return (
      <div className="text-center py-12 text-muted-foreground">
        Connect your wallet to view your donations.
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-white">
        <Loader2 className="animate-spin mr-2" /> Loading donations...
      </div>
    );

  if (shifts.length === 0)
    return (
      <div className="text-center py-12 text-muted-foreground">
        You have no active or past donations yet.
      </div>
    );

  // --- Main render ---
  return (
    <div className="space-y-4 backdrop-blur-3xl border border-white/10 rounded-3xl p-8">
      {shifts.map((shift) => {
        const cancellable = shift.status === "waiting";

        return (
          <div
            key={shift.id}
            className="p-4 rounded-2xl bg-zinc-500/10 backdrop-blur-3xl border-zinc-800 hover:bg-zinc-400/10 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">
                  {shift.amount} {shift.token} on {shift.network}
                </h3>
                <p className="text-sm text-zinc-400">
                  To {shift.creatorAddress.slice(0, 8)}...
                  {shift.creatorAddress.slice(-6)}
                </p>
              </div>

              <div className="text-sm flex items-center gap-2">
                {shift.status === "waiting" && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Clock size={14} /> Waiting
                  </span>
                )}
                {shift.status === "confirming" && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <RefreshCw size={14} /> Confirming
                  </span>
                )}
                {shift.status === "completed" && (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle size={14} /> Completed
                  </span>
                )}
                {shift.status === "cancelled" && (
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle size={14} /> Cancelled
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              Auto expires in {formatExpiry(shift.expiresAt)}
            </div>

            {/* Payment section for "waiting" status */}
            {shift.status === "waiting" && (
              <div className="mt-4 p-4 bg-zinc-500/5 rounded-xl text-sm">
                <p className="text-zinc-300 mb-1">
                  Send{" "}
                  <span className="font-semibold text-white">
                    {shift.amount} {shift.token} on {shift.network}
                  </span>{" "}
                  to:
                </p>

                <div className="flex items-center justify-between bg-zinc-500/10 p-4 rounded-lg">
                  <code className="text-sm text-zinc-400 truncate">
                    {shift.settleAddress}
                  </code>
                  <button
                    onClick={() =>
                      handleCopy(shift.shiftId, shift.settleAddress)
                    }
                    className="ml-2 text-zinc-400 hover:text-white transition"
                    title="Copy address"
                  >
                    {copiedShift === shift.shiftId ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Cancel button */}
            {cancellable && (
              <Button
                size="sm"
                variant="outline"
                disabled={cancelling === shift.shiftId}
                onClick={() => handleCancel(shift.shiftId)}
                className="mt-3 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              >
                {cancelling === shift.shiftId ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" /> Cancel Shift
                  </>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
