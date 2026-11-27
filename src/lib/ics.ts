// Напомняния като .ics файл — телефонът го отваря директно в календара. Без сървър и без регистрация.
import type { CountryPlan } from "./trip";
import { addDays, diffDays } from "./dates";
import { buyLink, type BuyCtx } from "./buy";
import { T, fmtDate, money, type Lang } from "./i18n";
import type { Vehicle } from "@/data/types";

export interface Reminder { date: string; title: string; body: string; url?: string }

/** Кога да напомним за покупка: преди 18-ия ден (Австрия) или 2 дни преди началото. */
export function reminders(plans: CountryPlan[], vehicle: Vehicle, ctx: BuyCtx, today: string, lang: Lang, depart: string, route: string): Reminder[] {
  const t = T[lang];
  const out: Reminder[] = [];
  for (const p of plans) {
    const c = p.country;
    if (!c || !p.cover) continue;
    for (const x of p.cover.purchases) {
      const link = buyLink(c, x.product, vehicle, ctx).url;
      const price = money(x.price, c.currency, lang);
      const delay = x.product.onlineConsumerDelayDays;
      let when = addDays(x.start, -2);
      let note = "";
      if (delay) {
        const lastOnline = addDays(x.start, -delay);
        if (lastOnline >= today) { when = addDays(lastOnline, -1); note = t.remindDelay(fmtDate(lastOnline, lang), delay); }
      }
      if (when < today) when = today;
      out.push({
        date: when,
        title: t.remindBuy(c.name, x.product.label, fmtDate(x.start, lang)),
        body: `${x.product.label} · ${fmtDate(x.start, lang)}${x.start !== x.end ? ` – ${fmtDate(x.end, lang)}` : ""} · ${price}${note ? `\n${note}` : ""}\n${t.remindOfficial}: ${link}`,
        url: link,
      });
      // годишни винетки — напомняне преди изтичане (за следващата година)
      if (diffDays(x.start, x.end) >= 300 && x.end > today) {
        out.push({ date: addDays(x.end, -3), title: t.remindExpire(c.name, fmtDate(x.end, lang)), body: `${x.product.label}\n${t.remindOfficial}: ${link}`, url: link });
      }
    }
  }
  out.push({ date: depart, title: t.remindDepart(route), body: t.remindDepartBody });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
// редовете над 75 байта се пренасят (RFC 5545)
const fold = (line: string) => {
  const out: string[] = []; let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 73) { out.push(cur); cur = " " + ch; } else cur += ch;
  }
  return [...out, cur].join("\r\n");
};

export function toIcs(items: Reminder[], site: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${site}//vignettes//EN`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  items.forEach((r, i) => {
    const d = r.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT", `UID:${d}-${i}-${Math.random().toString(36).slice(2, 8)}@${site}`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${addDays(r.date, 1).replace(/-/g, "")}`,
      fold(`SUMMARY:${esc(r.title)}`), fold(`DESCRIPTION:${esc(r.body)}`));
    if (r.url) lines.push(fold(`URL:${r.url}`));
    // напомняне в 9:00 същия ден
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", fold(`DESCRIPTION:${esc(r.title)}`), "TRIGGER;RELATED=START:PT9H", "END:VALARM", "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
