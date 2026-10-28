import type { Metadata } from "next";
import { Molle, Source_Sans_3 } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const molle = Molle({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-molle",
  display: "swap",
});

const rock = localFont({
  src: "../fonts/rocknroll.woff2",
  variable: "--font-rock",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kimo's Kitchen | Food made with Aloha",
    template: "%s | Kimo's Kitchen",
  },
  description:
    "Hawaiian-inspired kitchen in London. Bowls, burgers, vintage afternoon tea, and first-party ordering. Change the copy in Admin before you open.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${source.variable} ${molle.variable} ${rock.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
