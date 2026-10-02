import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import PwaRegistrar from "./_components/PwaRegistrar";

export const metadata: Metadata = {
  title: "RecoveryBuddy",
  description: "Mock-integratie van RecoveryBuddy met Minddistrict",
  applicationName: "RecoveryBuddy",
  appleWebApp: { capable: true, title: "RecoveryBuddy", statusBarStyle: "default" },
  icons: { apple: "/apple-icon" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#c94c45",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
