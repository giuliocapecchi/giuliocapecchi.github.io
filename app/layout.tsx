import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://giulio.cc"),
  title: "Giulio Capecchi",
  description: "Computer engineer and ML engineer at Tuboolar. Explore my recent projects and get in touch.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Giulio Capecchi",
    title: "Giulio Capecchi",
    description: "Computer engineer and ML engineer at Tuboolar. Explore my recent projects and get in touch.",
    images: ["/pf_pic.jpg"],
  },
};

// Draw under the iOS status bar and Safari toolbar; content uses safe-area insets.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Giulio Capecchi's page" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <link rel="dns-prefetch" href="//api.github.com" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}