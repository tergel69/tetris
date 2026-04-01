import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tetris Unleashed",
  description: "A modern neon Tetris experience with classic, battle, and story modes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
