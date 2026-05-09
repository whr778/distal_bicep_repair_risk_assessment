import { simulateRecovery } from "@/lib/simulation";

describe("simulateRecovery", () => {
  it("generates 26 weeks of data", () => {
    const results = simulateRecovery({
      compliance: 95,
      smoker: false,
      chronicRepair: false,
      activityLevel: "low",
      braceUsage: true,
    });

    expect(results).toHaveLength(26);
    expect(results[0].week).toBe(1);
    expect(results[25].week).toBe(26);
  });

  it("increases tendon strength over time", () => {
    const results = simulateRecovery({
      compliance: 90,
      smoker: false,
      chronicRepair: false,
      activityLevel: "none",
      braceUsage: true,
    });

    expect(results[0].tendonStrength).toBeLessThan(results[12].tendonStrength);
    expect(results[12].tendonStrength).toBeLessThan(results[25].tendonStrength);
  });

  it("returns a higher risk profile for smokers", () => {
    const control = simulateRecovery({
      compliance: 95,
      smoker: false,
      chronicRepair: false,
      activityLevel: "low",
      braceUsage: true,
    });
    const smoker = simulateRecovery({
      compliance: 95,
      smoker: true,
      chronicRepair: false,
      activityLevel: "low",
      braceUsage: true,
    });

    const controlAverage = control.reduce((sum, week) => sum + week.riskScore, 0) / control.length;
    const smokerAverage = smoker.reduce((sum, week) => sum + week.riskScore, 0) / smoker.length;

    expect(smokerAverage).toBeGreaterThan(controlAverage);
  });
});
