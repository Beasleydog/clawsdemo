import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fancy Space Program",
  description: "Fancy Space Program",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
