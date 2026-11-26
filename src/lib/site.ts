// Работно име — сменя се само тук.
export const SITE = {
  name: "Vignette.guide",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://vignette.guide").replace(/\/$/, ""),
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
};
