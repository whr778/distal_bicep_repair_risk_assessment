"use client";

import { useMemo, useState } from "react";
import { simulateRecovery } from "@/lib/simulation";
import { ActivityLevel, SimulationProfile, WeekResult } from "@/lib/types";

type PresetKey = "acute" | "smoker" | "chronic" | "athlete";

const activityOptions: { label: string; value: ActivityLevel }[] = [
  { label: "No load / protection only", value: "none" },
  { label: "Low intensity / gentle motion", value: "low" },
  { label: "Moderate strength work", value: "moderate" },
  { label: "High-impact or heavy resistance", value: "high" },
];

const summaryText: Record<PresetKey, string> = {
  acute: "Typical distal biceps repair profile with acute surgical repair and standard rehabilitation.",
  smoker: "This profile simulates a patient who smokes, which increases risk and slows healing slightly.",
  chronic: "This profile represents a chronic repair with more tendon retraction and a slightly slower recovery timeline.",
  athlete: "Athletic profile focused on return to sport, with a higher risk when activity is advanced too quickly.",
};

const scenarioPresets: Record<PresetKey, SimulationProfile> = {
  acute: {
    compliance: 92,
    smoker: false,
    chronicRepair: false,
    activityLevel: "low",
    braceUsage: true,
  },
  smoker: {
    compliance: 88,
    smoker: true,
    chronicRepair: false,
    activityLevel: "low",
    braceUsage: true,
  },
  chronic: {
    compliance: 90,
    smoker: false,
    chronicRepair: true,
    activityLevel: "low",
    braceUsage: true,
  },
  athlete: {
    compliance: 95,
    smoker: false,
    chronicRepair: false,
    activityLevel: "moderate",
    braceUsage: false,
  },
};

const riskBadge = (risk: number) => {
  if (risk <= 0.01) return "risk-low";
  if (risk <= 0.02) return "risk-medium";
  return "risk-high";
};

function formatPhase(phase: string) {
  switch (phase) {
    case "phase1":
      return "Phase 1: Protection & early motion";
    case "phase2":
      return "Phase 2: Intermediate strengthening";
    case "phase3":
      return "Phase 3: Advanced return to sport";
    default:
      return phase;
  }
}

function activityLabel(level: ActivityLevel) {
  return activityOptions.find((item) => item.value === level)?.label ?? level;
}

const buildChartData = (
  results: WeekResult[],
  accessor: (week: WeekResult) => number,
  minMaxValue: number
) => {
  const values = results.map(accessor);
  const maxValue = Math.max(minMaxValue, ...values);
  const graphWidth = 700;
  const graphHeight = 180;
  const margin = { top: 24, right: 20, bottom: 28, left: 40 };
  const plotWidth = graphWidth - margin.left - margin.right;
  const plotHeight = graphHeight - margin.top - margin.bottom;

  const points = results.map((week, index) => {
    const x = margin.left + (index / (results.length - 1)) * plotWidth;
    const value = accessor(week);
    const y = margin.top + (1 - Math.min(value / maxValue, 1)) * plotHeight;
    return { week: week.week, x, y, value };
  });

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");

  return { points, path, maxValue };
};

