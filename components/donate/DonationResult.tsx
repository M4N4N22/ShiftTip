"use client";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";

export default function DonationResult({
  depositAddress,
  amount,
  token,
  onReset,
}: {
  depositAddress: string;
  amount: string;
  token: string;
  onReset: () => void;
}) {
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-6 text-center p-6 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        Send {amount} {token.toUpperCase()}
      </h3>
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG value={depositAddress} size={200} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Deposit Address</Label>
        <div className="flex gap-2">
          <Input value={depositAddress} readOnly className="font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={() => copyToClipboard(depositAddress)}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button variant="outline" className="w-full mt-4" onClick={onReset}>
        Make Another Donation
      </Button>
    </div>
  );
}
