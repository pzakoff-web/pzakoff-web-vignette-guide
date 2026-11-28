// Маршрут (OSRM) и търсене на места (Photon). Адресите се сменят с env променливи.
export const ROUTER_URL = (process.env.NEXT_PUBLIC_OSRM_URL || "https://router.project-osrm.org").replace(/\/$/, "");
export const GEOCODER_URL = (process.env.NEXT_PUBLIC_PHOTON_URL || "https://photon.komoot.io").replace(/\/$/, "");

import { COUNTRY_NAMES, aliasQuery, bgName } from "./aliases";

export const NOMINATIM_URL = (process.env.NEXT_PUBLIC_NOMINATIM_URL || "https://nominatim.openstreetmap.org").replace(/\/$/, "");

export interface Place { name: string; label: string; lat: number; lon: number }

/** Държавата от етикета („Мюнхен, Бавария, Германия“ → „Германия“). */
export const placeCountry = (p: Place) => (p.label.includes(", ") ? p.label.split(", ").pop()! : "");

/**
 * Еднократно търсене (при натискане на бутона), което разбира и български имена на чужди градове.
 * Правилата на Nominatim забраняват автодовършване, затова тук не се вика при писане.
 */
export async function resolvePlace(q: string, lang: "bg" | "en" = "bg", signal?: AbortSignal): Promise<Place | null> {
  q = aliasQuery(q) || q;
  const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=1&accept-language=${lang}&featureType=settlement`;
  const r = await fetch(url, { signal });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.length) return null;
  const label = String(j[0].display_name).split(", ").filter((_: string, i: number, a: string[]) => i === 0 || i >= a.length - 2).join(", ");
  return { name: String(j[0].name || j[0].display_name.split(",")[0]), label, lat: Number(j[0].lat), lon: Number(j[0].lon) };
}

// Градовете преди селата: Photon понякога дава първо село със същото име.
const RANK: Record<string, number> = { city: 0, town: 1, municipality: 2, village: 3, hamlet: 4 };
// Квартали, площади, острови и подобни почти никога не са цел на пътуване — не ги предлагаме.

export async function searchPlaces(q: string, signal?: AbortSignal, lang: "bg" | "en" = "bg"): Promise<Place[]> {
  const typed = q.trim();
  const alias = aliasQuery(typed);
  const url = `${GEOCODER_URL}/api/?q=${encodeURIComponent(alias || typed)}&limit=12&osm_tag=place&bbox=-25,34,45,72${lang === "en" ? "&lang=en" : ""}`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error("SEARCH_FAIL");
  const j = await r.json();
  type F = { properties: Record<string, string>; geometry: { coordinates: [number, number] } };
  const seen = new Set<string>();
  return (j.features as F[] || [])
    .map((f, i) => ({ f, i, rank: RANK[f.properties.osm_value] ?? 99 }))
    .filter(x => x.rank < 99)
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map(({ f, rank }, k) => {
      const p = f.properties;
      // Написано е българското име на град („Атина“) → показваме него, а не „Αθήνα“
      const name = alias && k === 0 && lang === "bg" ? bgName(alias) || typed : (p.name || p.city || "");
      const country = COUNTRY_NAMES[(p.countrycode || "").toUpperCase()]?.[lang] || p.country;
      // областта помага само при села с еднакви имена
      const label = [name, rank >= 3 && p.state !== name ? p.state : null, country].filter(Boolean).join(", ");
      return { name, label, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
    })
    .filter(p => { if (seen.has(p.label)) return false; seen.add(p.label); return true; })
    .slice(0, 6);
}

export interface RouteStep { coords: [number, number][]; ref: string }

export interface FerryLeg { name: string; minutes: number; lat: number; lon: number; lineId?: string }

export interface RouteResult {
  steps: RouteStep[];
  ferries: FerryLeg[];         // фериботи по маршрута          // стъпки с номер на пътя — за таксите по километър
  coords: [number, number][];  // [lon, lat]
  cumSec: number[];            // кумулативно време до всяка точка
  cumKm: number[];
  distanceKm: number;
  durationH: number;
}

export async function fetchRoute(points: Place[], signal?: AbortSignal): Promise<RouteResult> {
  const path = points.map(p => `${p.lon},${p.lat}`).join(";");
  const url = `${ROUTER_URL}/route/v1/driving/${path}?overview=full&geometries=geojson&annotations=duration,distance&steps=true`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error("ROUTE_FAIL");
  const j = await r.json();
  if (j.code !== "Ok" || !j.routes?.length) throw new Error("NO_ROUTE");
  const route = j.routes[0];
  const coords = route.geometry.coordinates as [number, number][];
  const durs: number[] = route.legs.flatMap((l: { annotation: { duration: number[] } }) => l.annotation.duration);
  const dists: number[] = route.legs.flatMap((l: { annotation: { distance: number[] } }) => l.annotation.distance);
  const cumSec = [0], cumKm = [0];
  for (let i = 0; i < coords.length - 1; i++) {
    cumSec.push(cumSec[i] + (durs[i] ?? 0));
    cumKm.push(cumKm[i] + (dists[i] ?? 0) / 1000);
  }
  type S = { distance: number; duration: number; ref?: string; name?: string; mode?: string; maneuver: { location: [number, number] }; geometry: { coordinates: [number, number][] } };
  const ferries: FerryLeg[] = [];
  for (const st of route.legs.flatMap((l: { steps: S[] }) => l.steps) as S[]) {
    if (st.mode !== "ferry") continue;
    const last = ferries[ferries.length - 1];
    if (last && last.name === (st.name || "")) { last.minutes += st.duration / 60; continue; }
    ferries.push({ name: st.name || "", minutes: st.duration / 60, lat: st.maneuver.location[1], lon: st.maneuver.location[0] });
  }
  const steps: RouteStep[] = route.legs.flatMap((l: { steps: S[] }) => l.steps)
    .filter((st: S) => st.distance > 0 && st.ref)
    .map((st: S) => ({ coords: st.geometry.coordinates, ref: st.ref || "" }));
  return { coords, cumSec, cumKm, steps, ferries, distanceKm: route.distance / 1000, durationH: route.duration / 3600 };
}

/** Маршрут с ферибот: шофиране до пристанището + ферибот + шофиране от другото пристанище. */
export function joinWithFerry(a: RouteResult, b: RouteResult, ferry: FerryLeg): RouteResult {
  const t0 = a.cumSec[a.cumSec.length - 1] + ferry.minutes * 60, k0 = a.cumKm[a.cumKm.length - 1];
  return {
    coords: [...a.coords, ...b.coords],
    cumSec: [...a.cumSec, ...b.cumSec.map(x => x + t0)],
    cumKm: [...a.cumKm, ...b.cumKm.map(x => x + k0)],   // по море не се шофира — километрите не растат
    steps: [...a.steps, ...b.steps],
    ferries: [...a.ferries, ferry, ...b.ferries],
    distanceKm: a.distanceKm + b.distanceKm,
    durationH: a.durationH + b.durationH + ferry.minutes / 60,
  };
}

// ── Състоянието на пътуването в адреса (за „назад“ и за споделяне) ──

export const placeToParam = (p: Place) => [p.lat.toFixed(5), p.lon.toFixed(5), p.name, p.label].join("~");
export function placeFromParam(s: string): Place | null {
  const [lat, lon, name, ...rest] = s.split("~");
  const la = Number(lat), lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || !name) return null;
  return { lat: la, lon: lo, name, label: rest.join("~") || name };
}
