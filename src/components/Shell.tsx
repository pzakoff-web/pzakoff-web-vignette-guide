import Script from "next/script";
import Link from "next/link";
// Шрифтът е в проекта (@fontsource-variable) — build-ът не зависи от Google Fonts.
// index.css съдържа всички азбуки с unicode-range — браузърът тегли само нужните (латиница, кирилица).
import "@fontsource-variable/onest/index.css";
import { SITE } from "@/lib/site";
import { T, home, privacyPath, type Lang } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";


/** Обща рамка за двете езикови версии (всяка има свой <html lang>). */
export function Shell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const t = T[lang];
  return (
    <html lang={lang}>
      <body>
        {SITE.adsenseClient ? (
          <Script async strategy="afterInteractive" crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`} />
        ) : null}
        <header className="site-head">
          <div className="wrap">
            <Link href={home(lang)} className="logo"><span className="mark" aria-hidden>V</span>{SITE.name}</Link>
            <nav>
              <Link href={`${home(lang)}#darzhavi`}>{t.nav.countries}</Link>
              <Link href={`${home(lang)}#izmami`}>{t.nav.scams}</Link>
              <LangSwitch lang={lang} label={t.switchTo} title={t.switchLabel} />
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-foot">
          <div className="wrap">
            <p><b>{SITE.name}</b> {t.footer1}</p>
            <p className="muted small">{t.footer2}</p>
            <p className="small"><Link href={privacyPath(lang)}>{t.privacy}</Link> · <a href="/llms.txt">llms.txt</a></p>
          </div>
        </footer>
      </body>
    </html>
  );
}
