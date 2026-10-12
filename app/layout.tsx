import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suomen talousvahti",
  description: "Suomen talouden keskeiset mittarit, lähteet ja kehityssuunnat yhdellä sivulla.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi"><body>{children}</body></html>;
}
