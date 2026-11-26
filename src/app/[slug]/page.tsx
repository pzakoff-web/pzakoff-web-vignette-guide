import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, bySlug } from "@/data/countries";
import type { Vehicle } from "@/data/types";
import { fmt } from "@/lib/dates";
import { eurApprox, money } from "@/lib/money";
import { toEur } from "@/lib/trip";

export const dynamicParams = false;
export function generateStaticParams() { return COUNTRIES.map(c => ({ slug: c.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = bySlug((await params).slug);
  if (!c) return {};
  const what = c.products?.length ? "Винетка" : "Пътни такси";
  return {
    title: `${what} ${c.name} 2026 — цени, срокове и официален сайт`,
    description: `${what} за ${c.name}: актуални цени, видове и срокове, капани и директен линк към официалния държавен сайт. Проверено на ${fmt(c.checkedAt)}.`,
    alternates: { canonical: `/${c.slug}/` },
  };
}

const CAR: Vehicle = { kind: "car", powertrain: "standard", euroClass: "euro6" };
const MOTO: Vehicle = { ...CAR, kind: "moto" };
const TRAILER: Vehicle = { ...CAR, kind: "carTrailer" };

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = bySlug((await params).slug);
  if (!c) notFound();
  const cell = (n: number | null) => n == null ? <span className="muted">—</span> : <>{money(n, c.currency)}{c.currency !== "EUR" && <em className="muted small"> {eurApprox(toEur(n, c.currency))}</em>}</>;
  return (
    <main className="wrap prose country-page">
      <p className="small"><Link href="/">← Всички държави</Link></p>
      <h1><span aria-hidden>{c.flag}</span> {c.products?.length ? "Винетка" : "Пътни такси"} — {c.name}</h1>
      <p className="lead">{c.scope}</p>

      {c.status !== "verified" && c.statusNote && <p className="warn">{c.statusNote}</p>}

      {c.official.length > 0 && (
        <div className="official">
          <h2>Официални сайтове</h2>
          <ul>{c.official.map(l => <li key={l.url}><a href={l.url} target="_blank" rel="noopener"><b>{l.label}</b> — {new URL(l.url).hostname}</a></li>)}</ul>
          <p className="small muted">Всичко друго, което Google показва за „винетка {c.name}“, вероятно е посредник с надценка.</p>
        </div>
      )}

      {c.products?.length ? (
        <>
          <h2>Цени{c.pricesValidFor ? ` (${c.pricesValidFor})` : ""}</h2>
          <div className="table-wrap">
            <table className="prices">
              <thead><tr><th>Вид</th><th>Лек автомобил</th><th>Мотоциклет</th><th>С ремарке</th></tr></thead>
              <tbody>
                {c.products.map(p => (
                  <tr key={p.id}>
                    <td><b>{p.label}</b>{p.note && <div className="muted small">{p.note}</div>}{p.onlineConsumerDelayDays && <div className="warn-inline small">онлайн: важи от {p.onlineConsumerDelayDays}-ия ден</div>}</td>
                    <td>{cell(p.price(CAR))}</td><td>{cell(p.price(MOTO))}</td><td>{cell(p.price(TRAILER))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(c.code === "RO" || c.code === "CZ") && <p className="small muted">Цените в таблицата са за {c.code === "RO" ? "Евро 6" : "бензин/дизел"}. {c.code === "RO" ? "Електромобили и по-старите коли плащат различно — изберете екокласата в калкулатора." : "За CNG, plug-in хибриди и електромобили — вижте капаните по-долу."}</p>}
        </>
      ) : null}

      {c.sectionTolls?.length ? (
        <>
          <h2>Участъци с отделна такса</h2>
          <ul>{c.sectionTolls.map(t => <li key={t.id}><b>{t.name}</b>: {t.priceCar != null ? money(t.priceCar, c.currency) : "—"} за кола{t.note ? ` — ${t.note}` : ""}</li>)}</ul>
        </>
      ) : null}

      {c.tollInfo?.length ? (<><h2>Как се плаща</h2><ul>{c.tollInfo.map(t => <li key={t}>{t}</li>)}</ul></>) : null}
      {c.traps.length > 0 && (<><h2>Внимавайте</h2><ul className="trap-list">{c.traps.map(t => <li key={t}>{t}</li>)}</ul></>)}
      {c.facts.length > 0 && (<><h2>Полезно</h2><ul>{c.facts.map(t => <li key={t}>{t}</li>)}</ul></>)}

      <p><Link className="btn primary" href="/">Изчисли винетките за моя маршрут</Link></p>

      <h2>Източници</h2>
      <p className="small muted">Проверено на {fmt(c.checkedAt)}.</p>
      <ul className="small sources">{c.sources.map(s => <li key={s}><a href={s} target="_blank" rel="noopener">{s}</a></li>)}</ul>
    </main>
  );
}
