import { auth } from "@/lib/auth/config";
import { getRequestLocale } from "@/lib/i18n/request";
import { localizeHref } from "@/lib/i18n/utils";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard — Homes",
    template: "%s — Homes Admin",
  },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, locale] = await Promise.all([auth(), getRequestLocale()]);

  // Double-check server-side (middleware is the primary guard,
  // this is a defence-in-depth fallback)
  if (!session?.user) {
    redirect(localizeHref(locale, "/auth/login"));
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
