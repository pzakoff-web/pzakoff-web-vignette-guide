"use client";
import { useEffect, useRef, useState } from "react";
import { searchPlaces, type Place } from "@/lib/route";

export function PlaceInput({ label, value, onChange, onText, placeholder, lang = "bg" }: {
  label: string; value: Place | null; onChange: (p: Place | null) => void; onText?: (t: string) => void; placeholder?: string; lang?: "bg" | "en";
}) {
  const [q, setQ] = useState(value?.label || "");
  const [items, setItems] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const typed = useRef(false);

  useEffect(() => {
    if (!typed.current || q.trim().length < 2) { setItems([]); return; }
    const ctrl = new AbortController();
    const h = setTimeout(() => {
      searchPlaces(q.trim(), ctrl.signal, lang).then(r => { setItems(r); setActive(0); setOpen(true); }).catch(() => {});
    }, 250);
    return () => { clearTimeout(h); ctrl.abort(); };
  }, [q, lang]);

  const pick = (p: Place) => { typed.current = false; setQ(p.label); setOpen(false); onChange(p); onText?.(p.label); };
  // Мястото е намерено при натискане на бутона (Nominatim) — показваме го в полето.
  useEffect(() => { if (value && value.label !== q && !typed.current) setQ(value.label); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <label className="fld place">
      <span>{label}</span>
      <input
        value={q} placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={open} aria-autocomplete="list"
        onChange={e => { typed.current = true; setQ(e.target.value); onChange(null); onText?.(e.target.value); }}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={e => {
          if (!open || !items.length) return; // без предложения Enter изпраща формата
          if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
          if (e.key === "Enter") { e.preventDefault(); pick(items[active]); }
        }}
      />
      {open && items.length > 0 && (
        <ul className="suggest" role="listbox">
          {items.map((p, i) => (
            <li key={p.label + i} role="option" aria-selected={i === active} onMouseDown={() => pick(p)}>{p.label}</li>
          ))}
        </ul>
      )}
    </label>
  );
}
