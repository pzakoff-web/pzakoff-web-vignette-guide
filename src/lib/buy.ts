// Директни линкове към официалните магазини — колкото е възможно по-близо до плащането.
// Чехия официално приема параметри (OrderWizardFromParams): вид винетка, държава и номер се попълват сами.
// България: директно към избрания вид винетка. Останалите: страницата за покупка.
import type { Country, Product, Vehicle } from "@/data/types";

/** ID на държавите в чешкия магазин (от публичния им списък, 27.11.2026). */
const CZ_COUNTRY: Record<string, string> = {
  AL: "3048cf17-a548-484f-b3dd-d35ff70754fb",
  AT: "16bd8180-5b31-41b9-9f6a-cb71ce7b6203",
  BA: "b61d353f-4491-487c-a112-3eb47f28e2b3",
  BE: "f943aa1e-a804-45cd-891b-a3f7b2fe0e66",
  BG: "15a65497-4577-4918-bf38-24dadb2b0fa0",
  CH: "28e85b1f-17da-43fd-a9bf-b44223269506",
  CY: "71cdb5ec-3e7f-43f7-bd68-9bc6b5ce3b51",
  CZ: "3906ba89-153c-4038-8e36-0ca1deb76076",
  DE: "293ca65b-bf62-4e3b-b8b4-716e62ac5f6b",
  DK: "4f192c14-fe33-4cb9-98c7-d5d602f41bc9",
  EE: "94dc2260-8059-4af4-8baa-7ab201909cf5",
  ES: "13f59fab-a8a4-49ed-b32b-af65457c7fe6",
  FI: "3fbba1fb-0079-46f4-a7f9-93415e994155",
  FR: "ace7a98f-445c-4664-8639-61e87e494de8",
  GB: "59f1b36e-2499-4b8a-84f7-2802be2187aa",
  GR: "b6fdcbbb-50d1-4366-ab00-65e941a36d24",
  HR: "3cd92e2f-337a-44ce-bd5a-bcf55111341d",
  HU: "99f9a2e0-7f6f-4c2c-b53b-8737354811e9",
  IE: "470c2530-9d91-41b0-8982-a26652375558",
  IT: "0aaa68b7-6c89-4c3c-9dd6-ada70111ef85",
  LI: "230c7f57-7260-45b0-b162-cca7462d7bb3",
  LT: "ab63dda3-b44a-4019-90d0-da6cbb96ce49",
  LU: "2f3da0a7-1919-4cdd-930e-3ee664aced89",
  LV: "8720ec97-0b13-4c95-94fe-bff5bfd155b3",
  MD: "bc3cf4ba-ca9e-412a-978a-3e0c67b73af9",
  ME: "ac51597e-8ff4-4814-ac41-ee2f47aaecc1",
  MK: "745c2efc-51a9-484c-964e-8fbce5068cd7",
  MT: "c14a5551-c45c-499c-a8a1-a2a92666593e",
  NL: "d01b358e-6810-4bb4-aa9c-6219695b1eda",
  NO: "94f2c333-d21d-400e-b917-397e830c4deb",
  PL: "86706082-1ae3-4905-9f5a-94e04b914d4a",
  PT: "e7c069aa-4e78-4070-bd2b-2bcd3d4fffb8",
  RO: "ac6744d1-7b47-416c-b97b-aa7a83ce78b4",
  RS: "f82880d1-636e-448a-839c-bbb77504cbb0",
  SE: "305a6d73-fe21-4a79-83d9-d15d2fa349ac",
  SI: "2c4189eb-e3f2-4c65-b04d-4f96c06b7961",
  SK: "d2b5b887-3671-43de-b40e-47e4f8517d4a",
  TR: "57721ab5-8eed-4ce2-8a73-90bdf5205007",
  UA: "459b8704-1c41-4db6-ae60-48aae56b3bcc",
  XK: "86ed5e25-bf91-44e7-8a1c-c7a052e57815",
};
const CZ_CHARGE: Record<string, string> = {
  "1d": "090f3471-237a-4a79-9efd-30e176c23372",
  "10d": "9e5b7da5-b131-4bca-8d85-11c2b672948b",
  "30d": "e61899ec-399b-437a-9795-c4c85846c7d6",
  "1y": "e2cdb83a-7f84-4768-a2f0-081dc2e416cf",
};
/** vignetteTypeID в BGTOLL за МПС до 3,5 t. */
const BG_TYPE: Record<string, number> = { "1d": 27, we: 5, "7d": 1, "1m": 2, "3m": 3, "1y": 4 };

export interface BuyCtx { plate?: string; plateCountry?: string }
export interface BuyLink { url: string; level: "prefilled" | "product" | "shop" }

// Българските номера ползват само букви, които изглеждат еднакво на кирилица и латиница.
const CYR: Record<string, string> = { А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", У: "Y", Х: "X" };
export const cleanPlate = (s: string) => s.toUpperCase().replace(/[АВЕКМНОРСТУХ]/g, ch => CYR[ch]).replace(/[^A-Z0-9А-Я]/g, "");

export function buyLink(c: Country, p: Product, v: Vehicle, ctx: BuyCtx = {}): BuyLink {
  const plate = ctx.plate ? cleanPlate(ctx.plate) : "";
  if (c.code === "CZ" && CZ_CHARGE[p.id]) {
    const q = new URLSearchParams({ chargeTypeId: CZ_CHARGE[p.id] });
    const cid = ctx.plateCountry ? CZ_COUNTRY[ctx.plateCountry] : undefined;
    if (cid) q.set("countryId", cid);
    // чешкият магазин иска латиница; номер с други кирилски букви не попълваме
    if (plate && /^[A-Z0-9]+$/.test(plate)) q.set("licensePlate", plate);
    return { url: `https://edalnice.gov.cz/en/simple-purchase?${q}`, level: q.has("licensePlate") ? "prefilled" : "product" };
  }
  if (c.code === "BG") {
    if (v.kind === "car" && BG_TYPE[p.id]) return { url: `https://web.bgtoll.bg/Evignette/Create?vignetteTypeID=${BG_TYPE[p.id]}`, level: "product" };
    if (v.kind === "carTrailer") return { url: "https://web.bgtoll.bg/Evignette/ValidityPeriod?vignetteVehicleTypeID=2", level: "product" };
  }
  if (c.code === "AT") return { url: `https://shop.asfinag.at/de/maut-produkte/digitale-vignette/?type=${v.kind === "moto" ? "Motorbike" : "Car"}`, level: "product" };
  if (c.code === "SK") return { url: "https://eznamka.sk/selfcare/purchase", level: "shop" };
  if (c.code === "HU") return { url: "https://ematrica.nemzetiutdij.hu/en/vignette-purchase", level: "shop" };
  return { url: c.official[0]?.url || "#", level: "shop" };
}
