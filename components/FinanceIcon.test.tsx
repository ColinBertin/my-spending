import { describe, expect, it } from "vitest";
import { FinanceIcon } from "./FinanceIcon";

describe("FinanceIcon", () => {
  it("returns icon element with mapped color", () => {
    const element = FinanceIcon({
      icon: "HiShoppingBag",
      iconPack: "hi",
      iconColor: "rose",
    });

    expect(element).not.toBeNull();
    expect(
      (element as { props: { style: { color: string } } }).props.style.color,
    ).toBe("#FEE2E2");
  });

  it("returns null for unknown icon name", () => {
    const element = FinanceIcon({
      icon: "UnknownIcon",
      iconPack: "hi",
      iconColor: "rose",
    });

    expect(element).toBeNull();
  });
});
