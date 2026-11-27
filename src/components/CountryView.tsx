import Link from "next/link";
import type { Country, Vehicle } from "@/data/types";
import { localize } from "@/data/localize";
import { T, eurApprox, fmtDate, home, money, type Lang } from "@/lib/i18n";
import { toEur } from "@/lib/trip";

const CAR: Vehicle = { kind: "car", powertrain: "standard", euroClass: "euro6" };
const MOTO: Vehicle = { ...CAR, kind: "moto" };
const TRAILER: Vehicle = { ...CAR, kind: "carTrailer" };

export function CountryView({ country, lang }: { country: Country; lang: Lang }) {
  const t = T[lang];
  const c = localize(country, lang);
  const cell = (n: number | null) => n == null ? <span className="muted">—</span>
    : <>{money(n, c.currency, lang)}{c.currency !== "EUR" && <em className="muted small"> {eurApprox(toEur(n, c.currency), lang)}</em>}</>;
  return (
    <main className="wrap prose country-page">
      <p className="small"><Link href={home(lang)}>{t.allCountries}</Link></p>
      <h1><span aria-hidden>{c.flag}</span> {c.products?.length ? t.vignette : t.tolls} — {c.name}</h1>
      <p className="lead">{c.scope}</p>
      {c.status !== "verified" && c.statusNote && <p className="warn">{c.statusNote}</p>}

      {c.official.length > 0 && (
        <div className="official">
          <h2>{t.officialSites}</h2>
          <ul>{c.official.map(l => <li key={l.url}><a href={l.url} target="_blank" rel="noopener"><b>{l.label}</b> — {new URL(l.url).hostname}</a></li>)}</ul>
          <p className="small muted">{t.officialWarn(c.name)}</p>
        </div>
      )}

      {c.products?.length ? (
        <>
          <h2>{t.prices}{c.pricesValidFor ? ` (${c.pricesValidFor})` : ""}</h2>
          <div className="table-wrap">
            <table className="prices">
              <thead><tr><th>{t.thType}</th><th>{t.thCar}</th><th>{t.thMoto}</th><th>{t.thTrailer}</th></tr></thead>
              <tbody>
                {c.products.map(p => (
                  <tr key={p.id}>
                    <td><b>{p.label}</b>{p.note && <div className="muted small">{p.note}</div>}{p.onlineConsumerDelayDays && <div className="warn-inline small">{t.onlineFrom(p.onlineConsumerDelayDays)}</div>}</td>
                    <td>{cell(p.price(CAR))}</td><td>{cell(p.price(MOTO))}</td><td>{cell(p.price(TRAILER))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.code === "RO" && <p className="small muted">{t.roNote}</p>}
          {c.code === "CZ" && <p className="small muted">{t.czNote}</p>}
        </>
      ) : null}

      {c.sectionTolls?.length ? (
        <>
          <h2>{t.sections}</h2>
          <ul>{c.sectionTolls.map(x => <li key={x.id}><b>{x.name}</b>: {x.priceCar != null ? money(x.priceCar, c.currency, lang) : "—"} {t.forCar}{x.note ? ` — ${x.note}` : ""}</li>)}</ul>
        </>
      ) : null}
      {c.tollInfo?.length ? (<><h2>{t.howToPay}</h2><ul>{c.tollInfo.map(x => <li key={x}>{x}</li>)}</ul></>) : null}
      {c.traps.length > 0 && (<><h2>{t.traps}</h2><ul className="trap-list">{c.traps.map(x => <li key={x}>{x}</li>)}</ul></>)}
      {c.facts.length > 0 && (<><h2>{t.useful}</h2><ul>{c.facts.map(x => <li key={x}>{x}</li>)}</ul></>)}

      <p><Link className="btn primary" href={home(lang)}>{t.calcCta}</Link></p>

      <h2>{t.sources}</h2>
      <p className="small muted">{t.checkedOn(fmtDate(c.checkedAt, lang))}</p>
      <ul className="small sources">{c.sources.map(s => <li key={s}><a href={s} target="_blank" rel="noopener">{s}</a></li>)}</ul>
    </main>
  );
}
