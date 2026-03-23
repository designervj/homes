"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserRole } from "@/types";

// ─── ROLE LABEL MAP ───────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  agent: "Sales Agent",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "text-primary",
  admin: "text-blue-400",
  agent: "text-emerald-400",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 flex-shrink-0">

      {/* Left — breadcrumb placeholder (pages can override via portal) */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Homes Admin
        </span>
      </div>

      {/* Right — actions + user */}
      <div className="flex items-center gap-3">

        {/* Notifications (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-muted-foreground hover:bg-accent"
        >
          <Bell className="w-4 h-4" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 hover:bg-accent rounded-lg px-2 py-1.5 transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white leading-tight">
                  {user.name}
                </span>
                <span className={`text-[10px] leading-tight ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 bg-card border-border text-white"
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
              Signed in as
              <span className="block text-white font-medium text-sm mt-0.5 truncate">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer text-sm gap-2"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
