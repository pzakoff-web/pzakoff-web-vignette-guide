// Курсовете на ЕЦБ към момента на build-а. При грешка остава последният записан файл.
import { writeFileSync } from "node:fs";
const out = new URL("../src/data/rates.json", import.meta.url);
try {
  const xml = await (await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", { signal: AbortSignal.timeout(10000) })).text();
  const date = xml.match(/time='([^']+)'/)?.[1];
  const rates = Object.fromEntries([...xml.matchAll(/currency='([A-Z]{3})' rate='([\d.]+)'/g)].map(m => [m[1], Number(m[2])]));
  if (!date || !rates.HUF) throw new Error("непознат формат");
  writeFileSync(out, JSON.stringify({ date, source: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", rates }, null, 2) + "\n");
  console.log("ECB курсове от", date);
} catch (e) {
  console.warn("Курсовете на ЕЦБ не са обновени:", e.message);
}
