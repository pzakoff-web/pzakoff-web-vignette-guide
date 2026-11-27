import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRIES, bySlug } from "@/data/countries";
import { CountryView } from "@/components/CountryView";
import { countryMetadata } from "@/lib/countryMeta";

export const dynamicParams = false;
export function generateStaticParams() { return COUNTRIES.map(c => ({ slug: c.slug })); }
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = bySlug((await params).slug); return c ? countryMetadata(c, "bg") : {};
}
export default async function Page({ params }: P) {
  const c = bySlug((await params).slug); if (!c) notFound();
  return <CountryView country={c} lang="bg" />;
}
