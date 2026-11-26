import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Link from "next/link";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Винетки и пътни такси в Европа — само официални сайтове | " + SITE.name, template: "%s | " + SITE.name },
  description: "Въведете маршрута и датите — вижте кои винетки ви трябват, за какъв срок, колко струват и директни линкове към официалните държавни сайтове. Без посредници и надценки.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "bg_BG", siteName: SITE.name, url: SITE.url },
};
export const viewport: Viewport = { themeColor: "#0f7a4a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>
        {SITE.adsenseClient ? (
          <Script async strategy="afterInteractive" crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`} />
        ) : null}
        <header className="site-head">
          <div className="wrap">
            <Link href="/" className="logo"><span className="mark" aria-hidden>V</span>{SITE.name}</Link>
            <nav><Link href="/#darzhavi">Държави</Link><Link href="/#izmami">Измами</Link></nav>
          </div>
        </header>
        {children}
        <footer className="site-foot">
          <div className="wrap">
            <p><b>{SITE.name}</b> е независим справочник. Не продаваме винетки и не взимаме комисиона — препращаме само към официалните държавни сайтове.</p>
            <p className="muted small">Цените са проверени на посочената дата от официалните източници, но могат да се променят. Винаги потвърждавайте на официалния сайт преди плащане.</p>
            <p className="small"><Link href="/poveritelnost/">Поверителност</Link> · <a href="/llms.txt">llms.txt</a></p>
          </div>
        </footer>
      </body>
    </html>
  );
}
