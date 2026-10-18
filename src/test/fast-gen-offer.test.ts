import { describe, it, expect } from "vitest";
import { FAST_GEN_OFFER } from "@/components/FastGenOfferModal";

describe("oferta de Gerações Rápidas", () => {
  it("custa R$8,90 (890 centavos)", () => {
    expect(FAST_GEN_OFFER.amountCents).toBe(890);
  });

  it("entrega 100 créditos, o suficiente para 1 geração", () => {
    expect(FAST_GEN_OFFER.credits).toBe(100);
  });

  it("é um pagamento único, sem premium nem acesso vitalício", () => {
    expect(FAST_GEN_OFFER.planId).toBe("fast-generations");
    expect(FAST_GEN_OFFER.planName).toBe("Gerações Rápidas");
  });
});