export default function Home() {
  const [preset, setPreset] = useState<keyof typeof scenarioPresets>("acute");
  const [profile, setProfile] = useState<SimulationProfile>(scenarioPresets.acute);
  const [hoveredPoint, setHoveredPoint] = useState<{
    chart: "risk" | "strength";
    week: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const results: WeekResult[] = useMemo(() => simulateRecovery(profile), [profile]);

  const latest = results[results.length - 1];
  const averageRisk = useMemo(
    () => results.reduce((sum, week) => sum + week.riskScore, 0) / results.length,
    [results]
  );

  const riskChartData = useMemo(
    () => buildChartData(results, (week) => week.riskScore * 100, 5),
    [results]
  );
  const strengthChartData = useMemo(
    () => buildChartData(results, (week) => week.tendonStrength, 100),
    [results]
  );

  const renderTooltip = (point: { week: number; value: number; x: number; y: number }, chart: "risk" | "strength") => {
    const label = chart === "risk" ? `${point.value.toFixed(1)}% risk` : `${point.value.toFixed(0)}% strength`;
    const x = Math.min(point.x, 740 - 120);
    const y = Math.max(28, point.y - 42);

    return (
      <g pointerEvents="none">
        <rect x={x} y={y} width="120" height="36" rx="10" fill="#0f172a" opacity="0.92" />
        <text x={x + 8} y={y + 16} fill="#f8fafc" fontSize="10" fontWeight="700">
          Week {point.week}
        </text>
        <text x={x + 8} y={y + 30} fill="#f8fafc" fontSize="12" fontWeight="700">
          {label}
        </text>
      </g>
    );
  };

  return (
    <main className="page-shell">
      <section className="header">
        <span>Educational Simulation</span>
        <h1>Distal Biceps Repair Recovery Simulator</h1>
        <p>
          Explore how tendon healing, rehabilitation phases, and activity choices affect re-injury risk during the first 26 weeks after distal biceps repair.
        </p>
      </section>

      <div className="grid-two">
        <section className="panel control-group">
          <h2>Patient profile</h2>
          <label>
            Scenario preset
            <select
              value={preset}
              onChange={(event) => {
                const nextPreset = event.target.value as keyof typeof scenarioPresets;
                setPreset(nextPreset);
                setProfile(scenarioPresets[nextPreset]);
              }}
            >
              <option value="acute">Acute repair</option>
              <option value="smoker">Smoker</option>
              <option value="chronic">Chronic repair</option>
              <option value="athlete">Athlete</option>
            </select>
          </label>
          <p>{summaryText[preset]}</p>

          <label>
            Compliance with rehab plan ({profile.compliance}%)
            <input
              type="range"
              min="60"
              max="100"
              value={profile.compliance}
              onChange={(event) => setProfile({ ...profile, compliance: Number(event.target.value) })}
            />
          </label>
          <label>
            Smoking status
            <select
              value={profile.smoker ? "yes" : "no"}
              onChange={(event) => setProfile({ ...profile, smoker: event.target.value === "yes" })}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label>
            Chronic repair
            <select
              value={profile.chronicRepair ? "yes" : "no"}
              onChange={(event) => setProfile({ ...profile, chronicRepair: event.target.value === "yes" })}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label>
            Brace usage in phase 1
            <select
              value={profile.braceUsage ? "yes" : "no"}
              onChange={(event) => setProfile({ ...profile, braceUsage: event.target.value === "yes" })}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            Selected activity level
            <select
              value={profile.activityLevel}
              onChange={(event) => setProfile({ ...profile, activityLevel: event.target.value as ActivityLevel })}
            >
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="panel">
          <h2>Simulation summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <strong>Final tendon strength</strong>
              <span>{latest.tendonStrength}%</span>
            </div>
            <div className="summary-card">
              <strong>Final mobility</strong>
              <span>{latest.mobilityPercent}%</span>
            </div>
            <div className="summary-card">
              <strong>Average weekly re-injury risk</strong>
              <span>{(averageRisk * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <strong>Current phase</strong>
            <p>{formatPhase(latest.rehabPhase)}</p>
            <strong>Last summary</strong>
            <p>{latest.summary}</p>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Recovery timeline</h2>
        <div className="chart-grid">
          <div className="chart-card">
            <div className="chart-header">
              <p>Risk of re-injury by week</p>
              <span>{`Max plotted risk: ${riskChartData.maxValue.toFixed(1)}%`}</span>
            </div>
            <svg viewBox="0 0 760 240" className="risk-graph" aria-label="Re-injury risk timeline">
              <line x1="40" y1="24" x2="40" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="40" y1="204" x2="740" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = 24 + fraction * 180;
                const label = `${Math.round((1 - fraction) * riskChartData.maxValue)}%`;
                return (
                  <g key={fraction}>
                    <line x1="36" y1={y} x2="740" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x="10" y={y + 4} fill="#475569" fontSize="10">{label}</text>
                  </g>
                );
              })}
              <path d={riskChartData.path} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {riskChartData.points.map((point) => (
                <circle
                  key={point.week}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#2563eb"
                  opacity="0.9"
                  onMouseEnter={() => setHoveredPoint({ chart: "risk", week: point.week, value: point.value, x: point.x, y: point.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
              {hoveredPoint?.chart === "risk" && renderTooltip(hoveredPoint, "risk")}
              {riskChartData.points.filter((_, index) => index % 5 === 0).map((point) => (
                <g key={`tick-risk-${point.week}`}>
                  <line x1={point.x} y1="204" x2={point.x} y2="210" stroke="#94a3b8" strokeWidth="1" />
                  <text x={point.x} y="226" fill="#475569" fontSize="10" textAnchor="middle">{point.week}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <p>Tendon strength by week</p>
              <span>{`Max possible strength: ${strengthChartData.maxValue}%`}</span>
            </div>
            <svg viewBox="0 0 760 240" className="risk-graph" aria-label="Tendon strength timeline">
              <line x1="40" y1="24" x2="40" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="40" y1="204" x2="740" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = 24 + fraction * 180;
                const label = `${Math.round((1 - fraction) * strengthChartData.maxValue)}%`;
                return (
                  <g key={fraction}>
                    <line x1="36" y1={y} x2="740" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x="10" y={y + 4} fill="#475569" fontSize="10">{label}</text>
                  </g>
                );
              })}
              <path d={strengthChartData.path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {strengthChartData.points.map((point) => (
                <circle
                  key={point.week}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#0f766e"
                  opacity="0.95"
                  onMouseEnter={() => setHoveredPoint({ chart: "strength", week: point.week, value: point.value, x: point.x, y: point.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
              {hoveredPoint?.chart === "strength" && renderTooltip(hoveredPoint, "strength")}
              {strengthChartData.points.filter((_, index) => index % 5 === 0).map((point) => (
                <g key={`tick-strength-${point.week}`}>
                  <line x1={point.x} y1="204" x2={point.x} y2="210" stroke="#94a3b8" strokeWidth="1" />
                  <text x={point.x} y="226" fill="#475569" fontSize="10" textAnchor="middle">{point.week}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="timeline">
          {results.map((week) => (
            <div key={week.week} className="timeline-item">
              <strong>Week {week.week}</strong>
              <div>
                <span className={riskBadge(week.riskScore)}>
                  {Math.round(week.riskScore * 1000) / 10}% risk
                </span>
              </div>
              <p>{formatPhase(week.rehabPhase)}</p>
              <p>Healing: {week.healingPhase}</p>
              <p>Tendon strength: {week.tendonStrength}%</p>
              <p>Mobility: {week.mobilityPercent}%</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
