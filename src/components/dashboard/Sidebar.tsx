"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users2,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ["super_admin", "admin", "agent"],
  },
  {
    label: "Properties",
    href: "/admin/properties",
    icon: Home,
    allowedRoles: ["super_admin", "admin", "agent"],
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare,
    allowedRoles: ["super_admin", "admin", "agent"],
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users2,
    allowedRoles: ["super_admin", "admin", "agent"],
  },
  {
    label: "Site Visits",
    href: "/admin/site-visits",
    icon: CalendarCheck,
    allowedRoles: ["super_admin", "admin", "agent"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    allowedRoles: ["super_admin", "admin"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    allowedRoles: ["super_admin"],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  role: UserRole;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(role)
  );

  return (
    <aside className="w-60 min-h-screen bg-[#0B1521] border-r border-white/[0.06] flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-[#C9A96E] rounded-md flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-[#0B1521]" />
        </div>
        <span className="font-serif text-lg font-semibold text-white tracking-tight">
          Homes<span className="text-[#C9A96E]">.</span>
        </span>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] text-[#2A3E52] uppercase tracking-widest font-medium">
          Main Menu
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          // Active if exact match for /admin, or starts-with for sub-routes
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-[#C9A96E]/10 text-[#C9A96E] font-medium"
                  : "text-[#5A7080] hover:text-[#B4C4D3] hover:bg-white/[0.04]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-[#C9A96E]" : "text-[#3A5060] group-hover:text-[#7A9BAE]"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] bg-[#C9A96E]/20 text-[#C9A96E] px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight className="w-3 h-3 text-[#C9A96E] opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — view public site */}
      <div className="p-3 border-t border-white/[0.06]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#3A5060] hover:text-[#7A9BAE] hover:bg-white/[0.04] transition-all"
        >
          <Building2 className="w-4 h-4" />
          <span>View Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
