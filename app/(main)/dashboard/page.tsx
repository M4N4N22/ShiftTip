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

  const [stats, setStats] = useState<any[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch user data once wallet connects
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

          if (
            data?.isCreator &&
            data.name &&
            data.preferredToken &&
            data.preferredChain
          ) {
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

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!isSetup || !walletAddress) return;

      setLoadingStats(true);

      try {
        const res = await fetch("/api/dashboard/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: walletAddress }),
        });

        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();

        // -------------------------
        // Build stats cards
        // -------------------------
        setStats([
          {
            label: "Total Donations",
            value: `$${data.totals.totalDonations.toFixed(2)}`,
            change:
              data.monthly.growthPercent !== null
                ? `${data.monthly.growthPercent.toFixed(1)}%`
                : "—",
            icon: TrendingUp,
          },
          {
            label: "Unique Donors",
            value: data.totals.uniqueDonors.toString(),
            change: `${data.totals.donationCount} donations`,
            icon: Wallet,
          },
          {
            label: "This Month",
            value: `$${data.monthly.thisMonth.toFixed(2)}`,
            change:
              data.monthly.growthPercent !== null
                ? `${data.monthly.growthPercent.toFixed(1)}%`
                : "New",
            icon: TrendingUp,
          },
        ]);

        // -------------------------
        // Recent donations
        // -------------------------
        setRecentDonations(
          data.recentDonations.map((d: any) => ({
            id: d.id,
            donor: d.donorAddress
              ? `${d.donorAddress.slice(0, 6)}...${d.donorAddress.slice(-4)}`
              : "Anonymous",
            amount: d.amount,
            currency: d.token,
            token: d.network,
            time: new Date(d.completedAt).toLocaleString(),
          }))
        );
      } catch (err) {
        console.error("[DASHBOARD_STATS_ERROR]", err);
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [isSetup, walletAddress]);

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

  // oading state while checking user data
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted-foreground">
        Almost there...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full ">
      <div className=" flex w-full items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <h1 className="text-4xl font-semibold mb-2 ">
            {isSetup ? "Manage Your Donations" : "Let's Get Started!"}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Manage your donations and track your earnings
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
            <div className="space-y-6 w-full flex flex-col gap-3 ">
              {loadingStats ? (
                <div className="text-muted-foreground">Loading stats...</div>
              ) : (
                <StatsCards stats={stats} />
              )}

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
                  {loadingStats ? (
                    <div className="text-muted-foreground">
                      Loading donations...
                    </div>
                  ) : (
                    <RecentDonations donations={recentDonations} />
                  )}
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
