import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRIES } from "@/data/countries";
import { EN } from "@/data/countries.en";
import { CountryView } from "@/components/CountryView";
import { countryMetadata } from "@/lib/countryMeta";

const bySlugEn = (slug: string) => COUNTRIES.find(c => EN[c.code].slug === slug);
export const dynamicParams = false;
export function generateStaticParams() { return COUNTRIES.map(c => ({ slug: EN[c.code].slug })); }
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = bySlugEn((await params).slug); return c ? countryMetadata(c, "en") : {};
}
export default async function Page({ params }: P) {
  const c = bySlugEn((await params).slug); if (!c) notFound();
  return <CountryView country={c} lang="en" />;
}
