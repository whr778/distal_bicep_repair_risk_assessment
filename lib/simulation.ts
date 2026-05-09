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

// Pooled re-rupture rate for the bin magnitudes (sample-size weighted, non-overlapping cohorts):
//   Amarasooriya 2020 systematic review (PMID 32091914): 43 / 3091 = 1.4%
//   ABOS Part II 2017-2020 (PMID 36273792):              50 / 2089 = 2.4%
//   Lappen 2025 strength athletes (PMID 40182566):        5 /  183 = 2.7%
//   Pooled:                                              98 / 5363 = 1.83% cumulative
//
// Timing distribution (shape of the curve) from the only studies reporting week-of-failure:
//   Hinchey 2014 (PMID 24774620):        3/3 failures in weeks 1-3
//   Lappen 2025 (PMID 40182566):         5/5 failures in weeks 4-8 (4 of 5 in chronic repairs)
//   Return to Play review (PMID 35195840): "all acute repair failures within first 6 weeks"
//
// Excluded from rate pooling: PMID 35045595 (re-rupture not separated from infection),
// PMID 25829956 (n=1 case report), PMID 40868593 (technique selection, no post-op rupture data).
//
// Bins reflect: ~50% of failures in weeks 1-3 (Hinchey), ~40% in weeks 4-8 (Lappen, weighted toward
// chronic — handled separately by chronicRepair multiplier), tail in weeks 9+. Cumulative base ~1.7%
// for a low-activity acute non-chronic patient, scaling up with the modifiers below.
const baseWeeklyRisk = (week: number): number => {
  if (week <= 3) return 0.0024;
  if (week <= 8) return 0.0014;
  if (week <= 12) return 0.0004;
  return 0.0001;
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
      forwardRisk: 0,
      recommendedActivity,
      summary,
    });
  }

  // Forward risk = P(re-injury between this week and week 26 | reached this week safely).
  // Computed by walking backward and accumulating survival from the tail.
  let survivalFromHere = 1;
  for (let i = results.length - 1; i >= 0; i -= 1) {
    survivalFromHere *= 1 - results[i].riskScore;
    results[i].forwardRisk = parseFloat((1 - survivalFromHere).toFixed(4));
  }

  return results;
};
