import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

export const metadata: Metadata = {
  title: "Mosquito Dashboard",
  description: "Next.js Dashboard",
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning={true}
    >
      <body>
        <QueryProvider>
        {children}
        </QueryProvider></body>
    </html>
  );
}
