// Дати като "YYYY-MM-DD" (UTC аритметика, без часови зони).
export const toDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const iso = (dt: Date) => dt.toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => { const dt = toDate(s); dt.setUTCDate(dt.getUTCDate() + n); return iso(dt); };
export const addMonths = (s: string, n: number) => {
  const dt = toDate(s);
  const day = dt.getUTCDate();
  dt.setUTCDate(1);
  dt.setUTCMonth(dt.getUTCMonth() + n);
  const last = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
  dt.setUTCDate(Math.min(day, last));
  return iso(dt);
};
export const weekday = (s: string) => toDate(s).getUTCDay(); // 0 = неделя
export const diffDays = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000);
export const fmt = (s: string) => { const [y, m, d] = s.split("-"); return `${d}.${m}.${y}`; };
export const range = (a: string, b: string) => { const out: string[] = []; for (let x = a; x <= b; x = addDays(x, 1)) out.push(x); return out; };
