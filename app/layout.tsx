import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { TrafikkTopp } from "./TrafikkTopp";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://trafikktelling.no"),
  title: "Trafikktelling",
  description: "Registrer kjøretøy i trafikktelling.",
  applicationName: "Trafikktelling",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Trafikktelling",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="no" className={`${lexend.variable} h-full font-sans`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        <div className="min-h-dvh">
          <TrafikkTopp />
          {children}
        </div>
      </body>
    </html>
  );
}
