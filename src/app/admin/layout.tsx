import { auth } from "@/lib/auth/config";
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
  const session = await auth();

  // Double-check server-side (middleware is the primary guard,
  // this is a defence-in-depth fallback)
  if (!session?.user) {
    redirect("/auth/login");
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
