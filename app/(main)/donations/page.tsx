"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import OngoingShifts from "@/components/donate/donor/OngoingShifts";

export default function DonationsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-3 text-center">My Donations</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Track your active and past donation shifts in real time
          </p>

          <OngoingShifts />
        </motion.div>
      </div>
    </div>
  );
}
