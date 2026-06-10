import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schema Mapper",
  description: "Visualize and map any database schema",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
