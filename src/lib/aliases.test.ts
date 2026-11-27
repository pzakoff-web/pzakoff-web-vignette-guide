import { describe, it, expect } from "vitest";
import { aliasQuery } from "./aliases";
describe("български имена на градове", () => {
  it("кирилица и латиница", () => {
    expect(aliasQuery("Атина")).toBe("Athens");
    expect(aliasQuery("  atina ")).toBe("Athens");
    expect(aliasQuery("Цариград")).toBe("Istanbul");
    expect(aliasQuery("Нови сад")).toBe("Novi Sad");
    expect(aliasQuery("Будапеща")).toBe("Budapest");
    expect(aliasQuery("Варна")).toBeNull();
  });
  it("показвано българско име", async () => {
    const { bgName } = await import("./aliases");
    expect(bgName("Athens")).toBe("Атина");
    expect(bgName("Novi Sad")).toBe("Нови Сад");
    expect(bgName("Cluj-Napoca")).toBe("Клуж");
  });
});
