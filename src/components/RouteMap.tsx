"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function RouteMap({ coords, via = [] }: { coords: [number, number][]; via?: [number, number][] }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    import("leaflet").then(L => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const line = L.polyline(coords.map(([lon, lat]) => [lat, lon] as [number, number]), { color: "#0d1110", weight: 4, opacity: 0.9 }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [20, 20] });
      // контейнерът може още да не е с крайния си размер
      setTimeout(() => { map?.invalidateSize(); map?.fitBounds(line.getBounds(), { padding: [20, 20] }); }, 100);
      const dot = (ll: [number, number]) => L.circleMarker([ll[1], ll[0]], { radius: 7, color: "#fff", weight: 2, fillColor: "#0d1110", fillOpacity: 1 }).addTo(map!);
      dot(coords[0]); dot(coords[coords.length - 1]);
      for (const v of via) L.circleMarker([v[1], v[0]], { radius: 5, color: "#0d1110", weight: 2, fillColor: "#fff", fillOpacity: 1 }).addTo(map!);
    });
    return () => { cancelled = true; map?.remove(); };
  }, [coords, via]);
  return <div ref={el} className="map" role="img" aria-label="Карта на маршрута" />;
}
