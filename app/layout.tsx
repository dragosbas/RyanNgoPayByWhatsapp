import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy } from "@/content/copy";
import "./globals.css";

const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: copy.meta.title,
    template: "%s — GoodFund",
  },
  description: copy.meta.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className={lato.className}>
        <a className="skip" href="#continut">
          {copy.nav.skip}
        </a>
        <SiteHeader />
        <main id="continut">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
