import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
      <body>
        {children}
        <Script src="https://docs.opencv.org/4.5.2/opencv.js" />
      </body>
    </html>
  );
}
