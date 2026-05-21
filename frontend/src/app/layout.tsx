import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Aurelia Hotel | 7-Star Luxury Resort",
  description: "World-class luxury hospitality, suites, dining, and wellness experiences.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} bg-transparent`}>
        <Navbar />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "linear-gradient(135deg, #1b3559 0%, #4f3f73 100%)",
              border: "1px solid rgba(255,215,131,0.35)",
              color: "#f5f5f5"
            }
          }}
        />
      </body>
    </html>
  );
}
