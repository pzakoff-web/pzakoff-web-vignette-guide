import type { Metadata } from "next";
import { PrivacyView } from "@/components/PrivacyView";
import { alternates } from "@/lib/meta";
export const metadata: Metadata = { title: "Privacy", alternates: alternates("/poveritelnost/", "/en/privacy/", "en") };
export default function Page() { return <PrivacyView lang="en" />; }
