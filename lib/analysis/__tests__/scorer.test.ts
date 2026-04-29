import { calculateVisibilityScore } from "@/lib/analysis/scorer";

declare const describe: (name: string, run: () => void) => void;
declare const it: (name: string, run: () => void) => void;
declare const expect: (value: number) => { toBe: (expected: number) => void };

describe("calculateVisibilityScore", () => {
  it("returns the floor score for all zero inputs", () => {
    expect(
      calculateVisibilityScore({
        mentions: 0,
        firstPosition: 999,
        totalModels: 4,
        modelsPresent: 0,
        sentimentScore: 0
      })
    ).toBe(0);
  });

  it("caps a near-perfect brand at 100", () => {
    expect(
      calculateVisibilityScore({
        mentions: 50,
        firstPosition: 1,
        totalModels: 5,
        modelsPresent: 5,
        sentimentScore: 1
      })
    ).toBe(100);
  });

  it("keeps an absent brand at zero even with no sentiment penalty", () => {
    expect(
      calculateVisibilityScore({
        mentions: 0,
        firstPosition: 999,
        totalModels: 3,
        modelsPresent: 0,
        sentimentScore: 0
      })
    ).toBe(0);
  });

  it("scores a frequently mentioned first-position brand as dominant", () => {
    expect(
      calculateVisibilityScore({
        mentions: 8,
        firstPosition: 1,
        totalModels: 4,
        modelsPresent: 4,
        sentimentScore: 0.6
      })
    ).toBe(97);
  });

  it("applies a negative sentiment penalty to otherwise visible brands", () => {
    expect(
      calculateVisibilityScore({
        mentions: 3,
        firstPosition: 2,
        totalModels: 4,
        modelsPresent: 2,
        sentimentScore: -1
      })
    ).toBe(54);
  });
});
