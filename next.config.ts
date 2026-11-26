import type { NextConfig } from "next";
import path from "node:path";

// Изцяло статичен сайт: няма сървър, данните на потребителя не напускат браузъра.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Папката живее в монорепо с Enigma — коренът е тук, не горе.
  turbopack: { root: path.resolve(__dirname) },
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
