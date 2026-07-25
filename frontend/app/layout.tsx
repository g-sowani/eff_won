import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import Loader from "@/components/layout/Loader";
import SpeedLines from "@/components/layout/SpeedLines";
import CursorGlow from "@/components/layout/CursorGlow";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "APEX | Formula 1 Hub",
  description: "Live F1 race results, qualifying, standings and all-time records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${orbitron.variable} ${inter.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Loader />
        <SpeedLines />
        <CursorGlow />
        <Navbar />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
