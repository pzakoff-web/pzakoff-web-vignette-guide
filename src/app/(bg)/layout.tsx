import "../globals.css";
import { Shell } from "@/components/Shell";
import { baseMetadata } from "@/lib/meta";
export { viewport } from "@/lib/meta";
export const metadata = baseMetadata("bg");
export default function Layout({ children }: { children: React.ReactNode }) { return <Shell lang="bg">{children}</Shell>; }
