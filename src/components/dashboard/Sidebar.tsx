"use client";

import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
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
    <aside className="w-60 min-h-screen bg-background border-r border-border flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border">
        <Link href="/admin" className="block w-36 h-auto relative">
          <Image
            src="/homes/Homes-Logo.webp"
            alt="Homes Logo"
            width={160}
            height={50}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
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
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight className="w-3 h-3 text-primary opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — view public site */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Building2 className="w-4 h-4" />
          <span>View Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
