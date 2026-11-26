const SYMBOL: Record<string, string> = { EUR: "€", CHF: "CHF", CZK: "Kč", HUF: "Ft", RON: "lei", DKK: "kr.", NOK: "kr", MKD: "ден." };
export function money(amount: number, currency: string): string {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  const s = amount.toLocaleString("bg-BG", { minimumFractionDigits: decimals, maximumFractionDigits: 2 });
  return currency === "EUR" ? `${s} €` : `${s} ${SYMBOL[currency] || currency}`;
}
export const eurApprox = (eur: number | null) => (eur == null ? "" : `≈ ${eur.toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
