import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";
import { alternates } from "@/lib/meta";
export const metadata: Metadata = { alternates: alternates("/", "/en/", "en") };
export default function Page() { return <HomeView lang="en" />; }
