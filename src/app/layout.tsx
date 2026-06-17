import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://openfga.mandacode.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "OpenFGA Dashboard",
    template: "%s | OpenFGA Dashboard",
  },
  description:
    "A web-based dashboard for managing OpenFGA authorization servers. Manage stores, authorization models, relationship tuples, and run queries.",
  keywords: [
    "OpenFGA",
    "authorization",
    "fine-grained authorization",
    "relationship-based access control",
    "RBAC",
    "ABAC",
    "dashboard",
    "Zanzibar",
  ],
  authors: [{ name: "mandacode" }],
  creator: "mandacode",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "OpenFGA Dashboard",
    title: "OpenFGA Dashboard",
    description:
      "A web-based dashboard for managing OpenFGA authorization servers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenFGA Dashboard",
    description:
      "A web-based dashboard for managing OpenFGA authorization servers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: `${baseUrl}/manifest.json`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="canonical" href={baseUrl} />
      </head>
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
