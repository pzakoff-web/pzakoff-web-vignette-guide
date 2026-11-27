"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PlaceInput } from "./PlaceInput";
import { fetchRoute, placeFromParam, placeToParam, resolvePlace, type Place, type RouteResult } from "@/lib/route";
import { loadBorders } from "@/lib/geo";
import { planTrip, type CountryPlan } from "@/lib/trip";
import { addDays, fmt, iso } from "@/lib/dates";
import { eurApprox, money } from "@/lib/money";
import type { EuroClass, Powertrain, Vehicle, VehicleKind } from "@/data/types";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false, loading: () => <div className="map map-loading" /> });

const today = () => iso(new Date(Date.now() - new Date().getTimezoneOffset() * 60000));

interface Stop { id: number; place: Place | null; text: string }
let nextId = 1;
const newStop = (place: Place | null = null): Stop => ({ id: nextId++, place, text: place?.label || "" });

export default function Planner() {
  // stops[0] = откъде, последният = докъде, между тях — „през“
  const [stops, setStops] = useState<Stop[]>(() => [newStop(), newStop()]);
  const [depart, setDepart] = useState(() => addDays(today(), 7));
  const [hour, setHour] = useState(6);
  const [roundTrip, setRoundTrip] = useState(true);
  const [ret, setRet] = useState(() => addDays(today(), 14));
  const [stay, setStay] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle>({ kind: "car", powertrain: "standard", euroClass: "euro6" });
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restored = useRef(false);

  const result = useMemo(() => {
    if (!route) return null;
    return planTrip(route, {
      vehicle, departDate: depart, departHour: hour, returnDate: roundTrip ? ret : undefined, stayDriving: roundTrip && stay, today: today(),
    });
  }, [route, vehicle, depart, hour, roundTrip, ret, stay]);

  const viaCoords = useMemo(() => routePlaces.slice(1, -1).map(p => [p.lon, p.lat] as [number, number]), [routePlaces]);

  const updateStop = (id: number, patch: Partial<Stop>) => setStops(ss => ss.map(s => (s.id === id ? { ...s, ...patch } : s)));
  const addVia = () => setStops(ss => [...ss.slice(0, -1), newStop(), ss[ss.length - 1]]);
  const removeStop = (id: number) => setStops(ss => (ss.length > 2 ? ss.filter(s => s.id !== id) : ss));
  const swapEnds = () => setStops(ss => [ss[ss.length - 1], ...ss.slice(1, -1).reverse(), ss[0]]);

  const run = async (list: Stop[], opts: { scroll: boolean }) => {
    setError(null); setBusy(true);
    try {
      // Ако не е избрано предложение, търсим написаното (разбира и „Мюнхен“, „Виена“…)
      const places: Place[] = [];
      for (const s of list) {
        const p = s.place || (s.text.trim() ? await resolvePlace(s.text.trim()) : null);
        if (!p) throw new Error(`Не намерихме „${s.text}“. Опитайте с по-точно име.`);
        places.push(p);
      }
      setStops(list.map((s, i) => (s.place ? s : { ...s, place: places[i], text: places[i].label })));
      const [r] = await Promise.all([fetchRoute(places), loadBorders()]);
      setRoute(r);
      setRoutePlaces(places);
      if (opts.scroll) setTimeout(() => document.getElementById("rezultat")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Нещо се обърка. Опитайте отново.");
    } finally {
      setBusy(false);
    }
  };

  const calculate = () => {
    if (roundTrip && ret < depart) { setError("Датата на връщане е преди тръгването."); return; }
    const list = stops.filter((s, i) => i === 0 || i === stops.length - 1 || s.place || s.text.trim()); // празните „през“ се пропускат
    if (!list[0].place && !list[0].text.trim()) { setError("Въведете откъде тръгвате."); return; }
    if (!list[list.length - 1].place && !list[list.length - 1].text.trim()) { setError("Въведете докъде пътувате."); return; }
    run(list, { scroll: true });
  };

  // Записва пътуването в адреса при всяка промяна: „назад“ от страница на държава го връща,
  // а линкът може да се сподели.
  useEffect(() => {
    if (routePlaces.length < 2) return;
    const q = new URLSearchParams();
    routePlaces.forEach(p => q.append("s", placeToParam(p)));
    q.set("d", depart); q.set("h", String(hour));
    if (roundTrip) q.set("r", ret);
    if (roundTrip && stay) q.set("stay", "1");
    q.set("v", vehicle.kind); q.set("p", vehicle.powertrain); q.set("e", vehicle.euroClass);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${q.toString()}#rezultat`);
  }, [routePlaces, depart, hour, roundTrip, ret, stay, vehicle]);

  // Възстановяване от адреса при отваряне / връщане назад
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const q = new URLSearchParams(window.location.search);
    const places = q.getAll("s").map(placeFromParam).filter(Boolean) as Place[];
    if (places.length < 2) return;
    const list = places.map(p => newStop(p));
    /* eslint-disable react-hooks/set-state-in-effect -- еднократно зареждане от адреса */
    setStops(list);
    if (q.get("d")) setDepart(q.get("d")!);
    if (q.get("h")) setHour(Number(q.get("h")));
    setRoundTrip(q.has("r"));
    if (q.get("r")) setRet(q.get("r")!);
    setStay(q.get("stay") === "1");
    setVehicle({
      kind: (q.get("v") as VehicleKind) || "car",
      powertrain: (q.get("p") as Powertrain) || "standard",
      euroClass: (q.get("e") as EuroClass) || "euro6",
    });
    /* eslint-enable react-hooks/set-state-in-effect */
    run(list, { scroll: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setV = (p: Partial<Vehicle>) => setVehicle(v => ({ ...v, ...p }));

  return (
    <div className="planner">
      <form className="card form" onSubmit={e => { e.preventDefault(); calculate(); }}>
        <div className="stops">
          {stops.map((s, i) => {
            const first = i === 0, last = i === stops.length - 1;
            return (
              <div className={"stop" + (!first && !last ? " via" : "")} key={s.id}>
                <span className={"dot" + (first ? " start" : last ? " end" : "")} aria-hidden />
                <PlaceInput
                  label={first ? "Откъде" : last ? "Докъде" : `През (${i})`}
                  value={s.place}
                  onChange={p => updateStop(s.id, { place: p })}
                  onText={t => updateStop(s.id, { text: t })}
                  placeholder={first ? "напр. София" : last ? "напр. Мюнхен" : "град по пътя, напр. Будапеща"}
                />
                {!first && !last && <button type="button" className="icon-btn" aria-label="Махни тази точка" onClick={() => removeStop(s.id)}>×</button>}
              </div>
            );
          })}
          <div className="stop-actions">
            <button type="button" className="link" onClick={addVia}>+ Добави град по пътя</button>
            <button type="button" className="link" onClick={swapEnds}>⇅ Размени посоката</button>
          </div>
          <p className="muted small hint">За да минете през определена държава, добавете град в нея — например Будапеща за Унгария или Белград за Сърбия.</p>
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
              <h2>{routePlaces.map(p => p.name).join(" → ")}</h2>
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
          <div className="share-row">
            <button type="button" className="link" onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ title: "Винетки за пътуването", url }).catch(() => {});
              else navigator.clipboard?.writeText(url).then(() => alert("Линкът е копиран."));
            }}>Сподели пътуването ↗</button>
            <button type="button" className="link" onClick={() => document.querySelector(".form")?.scrollIntoView({ behavior: "smooth" })}>Промени маршрута ↑</button>
          </div>
          <RouteMap coords={route.coords} via={viaCoords} />
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
