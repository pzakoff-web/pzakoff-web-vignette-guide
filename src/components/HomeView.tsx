import Link from "next/link";
import Planner from "./Planner";
import { COUNTRIES } from "@/data/countries";
import { localize } from "@/data/localize";
import { T, countryPath, fmtDate, type Lang } from "@/lib/i18n";

export function HomeView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const list = COUNTRIES.map(c => localize(c, lang));
  const vign = list.filter(c => c.products?.length);
  const tolls = list.filter(c => !c.products?.length);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang,
    mainEntity: t.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">{t.eyebrow(vign.length)}</p>
          <h1>{t.h1}</h1>
          <p className="lead">{t.lead[0]}<b>{t.lead[1]}</b>{t.lead[2]}</p>
        </div>
      </section>
      <main className="wrap">
        <Planner lang={lang} />

        <section id="darzhavi" className="block">
          <h2>{t.countriesH}</h2>
          <div className="grid-c">
            {vign.map(c => (
              <Link key={c.code} href={countryPath(c, lang)} className="card country">
                <span className="flag" aria-hidden>{c.flag}</span>
                <span><b>{c.name}</b><span className="muted small">{c.status === "unverified" ? t.toVerify : `${t.checked} ${fmtDate(c.checkedAt, lang)}`}</span></span>
              </Link>
            ))}
          </div>
          <h3>{t.tollsH}</h3>
          <div className="grid-c">
            {tolls.map(c => (
              <Link key={c.code} href={countryPath(c, lang)} className="card country">
                <span className="flag" aria-hidden>{c.flag}</span>
                <span><b>{c.name}</b><span className="muted small">{c.system === "none" ? t.noCarToll : c.system === "mixed" ? t.bridges : t.bySection}</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section id="izmami" className="block prose">
          <h2>{t.scamH}</h2>
          {t.faq.map(f => (<details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>))}
        </section>
      </main>
    </>
  );
}
