import type { Metadata } from "next";
import { PrivacyView } from "@/components/PrivacyView";
import { alternates } from "@/lib/meta";
export const metadata: Metadata = { title: "Поверителност", alternates: alternates("/poveritelnost/", "/en/privacy/", "bg") };
export default function Page() { return <PrivacyView lang="bg" />; }
