"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function MembershipShare({
  subscribeUrl,
}: {
  subscribeUrl: string;
}) {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);

  const copyToClipboard = (text: string) =>
    navigator.clipboard.writeText(text);

  const downloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "membership-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4">
      {/* LEFT: LINK CARD */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Membership Link</CardTitle>
          <CardDescription>
            Share this link with your audience to subscribe
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={subscribeUrl} readOnly />

            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(subscribeUrl)}
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(subscribeUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Works on mobile, desktop, and social bio links
          </p>
        </CardContent>
      </Card>

      {/* RIGHT: QR SECTION */}
      <div className="flex flex-col items-center gap-2">
        {!showQR && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQR(true)}
            className="flex gap-2 w-56 h-56"
          >
            <Eye className="w-4 h-4" />
            Show QR
          </Button>
        )}

        {showQR && (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                ref={qrRef}
                value={subscribeUrl}
                size={200}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(false)}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Hide
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
