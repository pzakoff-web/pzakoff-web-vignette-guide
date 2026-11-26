// Разпознаване на държавата по координати (граници: Natural Earth 1:50m през world-atlas).
import type { Topology, GeometryCollection } from "topojson-specification";
import { feature } from "topojson-client";

type Ring = [number, number][];
interface Shape { id: string; bbox: [number, number, number, number]; polys: Ring[][] }

let shapes: Shape[] | null = null;

export async function loadBorders(): Promise<void> {
  if (shapes) return;
  const topo = (await import("world-atlas/countries-50m.json")).default as unknown as Topology<{ countries: GeometryCollection }>;
  const fc = feature(topo, topo.objects.countries) as unknown as GeoJSON.FeatureCollection;
  shapes = [];
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) continue;
    const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as Ring[][];
    let minX = 180, minY = 90, maxX = -180, maxY = -90;
    for (const p of polys) for (const [x, y] of p[0]) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    // само Европа и околностите — за скорост
    if (maxX < -30 || minX > 50 || maxY < 30 || minY > 75) continue;
    shapes.push({ id: String(f.id).padStart(3, "0"), bbox: [minX, minY, maxX, maxY], polys });
  }
}

function inRing(x: number, y: number, r: Ring): boolean {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inShape(s: Shape, x: number, y: number): boolean {
  if (x < s.bbox[0] || x > s.bbox[2] || y < s.bbox[1] || y > s.bbox[3]) return false;
  return s.polys.some(p => inRing(x, y, p[0]) && !p.slice(1).some(h => inRing(x, y, h)));
}

/** ISO numeric код на държавата в точката (lon, lat) или null. `hint` — проверява се първо. */
export function countryAt(lon: number, lat: number, hint?: string | null): string | null {
  if (!shapes) throw new Error("loadBorders() не е извикан");
  if (hint) { const h = shapes.find(s => s.id === hint); if (h && inShape(h, lon, lat)) return hint; }
  for (const s of shapes) if (inShape(s, lon, lat)) return s.id;
  return null;
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
