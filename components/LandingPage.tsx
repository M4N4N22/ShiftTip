"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Sparkles,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden ">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/st1.jpg" // your AI-generated 3D-style hero image
            alt="Streaming / Crypto Hero"
            fill
            className="object-cover w-full h-full"
            priority
          />
          {/* Blur / Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-background backdrop-blur-sm"></div>
        </div>

        {/* Centered Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl"
          >
            <h1 className="text-5xl md:text-6xl mb-6 font-medium tracking-tight">
              Boost Your Earnings, Accept Donations in
              <br />
              <span className="text-foreground">
                Any<span className="text-primary "> Crypto</span>, On Any{" "}
                <span className="text-primary "> Chain</span>.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-5xl mx-auto">
              Your viewers can donate in any cryptocurrency on any blockchain,
              and you get paid in your preferred token instantly. Live alerts,
              TTS notifications, and seamless crypto support make engaging your
              audience effortless.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 rounded-3xl bg-primary/10 border-b border-primary"
                >
                  Start Accepting Donations
                </Button>
              </Link>
              <Link href="/donate">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 h-14 rounded-3xl"
                >
                  Make a Test Donation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-32 ">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium  mb-4 ">
              Why Choose{" "}
              <span className="">
                {" "}
                <span className="text-foreground">
                  Shift<span className="text-primary">Tip</span>
                </span>
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most advanced cryptocurrency donation platform for content
              creators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[
              {
                icon: Zap,
                title: "Instant USDC Payouts",
                description:
                  "Accept any cryptocurrency and automatically receive stable USDC payments. No volatility risk.",
              },
              {
                icon: Globe,
                title: "Multi-Token Support",
                description:
                  "Let donors contribute with Bitcoin, Ethereum, or any major cryptocurrency they prefer.",
              },
              {
                icon: Volume2,
                title: "Text-to-Speech Alerts",
                description:
                  "Engage your stream with automated voice announcements for every donation received.",
              },
              {
                icon: Shield,
                title: "Secure & Non-Custodial",
                description:
                  "Your funds, your wallet. We never hold your cryptocurrency or take custody.",
              },
              {
                icon: TrendingUp,
                title: "Live Analytics",
                description:
                  "Track donations in real-time with detailed statistics and performance metrics.",
              },
              {
                icon: Sparkles,
                title: "Customizable Overlays",
                description:
                  "Beautiful donation alerts that integrate seamlessly with OBS and streaming software.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:border-primary transition-all ">
                  <feature.icon className="w-12 h-12 text-primary mb-4 bg-primary/10 rounded-3xl p-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium mb-4">
              Get Started in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-1 max-w-7xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Your Wallet",
                description:
                  "Link your USDC wallet address where you want to receive payouts.",
              },
              {
                step: "02",
                title: "Get Your Donation Link",
                description:
                  "Share your unique donation page with your audience and community.",
              },
              {
                step: "03",
                title: "Start Earning",
                description:
                  "Receive donations in any crypto and get instant USDC with live alerts.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
             
              >
                <Card className="p-6 h-full hover:border-primary transition-all   text-primary mb-4 ">
                  {item.step}

                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Accepting{" "}
              <span className="gradient-text">Crypto Donations?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of streamers earning in stable cryptocurrency
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-12 h-14 ">
                Launch Your Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
