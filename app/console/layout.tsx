import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations Console",
  description: "Private SquareDevDoctor production operations console.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function ConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
