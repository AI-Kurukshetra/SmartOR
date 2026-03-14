import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SmartOR Command Center",
    template: "%s | SmartOR",
  },
  description:
    "Multi-hospital surgical operations command center for room visibility, scheduling, assignments, and clinical coordination.",
  manifest: "/manifest.webmanifest",
  applicationName: "SmartOR",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartOR",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} min-h-screen bg-background font-body text-foreground antialiased`}
      >
        <div className="min-h-screen bg-mesh">{children}</div>
      </body>
    </html>
  );
}
