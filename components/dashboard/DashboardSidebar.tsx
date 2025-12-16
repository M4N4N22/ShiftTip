"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartHandshake,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Memberships",
    href: "/dashboard/memberships",
    icon: CreditCard,
  },

  {
    label: "Community",
    href: "/dashboard/community",
    icon: Users,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r px-4 py-6 backdrop-blur-3xl">
      {/* Brand */}
      <div className="mb-10 px-2">
        <h2 className="text-xl font-bold tracking-tight">
          Shift<span className="text-primary">Tip</span>
        </h2>
        <p className="text-xs text-muted-foreground">Creator Dashboard</p>
      </div>

      {/* MENU */}
      <div className="mb-8">
        <p className="mb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">
          Menu
        </p>

        <nav className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/dashboard");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-primary/70 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
