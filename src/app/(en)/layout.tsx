import "../globals.css";
import { Shell } from "@/components/Shell";
import { baseMetadata } from "@/lib/meta";
export { viewport } from "@/lib/meta";
export const metadata = baseMetadata("en");
export default function Layout({ children }: { children: React.ReactNode }) { return <Shell lang="en">{children}</Shell>; }
