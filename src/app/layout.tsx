import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AppHeader } from "@/components/AppHeader";
import { I18nProvider } from "@/i18n/I18nProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Simulátor",
  description: "Real-time F1 race simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <I18nProvider>
          <Tooltip.Provider delayDuration={150} skipDelayDuration={0}>
            <div className="flex min-h-full flex-col">
              <AppHeader />
              <div className="flex-1">{children}</div>
            </div>
          </Tooltip.Provider>
        </I18nProvider>
      </body>
    </html>
  );
}
