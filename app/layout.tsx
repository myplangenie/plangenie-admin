import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanGenie Admin",
  description: "Administration console for PlanGenie",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.ico", rel: "shortcut icon", type: "image/x-icon" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Global auth context for signin and admin */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <AuthRoot>{children}</AuthRoot>
      </body>
    </html>
  );
}

function AuthRoot({ children }: { children: React.ReactNode }) {
  // require client import lazily to keep this file as server component
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AuthProvider } = require("@/context/AuthContext");
  return <AuthProvider>{children}</AuthProvider>;
}
