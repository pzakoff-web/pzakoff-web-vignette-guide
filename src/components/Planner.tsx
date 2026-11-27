"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PlaceInput } from "./PlaceInput";
import { fetchRoute, placeCountry, placeFromParam, placeToParam, resolvePlace, type Place, type RouteResult } from "@/lib/route";
import { loadBorders } from "@/lib/geo";
import { planTrip, type CountryPlan } from "@/lib/trip";
import { addDays, iso } from "@/lib/dates";
import { T, countryPath, eurApprox, eurRange, eurTotal, fmtDate, money, type Dict, type Lang } from "@/lib/i18n";
import type { EuroClass, Powertrain, Vehicle, VehicleKind } from "@/data/types";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false, loading: () => <div className="map map-loading" /> });

const today = () => iso(new Date(Date.now() - new Date().getTimezoneOffset() * 60000));

interface Stop { id: number; place: Place | null; text: string }
let nextId = 1;
const newStop = (place: Place | null = null): Stop => ({ id: nextId++, place, text: place?.label || "" });

export default function Planner({ lang = "bg" }: { lang?: Lang }) {
  const t = T[lang];
  const fmt = (s: string) => fmtDate(s, lang);
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
      vehicle, departDate: depart, departHour: hour, returnDate: roundTrip ? ret : undefined, stayDriving: roundTrip && stay, today: today(), lang,
    });
  }, [route, vehicle, depart, hour, roundTrip, ret, stay, lang]);

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
        const p = s.place || (s.text.trim() ? await resolvePlace(s.text.trim(), lang) : null);
        if (!p) throw new Error(t.errNotFound(s.text));
        places.push(p);
      }
      setStops(list.map((s, i) => (s.place ? s : { ...s, place: places[i], text: places[i].label })));
      const [r] = await Promise.all([fetchRoute(places), loadBorders()]);
      setRoute(r);
      setRoutePlaces(places);
      if (opts.scroll) setTimeout(() => document.getElementById("rezultat")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(msg === "ROUTE_FAIL" ? t.errRoute : msg === "NO_ROUTE" ? t.errNoRoute : msg && !/^[A-Z_]+$/.test(msg) ? msg : t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  const calculate = () => {
    if (roundTrip && ret < depart) { setError(t.errReturn); return; }
    const list = stops.filter((s, i) => i === 0 || i === stops.length - 1 || s.place || s.text.trim()); // празните „през“ се пропускат
    if (!list[0].place && !list[0].text.trim()) { setError(t.errFrom); return; }
    if (!list[list.length - 1].place && !list[list.length - 1].text.trim()) { setError(t.errTo); return; }
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
                  label={first ? t.from : last ? t.to : t.via(i)}
                  value={s.place}
                  onChange={p => updateStop(s.id, { place: p })}
                  onText={t => updateStop(s.id, { text: t })}
                  placeholder={first ? t.fromPh : last ? t.toPh : t.viaPh}
                  lang={lang}
                />
                {!first && !last && <button type="button" className="icon-btn" aria-label={t.removeStop} onClick={() => removeStop(s.id)}>×</button>}
              </div>
            );
          })}
          <div className="stop-actions">
            <button type="button" className="link" onClick={addVia}>{t.addVia}</button>
            <button type="button" className="link" onClick={swapEnds}>{t.swap}</button>
          </div>
          <p className="muted small hint">{t.viaHint}</p>
        </div>
        <div className="row4">
          <label className="fld"><span>{t.depart}</span><input type="date" value={depart} min={today()} onChange={e => setDepart(e.target.value)} /></label>
          <label className="fld"><span>{t.hour}</span>
            <select value={hour} onChange={e => setHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
          </label>
          <label className="fld"><span>{t.ret}</span>
            <input type="date" value={ret} min={depart} disabled={!roundTrip} onChange={e => setRet(e.target.value)} />
          </label>
          <label className="chk"><input type="checkbox" checked={roundTrip} onChange={e => setRoundTrip(e.target.checked)} /> {t.roundTrip}</label>
        </div>
        <div className="row4">
          <label className="fld"><span>{t.vehicle}</span>
            <select value={vehicle.kind} onChange={e => setV({ kind: e.target.value as VehicleKind })}>
              <option value="car">{t.car}</option>
              <option value="carTrailer">{t.carTrailer}</option>
              <option value="moto">{t.moto}</option>
            </select>
          </label>
          <label className="fld"><span>{t.power}</span>
            <select value={vehicle.powertrain} onChange={e => setV({ powertrain: e.target.value as Powertrain })}>
              <option value="standard">{t.std}</option>
              <option value="phev">{t.phev}</option>
              <option value="cng">{t.cng}</option>
              <option value="electric">{t.ev}</option>
            </select>
          </label>
          <label className="fld"><span>{t.euro}</span>
            <select value={vehicle.euroClass} onChange={e => setV({ euroClass: e.target.value as EuroClass })}>
              <option value="euro6">{t.e6}</option>
              <option value="euro4_5">{t.e45}</option>
              <option value="euro0_3">{t.e03}</option>
            </select>
          </label>
          {roundTrip && (
            <label className="chk" title={t.stayTitle}>
              <input type="checkbox" checked={stay} onChange={e => setStay(e.target.checked)} /> {t.stay(stops[stops.length - 1].place ? placeCountry(stops[stops.length - 1].place!) || null : null)}
            </label>
          )}
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn primary big" disabled={busy}>{busy ? t.busy : t.submit}</button>
      </form>

      {route && result && (
        <section id="rezultat" className="result">
          <div className="result-head">
            <div>
              <h2>{routePlaces.map((p, i) => (
                <span key={i}>{i > 0 && " → "}{p.name}{placeCountry(p) && <span className="h2-country"> ({placeCountry(p)})</span>}</span>
              ))}</h2>
              <p className="muted">
                {t.drive(Math.round(route.distanceKm), Math.floor(route.durationH), Math.round((route.durationH % 1) * 60))}
                {roundTrip ? t.back(fmt(ret)) : ""}
              </p>
            </div>
            <div className="total">
              {result.tollHighEur > 0 ? (
                <>
                  <span>{t.totalWithTolls}{result.partial ? t.totalPartial : ""}</span>
                  <b>≈ {eurRange(result.totalEur + result.tollLowEur, result.totalEur + result.tollHighEur, lang)}</b>
                  <span className="total-split">{t.fixedPart(eurTotal(result.totalEur, lang))} · {t.tollPart(`≈ ${eurRange(result.tollLowEur, result.tollHighEur, lang)}`)}</span>
                </>
              ) : (
                <>
                  <span>{t.totalLabel}{result.partial ? t.totalPartial : ""}</span>
                  <b>≈ {eurTotal(result.totalEur, lang)}</b>
                </>
              )}
            </div>
          </div>
          <div className="share-row">
            <button type="button" className="link" onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ title: t.shareTitle, url }).catch(() => {});
              else navigator.clipboard?.writeText(url).then(() => alert(t.copied));
            }}>{t.share}</button>
            <button type="button" className="link" onClick={() => document.querySelector(".form")?.scrollIntoView({ behavior: "smooth" })}>{t.edit}</button>
          </div>
          <RouteMap coords={route.coords} via={viaCoords} label={t.mapLabel} />
          <ol className="plans">
            {result.plans.map(p => <PlanCard key={p.iso} p={p} roundTrip={roundTrip} lang={lang} t={t} />)}
          </ol>
          <p className="muted small">{t.note}</p>
        </section>
      )}
    </div>
  );
}

