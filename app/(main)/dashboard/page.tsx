"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Wallet } from "lucide-react";

import SetupForm from "@/components/dashboard/SetupForm";
import StatsCards from "@/components/dashboard/StatsCards";
import DonationLinks from "@/components/dashboard/DonationLinks";
import RecentDonations from "@/components/dashboard/RecentDonations";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const [walletAddress, setWalletAddress] = useState("");
  const [streamerName, setStreamerName] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [donationToken, setDonationToken] = useState("");
  const [donationChain, setDonationChain] = useState("");
  const [activeTab, setActiveTab] = useState("settings");
  const [loadingUser, setLoadingUser] = useState(false);

  // ✅ Fetch user data once wallet connects
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) return;
      setLoadingUser(true);
      setWalletAddress(address);

      try {
        const res = await fetch("/api/user/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: address }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("[USER FETCHED]", data);

          if (data?.isCreator && data.name && data.preferredToken && data.preferredChain) {
            setStreamerName(data.name || "");
            setDonationToken(data.preferredToken || "");
            setDonationChain(data.preferredChain || "");
            setIsSetup(true);
            toast.success("Welcome back!");
          } else {
            setIsSetup(false);
          }
        } else {
          setIsSetup(false); // user not found
        }
      } catch (err) {
        console.error("[USER FETCH ERROR]", err);
        toast.error("Failed to fetch user details");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [isConnected, address]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const donationUrl = isSetup
    ? `${baseUrl}/donate?streamer=${encodeURIComponent(
        streamerName
      )}&wallet=${encodeURIComponent(walletAddress)}&token=${encodeURIComponent(
        donationToken
      )}&chain=${encodeURIComponent(donationChain)}`
    : "";
  const overlayUrl = isSetup
    ? `${baseUrl}/overlay?streamer=${encodeURIComponent(streamerName)}`
    : "";

  const stats = [
    { label: "Total Donations", value: "$1,245", change: "+12.5%", icon: TrendingUp },
    { label: "Unique Donors", value: "47", change: "+8", icon: Wallet },
    { label: "This Month", value: "$345", change: "+23%", icon: TrendingUp },
  ];

  const recentDonations = [
    { id: 1, donor: "CryptoFan42", amount: "50", currency: "USDC", token: "ETH", time: "2 mins ago" },
    { id: 2, donor: "Anonymous", amount: "100", currency: "USDC", token: "BTC", time: "15 mins ago" },
    { id: 3, donor: "Web3Supporter", amount: "25", currency: "USDC", token: "MATIC", time: "1 hour ago" },
  ];

  // ✅ Loading state while checking user data
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted-foreground">
        Checking user setup...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container flex justify-center px-4 pt-24 pb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-center">
            {isSetup ? "Manage Your Donations" : "Let's Get Started!"}
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            Manage your crypto donations and track your earnings
          </p>

          {!isSetup ? (
            <SetupForm
              donationChain={donationChain}
              setDonationChain={setDonationChain}
              streamerName={streamerName}
              setStreamerName={setStreamerName}
              donationToken={donationToken}
              setDonationToken={setDonationToken}
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              setIsSetup={setIsSetup}
            />
          ) : (
            <div className="space-y-6 min-w-5xl flex gap-3">
              <StatsCards stats={stats} />

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="links">Donation Links</TabsTrigger>
                  <TabsTrigger value="donations">Recent Donations</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="links">
                  <DonationLinks
                    donationUrl={donationUrl}
                    overlayUrl={overlayUrl}
                  />
                </TabsContent>

                <TabsContent value="donations">
                  <RecentDonations donations={recentDonations} />
                </TabsContent>

                <TabsContent value="settings">
                  <SetupForm
                    donationChain={donationChain}
                    setDonationChain={setDonationChain}
                    streamerName={streamerName}
                    setStreamerName={setStreamerName}
                    donationToken={donationToken}
                    setDonationToken={setDonationToken}
                    walletAddress={walletAddress}
                    setWalletAddress={setWalletAddress}
                    setIsSetup={setIsSetup}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
