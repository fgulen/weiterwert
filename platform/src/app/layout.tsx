import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TestBanner } from "@/components/TestBanner";
import { NurDeutschHinweis } from "@/components/NurDeutschHinweis";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "WeiterWert – Technik weitergeben. Chancen eröffnen.", template: "%s – WeiterWert" },
  description: "Gebrauchte Laptops und Tablets spenden – für Bildung, gegen Elektroschrott.",
  icons: { icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }, { url: "/favicon.png" }], apple: "/apple-touch-icon.png" },
};

// The language is read per request inside Suspense boundaries (required with cacheComponents).
// The root <html> keeps lang="de" in the HTML; the script sets lang="tr" or "en" from the URL before the page shows.
const SPRACH_SCRIPT = "document.documentElement.lang=/^\\/(tr|en)(\\/|$)/.exec(location.pathname)?.[1]||'de'";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>
        <script dangerouslySetInnerHTML={{ __html: SPRACH_SCRIPT }} />
        <Suspense fallback={null}>
          <TestBanner />
          <SiteHeader />
          <NurDeutschHinweis />
        </Suspense>
        <main><div className="container"><Suspense fallback={null}>{children}</Suspense></div></main>
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