function PlanCard({ p, roundTrip, lang, t }: { p: CountryPlan; roundTrip: boolean; lang: Lang; t: Dict }) {
  const c = p.country;
  const fmt = (s: string) => fmtDate(s, lang);
  const cur = c?.currency || "EUR";
  return (
    <li className="card plan">
      <div className="plan-head">
        <h3><span className="flag" aria-hidden>{c?.flag}</span> {p.name}</h3>
        <span className="muted small">{Math.round(p.km)} km · {p.dates.map(d => fmt(d)).join(", ")}</span>
      </div>

      {!c && <p className="muted">{t.noData}</p>}
      {c?.system === "none" && <p className="ok">{t.noToll}</p>}

      {c?.products && p.cover && (
        p.cover.purchases.length === 0 ? <p className="ok">{t.noneNeeded}</p> : (
          <div className="buy">
            <ul className="purchases">
              {p.cover.purchases.map((x, i) => (
                <li key={i}>
                  <b>{x.product.label}</b>
                  <span className="muted"> · {fmt(x.start)}{x.start !== x.end ? ` – ${fmt(x.end)}` : ""}</span>
                  <span className="price">{money(x.price, cur, lang)} <em>{cur !== "EUR" ? eurApprox(p.eur(x.price), lang) : ""}</em></span>
                  {x.delayed && (
                    <div className="warn">{t.delayed}</div>
                  )}
                </li>
              ))}
            </ul>
            {c.official[0] && <a className="btn primary" href={c.official[0].url} target="_blank" rel="noopener">{t.buy}</a>}
          </div>
        )
      )}
      {c?.products && !p.cover && (
        p.unknownPrice
          ? <p className="warn">{t.unknownPrice[0]}<a href={c.official[0]?.url} target="_blank" rel="noopener">{t.unknownPrice[1]}</a>{t.unknownPrice[2]}</p>
          : <p className="ok">{t.notRequired}</p>
      )}

      {p.tolls.map(x => (
        <div key={x.id} className="toll">
          <b>{x.name}</b>: {x.priceCar != null ? money(x.priceCar, cur, lang) : "—"} {t.perPass}{roundTrip ? t.times2 : ""}
          {cur !== "EUR" && x.priceCar != null ? ` ${eurApprox(p.eur(x.priceCar), lang)}` : ""}
          {x.note && <span className="muted small"> — {x.note}</span>}
          {" "}<a href={x.buyUrl} target="_blank" rel="noopener">{t.buyShort}</a>
        </div>
      ))}

      {p.distance && c?.distanceToll && (
        <div className="dist">
          <div className="dist-row">
            <span>{t.distLine(Math.round(p.distance.km))}{p.distance.trips > 1 ? t.distBoth : ""}</span>
            <span className="price">{p.distance.currency === "EUR" ? `≈ ${eurRange(p.distance.low, p.distance.high, lang)}` : `≈ ${Math.floor(p.distance.low)}–${money(Math.ceil(p.distance.high), p.distance.currency, lang)}`}
              {p.distance.currency !== "EUR" && <em> ≈ {eurRange(p.distance.lowEur, p.distance.highEur, lang)}</em>}</span>
          </div>
          <details className="how">
            <summary>{t.distHow} · {t.q[c.distanceToll.quality]}</summary>
            <p>{c.distanceToll.basis}</p>
          </details>
        </div>
      )}
      {c?.system === "toll" && c.tollInfo && (
        <div className="tollinfo">
          <p>{c.distanceToll ? `${t.tollPrefix} ${c.tollInfo[0]}` : t.distNoEstimate}</p>
          <a href={c.official[c.official.length - 1]?.url || c.official[0]?.url} target="_blank" rel="noopener">{t.officialCalc}</a>
        </div>
      )}

      {c?.status === "unverified" && <p className="warn small">{c.statusNote}</p>}
      {c && (c.traps.length > 0) && (
        <details className="traps">
          <summary>{t.watch(c.traps.length)}</summary>
          <ul>{c.traps.map(x => <li key={x}>{x}</li>)}</ul>
        </details>
      )}
      {c && <Link className="small" href={countryPath(c, lang)}>{t.allAbout(c.name)}</Link>}
    </li>
  );
}
