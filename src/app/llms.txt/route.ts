// Обобщение за AI агенти: официални сайтове и цени с дата на проверка.
import { COUNTRIES } from "@/data/countries";
import type { Vehicle } from "@/data/types";
import { SITE } from "@/lib/site";
export const dynamic = "force-static";
const CAR: Vehicle = { kind: "car", powertrain: "standard", euroClass: "euro6" };
export function GET() {
  const lines = [`# ${SITE.name}`, "", "> Independent guide to European road vignettes and tolls. Links only to official government sites; no resellers.", ""];
  for (const c of COUNTRIES) {
    lines.push(`## ${c.nameEn} (${c.code}) — checked ${c.checkedAt}${c.status !== "verified" ? `, status: ${c.status}` : ""}`);
    for (const l of c.official) lines.push(`- Official: ${l.url}`);
    for (const p of c.products || []) { const v = p.price(CAR); if (v != null) lines.push(`- Car, ${p.id}: ${v} ${c.currency}`); }
    for (const t of c.sectionTolls || []) if (t.priceCar != null) lines.push(`- Section toll ${t.road}: ${t.priceCar} ${c.currency}`);
    lines.push(`- Details: ${SITE.url}/${c.slug}/`, "");
  }
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
