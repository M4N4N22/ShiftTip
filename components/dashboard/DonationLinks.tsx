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
import { Copy, ExternalLink, Eye, EyeOff, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function DonationLinks({
  donationUrl,
  overlayUrl,
}: {
  donationUrl: string;
  overlayUrl: string;
}) {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

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
    link.download = "donation-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 flex items-center gap-1">
      {" "}
      {/* Donation Page */}{" "}
      <div className="gap-1 flex flex-col w-full">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Your Donation Page</CardTitle>
            <CardDescription>
              Share this link with your audience to receive donations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={donationUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(donationUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(donationUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overlay Card */}
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Stream Overlay URL</CardTitle>
            <CardDescription>
              Add as a browser source in OBS for live alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={overlayUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(overlayUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(overlayUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended size: 1920x1080, transparent background
            </p>
          </CardContent>
        </Card>
      </div>
      {/* QR Code Section */}
      <div className="flex flex-col items-center gap-2">
        {!showQR && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 w-60 h-60"
          >
            {showQR ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showQR ? "Hide QR" : "Show QR"}
          </Button>
        )}
        {showQR && (
          <div className="flex flex-col items-center gap-2 ">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG ref={qrRef} value={donationUrl} size={200} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="flex items-center gap-2 mt-2"
            >
              <Download className="w-4 h-4" />
              Download QR
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
