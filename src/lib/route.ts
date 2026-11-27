// Маршрут (OSRM) и търсене на места (Photon). Адресите се сменят с env променливи.
export const ROUTER_URL = (process.env.NEXT_PUBLIC_OSRM_URL || "https://router.project-osrm.org").replace(/\/$/, "");
export const GEOCODER_URL = (process.env.NEXT_PUBLIC_PHOTON_URL || "https://photon.komoot.io").replace(/\/$/, "");

export const NOMINATIM_URL = (process.env.NEXT_PUBLIC_NOMINATIM_URL || "https://nominatim.openstreetmap.org").replace(/\/$/, "");

export interface Place { name: string; label: string; lat: number; lon: number }

/**
 * Еднократно търсене (при натискане на бутона), което разбира и български имена на чужди градове.
 * Правилата на Nominatim забраняват автодовършване, затова тук не се вика при писане.
 */
export async function resolvePlace(q: string, signal?: AbortSignal): Promise<Place | null> {
  const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=1&accept-language=bg&featureType=settlement`;
  const r = await fetch(url, { signal });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.length) return null;
  const label = String(j[0].display_name).split(", ").filter((_: string, i: number, a: string[]) => i === 0 || i >= a.length - 2).join(", ");
  return { name: String(j[0].name || j[0].display_name.split(",")[0]), label, lat: Number(j[0].lat), lon: Number(j[0].lon) };
}

export async function searchPlaces(q: string, signal?: AbortSignal): Promise<Place[]> {
  const url = `${GEOCODER_URL}/api/?q=${encodeURIComponent(q)}&limit=6&osm_tag=place&bbox=-25,34,45,72`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error("Търсенето не отговаря");
  const j = await r.json();
  return (j.features || []).map((f: { properties: Record<string, string>; geometry: { coordinates: [number, number] } }) => {
    const p = f.properties;
    const name = p.name || p.city || "";
    const label = [name, p.state !== name ? p.state : null, p.country].filter(Boolean).join(", ");
    return { name, label, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
  });
}

export interface RouteResult {
  coords: [number, number][];  // [lon, lat]
  cumSec: number[];            // кумулативно време до всяка точка
  cumKm: number[];
  distanceKm: number;
  durationH: number;
}

export async function fetchRoute(points: Place[], signal?: AbortSignal): Promise<RouteResult> {
  const path = points.map(p => `${p.lon},${p.lat}`).join(";");
  const url = `${ROUTER_URL}/route/v1/driving/${path}?overview=full&geometries=geojson&annotations=duration,distance`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error("Маршрутът не може да бъде изчислен в момента. Опитайте след малко.");
  const j = await r.json();
  if (j.code !== "Ok" || !j.routes?.length) throw new Error("Не намерихме маршрут между тези места");
  const route = j.routes[0];
  const coords = route.geometry.coordinates as [number, number][];
  const durs: number[] = route.legs.flatMap((l: { annotation: { duration: number[] } }) => l.annotation.duration);
  const dists: number[] = route.legs.flatMap((l: { annotation: { distance: number[] } }) => l.annotation.distance);
  const cumSec = [0], cumKm = [0];
  for (let i = 0; i < coords.length - 1; i++) {
    cumSec.push(cumSec[i] + (durs[i] ?? 0));
    cumKm.push(cumKm[i] + (dists[i] ?? 0) / 1000);
  }
  return { coords, cumSec, cumKm, distanceKm: route.distance / 1000, durationH: route.duration / 3600 };
}

// ── Състоянието на пътуването в адреса (за „назад“ и за споделяне) ──

export const placeToParam = (p: Place) => [p.lat.toFixed(5), p.lon.toFixed(5), p.name, p.label].join("~");
export function placeFromParam(s: string): Place | null {
  const [lat, lon, name, ...rest] = s.split("~");
  const la = Number(lat), lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || !name) return null;
  return { lat: la, lon: lo, name, label: rest.join("~") || name };
}
