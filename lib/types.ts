export type HealingPhase = "inflammatory" | "repair" | "remodeling";
export type RehabPhase = "phase1" | "phase2" | "phase3";
export type ActivityLevel = "none" | "low" | "moderate" | "high";

export interface SimulationProfile {
  compliance: number;
  smoker: boolean;
  chronicRepair: boolean;
  activityLevel: ActivityLevel;
  braceUsage: boolean;
}

export interface WeekResult {
  week: number;
  healingPhase: HealingPhase;
  rehabPhase: RehabPhase;
  tendonStrength: number;
  mobilityPercent: number;
  painLevel: number;
  riskScore: number;
  forwardRisk: number;
  recommendedActivity: ActivityLevel;
  summary: string;
}
