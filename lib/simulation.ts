import { ActivityLevel, RehabPhase, HealingPhase, SimulationProfile, WeekResult } from "./types";

const healingPhaseForWeek = (week: number): HealingPhase => {
  if (week <= 1) return "inflammatory";
  if (week <= 6) return "repair";
  return "remodeling";
};

const rehabPhaseForWeek = (week: number): RehabPhase => {
  if (week <= 6) return "phase1";
  if (week <= 12) return "phase2";
  return "phase3";
};

const tendonStrengthForWeek = (week: number): number => {
  const progression = [0, 5, 12, 22, 32, 42, 52, 60, 68, 74, 80, 86, 92, 95, 97, 98, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100];
  return progression[Math.min(week, progression.length - 1)];
};

const mobilityForWeek = (week: number): number => {
  if (week <= 2) return 20 + week * 10;
  if (week <= 6) return 40 + (week - 2) * 8;
  if (week <= 12) return 70 + (week - 6) * 4;
  return Math.min(100, 100 - (26 - week) * 2);
};

const painForWeek = (week: number): number => {
  if (week <= 2) return 7 - week * 1.5;
  if (week <= 6) return 4.5 - (week - 2) * 0.4;
  if (week <= 12) return 3 - (week - 6) * 0.25;
  return Math.max(1, 1.5 - (week - 12) * 0.08);
};

const baseWeeklyRisk = (week: number): number => {
  // Early-window risk anchored to Hinchey et al. 2014 (PMID 24774620): 1.5% re-rupture rate, all within 3 weeks.
  // Later weeks taper to match overall ~1.4% pooled rate (Amarasooriya et al. 2020 systematic review, PMID 32091914).
  if (week <= 3) return 0.0015; // Highest risk period
  if (week <= 8) return 0.0009;
  if (week <= 12) return 0.00045;
  return 0.000225;
};

const activityMultiplier = (activity: ActivityLevel): number => {
  switch (activity) {
    case "none":
      return 0.5;
    case "low":
      return 1.0;
    case "moderate":
      return 1.8;
    case "high":
      return 3.2;
    default:
      return 1;
  }
};

const recommendedActivityForPhase = (phase: RehabPhase): ActivityLevel => {
  switch (phase) {
    case "phase1":
      return "none";
    case "phase2":
      return "low";
    default:
      return "moderate";
  }
};

const formatSummary = (
  week: number,
  phase: RehabPhase,
  activity: ActivityLevel,
  risk: number,
  braceUsage: boolean
): string => {
  const riskPercent = (risk * 100).toFixed(1);
  const recommended = recommendedActivityForPhase(phase);
  if (activity === recommended) {
    return `Week ${week}: staying within recommended activity. Re-injury risk is around ${riskPercent}% this week.`;
  }

  if (activity === "high" && phase !== "phase3") {
    return `Week ${week}: this activity level is too aggressive for ${phase}. Risk is elevated to ${riskPercent}% and re-rupture is more likely.`;
  }

  if (activity === "moderate" && phase === "phase1") {
    return `Week ${week}: moderate activity is unsafe in phase 1. Follow gentle mobility exercises instead.`;
  }

  return `Week ${week}: your selected activity is slightly above the phase recommendation, with a weekly risk near ${riskPercent}%.`; 
};

export const simulateRecovery = (profile: SimulationProfile): WeekResult[] => {
  const results: WeekResult[] = [];

  for (let week = 1; week <= 26; week += 1) {
    const healingPhase = healingPhaseForWeek(week);
    const rehabPhase = rehabPhaseForWeek(week);
    const tendonStrength = tendonStrengthForWeek(week);
    const mobilityPercent = mobilityForWeek(week);
    const painLevel = parseFloat(painForWeek(week).toFixed(1));

    let weeklyRisk = baseWeeklyRisk(week);
    weeklyRisk *= activityMultiplier(profile.activityLevel);
    weeklyRisk *= 1 + ((100 - profile.compliance) / 100) * 1.4;
    if (profile.smoker) weeklyRisk *= 1.35;
    if (profile.chronicRepair) weeklyRisk *= 1.5;
    if (rehabPhase === "phase1" && profile.activityLevel !== "none") {
      weeklyRisk *= 1.15;
    }
    if (profile.braceUsage && rehabPhase === "phase1") {
      weeklyRisk *= 0.9;
    }

    const riskScore = Math.min(1, parseFloat(weeklyRisk.toFixed(4)));
    const summary = formatSummary(week, rehabPhase, profile.activityLevel, riskScore, profile.braceUsage);
    const recommendedActivity = recommendedActivityForPhase(rehabPhase);

    results.push({
      week,
      healingPhase,
      rehabPhase,
      tendonStrength,
      mobilityPercent,
      painLevel,
      riskScore,
      recommendedActivity,
      summary,
    });
  }

  return results;
};
