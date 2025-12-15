"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: any;
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex  gap-1  w-full border-y p-4 divide-x">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="flex-1 divide-x"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="w-full  px-6 py-4">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="text-green-500">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-xl text-muted-foreground">{stat.label}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
