import type { Metadata } from "next";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Homes — Premium Real Estate Advisory",
    template: "%s | Homes",
  },
  description:
    "Discover RERA-verified residential plots, apartments, and villas in Lucknow. Trusted real estate advisory with transparent pricing and expert guidance.",
  keywords: [
    "real estate Lucknow",
    "residential plots Sushant Golf City",
    "RERA verified properties",
    "flats in Lucknow",
    "villas Lucknow",
    "property for sale Lucknow",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Homes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
