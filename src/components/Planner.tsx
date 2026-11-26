"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PlaceInput } from "./PlaceInput";
import { fetchRoute, resolvePlace, type Place, type RouteResult } from "@/lib/route";
import { loadBorders } from "@/lib/geo";
import { planTrip, type CountryPlan } from "@/lib/trip";
import { addDays, fmt, iso } from "@/lib/dates";
import { eurApprox, money } from "@/lib/money";
import type { EuroClass, Powertrain, Vehicle, VehicleKind } from "@/data/types";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false, loading: () => <div className="map map-loading" /> });

const today = () => iso(new Date(Date.now() - new Date().getTimezoneOffset() * 60000));

export default function Planner() {
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [depart, setDepart] = useState(() => addDays(today(), 7));
  const [hour, setHour] = useState(6);
  const [roundTrip, setRoundTrip] = useState(true);
  const [ret, setRet] = useState(() => addDays(today(), 14));
  const [stay, setStay] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle>({ kind: "car", powertrain: "standard", euroClass: "euro6" });
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!route) return null;
    return planTrip(route, {
      vehicle, departDate: depart, departHour: hour, returnDate: roundTrip ? ret : undefined, stayDriving: roundTrip && stay, today: today(),
    });
  }, [route, vehicle, depart, hour, roundTrip, ret, stay]);

  const calculate = async () => {
    if (roundTrip && ret < depart) { setError("Датата на връщане е преди тръгването."); return; }
    if ((!from && !fromText.trim()) || (!to && !toText.trim())) { setError("Въведете откъде и докъде пътувате."); return; }
    setError(null); setBusy(true);
    try {
      // Ако не е избрано предложение, търсим написаното (разбира и „Мюнхен“, „Виена“…)
      const a = from || await resolvePlace(fromText.trim());
      const b = to || await resolvePlace(toText.trim());
      if (!a) throw new Error(`Не намерихме „${fromText}“. Опитайте с по-точно име.`);
      if (!b) throw new Error(`Не намерихме „${toText}“. Опитайте с по-точно име.`);
      if (!from) setFrom(a);
      if (!to) setTo(b);
      const [r] = await Promise.all([fetchRoute(a, b), loadBorders()]);
      setRoute(r);
      setTimeout(() => document.getElementById("rezultat")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Нещо се обърка. Опитайте отново.");
    } finally {
      setBusy(false);
    }
  };

  const setV = (p: Partial<Vehicle>) => setVehicle(v => ({ ...v, ...p }));

  return (
    <div className="planner">
      <form className="card form" onSubmit={e => { e.preventDefault(); calculate(); }}>
        <div className="row2">
          <PlaceInput label="Откъде" value={from} onChange={setFrom} onText={setFromText} placeholder="напр. София" />
          <PlaceInput label="Докъде" value={to} onChange={setTo} onText={setToText} placeholder="напр. Мюнхен" />
        </div>
        <div className="row4">
          <label className="fld"><span>Тръгване</span><input type="date" value={depart} min={today()} onChange={e => setDepart(e.target.value)} /></label>
          <label className="fld"><span>Час</span>
            <select value={hour} onChange={e => setHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
          </label>
          <label className="fld"><span>Връщане</span>
            <input type="date" value={ret} min={depart} disabled={!roundTrip} onChange={e => setRet(e.target.value)} />
          </label>
          <label className="chk"><input type="checkbox" checked={roundTrip} onChange={e => setRoundTrip(e.target.checked)} /> Отиване и връщане</label>
        </div>
        <div className="row4">
          <label className="fld"><span>Превозно средство</span>
            <select value={vehicle.kind} onChange={e => setV({ kind: e.target.value as VehicleKind })}>
              <option value="car">Лек автомобил (до 3,5 t)</option>
              <option value="carTrailer">Автомобил с ремарке/каравана</option>
              <option value="moto">Мотоциклет</option>
            </select>
          </label>
          <label className="fld"><span>Задвижване</span>
            <select value={vehicle.powertrain} onChange={e => setV({ powertrain: e.target.value as Powertrain })}>
              <option value="standard">Бензин / дизел / LPG</option>
              <option value="phev">Plug-in хибрид</option>
              <option value="cng">Метан (CNG/LNG)</option>
              <option value="electric">Електрически</option>
            </select>
          </label>
          <label className="fld"><span>Екокласа</span>
            <select value={vehicle.euroClass} onChange={e => setV({ euroClass: e.target.value as EuroClass })}>
              <option value="euro6">Евро 6</option>
              <option value="euro4_5">Евро 4–5</option>
              <option value="euro0_3">Евро 3 и по-ниска</option>
            </select>
          </label>
          {roundTrip && (
            <label className="chk"><input type="checkbox" checked={stay} onChange={e => setStay(e.target.checked)} /> Ще карам по магистрали и на място</label>
          )}
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn primary big" disabled={busy}>{busy ? "Изчисляване…" : "Покажи кои винетки ми трябват"}</button>
      </form>

      {route && result && (
        <section id="rezultat" className="result">
          <div className="result-head">
            <div>
              <h2>{from?.name} → {to?.name}</h2>
              <p className="muted">
                {Math.round(route.distanceKm)} km · около {Math.floor(route.durationH)} ч {Math.round((route.durationH % 1) * 60)} мин шофиране
                {roundTrip ? ` · обратно на ${fmt(ret)}` : ""}
              </p>
            </div>
            <div className="total">
              <span>Винетки и такси{result.partial ? " (без тол таксите по км)" : ""}</span>
              <b>≈ {result.totalEur.toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</b>
            </div>
          </div>
          <RouteMap coords={route.coords} />
          <ol className="plans">
            {result.plans.map(p => <PlanCard key={p.iso} p={p} roundTrip={roundTrip} />)}
          </ol>
          <p className="muted small">
            Сумите в чужда валута са превърнати в евро по курса на ЕЦБ. Плащате в местна валута на официалния сайт.
            Приемаме, че шофирате до 10 часа на ден и минавате по магистралите. Проверете датите преди покупка.
          </p>
        </section>
      )}
    </div>
  );
}

function PlanCard({ p, roundTrip }: { p: CountryPlan; roundTrip: boolean }) {
  const c = p.country;
  const cur = c?.currency || "EUR";
  return (
    <li className="card plan">
      <div className="plan-head">
        <h3><span className="flag" aria-hidden>{c?.flag}</span> {p.name}</h3>
        <span className="muted small">{Math.round(p.km)} km · {p.dates.map(fmt).join(", ")}</span>
      </div>

      {!c && <p className="muted">Нямаме данни за тази държава. Проверете дали има такси за пътища.</p>}
      {c?.system === "none" && <p className="ok">Без винетка и без такса за леки автомобили.</p>}

      {c?.products && p.cover && (
        p.cover.purchases.length === 0 ? <p className="ok">Не е нужна винетка за тези дни.</p> : (
          <div className="buy">
            <ul className="purchases">
              {p.cover.purchases.map((x, i) => (
                <li key={i}>
                  <b>{x.product.label}</b>
                  <span className="muted"> · {fmt(x.start)}{x.start !== x.end ? ` – ${fmt(x.end)}` : ""}</span>
                  <span className="price">{money(x.price, cur)} <em>{cur !== "EUR" ? eurApprox(p.eur(x.price)) : ""}</em></span>
                  {x.delayed && (
                    <div className="warn">Купена онлайн днес, тази винетка важи чак от 18-ия ден. Купете стикер от пункт за продажба или изберете по-кратки винетки.</div>
                  )}
                </li>
              ))}
            </ul>
            {c.official[0] && <a className="btn primary" href={c.official[0].url} target="_blank" rel="noopener">Купи от официалния сайт ↗</a>}
          </div>
        )
      )}
      {c?.products && !p.cover && (
        p.unknownPrice
          ? <p className="warn">Не потвърдихме цена за този вид превозно средство. Проверете на <a href={c.official[0]?.url} target="_blank" rel="noopener">официалния сайт</a>.</p>
          : <p className="ok">За този вид превозно средство не се изисква винетка.</p>
      )}

      {p.tolls.map(t => (
        <div key={t.id} className="toll">
          <b>{t.name}</b>: {t.priceCar != null ? money(t.priceCar, cur) : "—"} на преминаване{roundTrip ? " (× 2 за връщане)" : ""}
          {cur !== "EUR" && t.priceCar != null ? ` ${eurApprox(p.eur(t.priceCar))}` : ""}
          {t.note && <span className="muted small"> — {t.note}</span>}
          {" "}<a href={t.buyUrl} target="_blank" rel="noopener">купи ↗</a>
        </div>
      ))}

      {c?.system === "toll" && c.tollInfo && (
        <div className="tollinfo">
          <p>Такса по участъци — плаща се на място. {c.tollInfo[0]}</p>
          <a href={c.official[c.official.length - 1]?.url || c.official[0]?.url} target="_blank" rel="noopener">Официален калкулатор/цени ↗</a>
        </div>
      )}

      {c?.status === "unverified" && <p className="warn small">{c.statusNote}</p>}
      {c && (c.traps.length > 0) && (
        <details className="traps">
          <summary>Внимавайте ({c.traps.length})</summary>
          <ul>{c.traps.map(t => <li key={t}>{t}</li>)}</ul>
        </details>
      )}
      {c && <Link className="small" href={`/${c.slug}/`}>Всичко за {c.name} →</Link>}
    </li>
  );
}
