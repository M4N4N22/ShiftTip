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
    <div className="flex flex-col gap-1 min-w-2xs">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="text-green-500">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
