import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Instrument_Sans: () => ({ variable: "font-instrument-sans" }),
  JetBrains_Mono: () => ({ variable: "font-jetbrains-mono" }),
}));

vi.mock("../components/ui/NotificationProvider", () => ({
  default: () => null,
}));

import { metadata } from "./layout";

describe("root layout", () => {
  it("exports metadata defaults", () => {
    expect(metadata.title).toEqual({
      template: "%s - My Spending",
      default: "My Spending",
    });
  });
});
