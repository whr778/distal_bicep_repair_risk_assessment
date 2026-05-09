"use client";

import { useMemo, useState } from "react";
import { simulateRecovery } from "@/lib/simulation";
import { ActivityLevel, SimulationProfile, WeekResult } from "@/lib/types";
import ReferencesTab from "./ReferencesTab";

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

const allPresets = Object.keys(scenarioPresets) as PresetKey[];
const scenarioColors: Record<PresetKey, string> = {
  acute: '#2563eb',
  smoker: '#dc2626',
  chronic: '#16a34a',
  athlete: '#ca8a04',
};

const currentProfileColor = '#8b5cf6';

const riskBadge = (forwardRisk: number) => {
  if (forwardRisk <= 0.005) return "risk-low";
  if (forwardRisk <= 0.015) return "risk-medium";
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
  const [activeTab, setActiveTab] = useState<"simulation" | "references">("simulation");
  const [hoveredPoint, setHoveredPoint] = useState<{
    chart: "risk" | "strength";
    week: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const results: WeekResult[] = useMemo(() => simulateRecovery(profile), [profile]);
  const allResults = useMemo(() => allPresets.map(preset => ({ preset, results: simulateRecovery(scenarioPresets[preset]) })), []);
  const currentProfileData = useMemo(() => ({ preset: 'current' as const, results }), [results]);

  const latest = results[results.length - 1];

  const riskChartDatas = useMemo(() => {
    const allRiskValues = [
      ...allResults.flatMap(({results}) => results.map(w => w.forwardRisk * 100)),
      ...currentProfileData.results.map(w => w.forwardRisk * 100),
    ];
    const globalMax = Math.max(2, ...allRiskValues);
    return [
      ...allResults.map(({preset, results}) => ({preset, data: buildChartData(results, w => w.forwardRisk * 100, globalMax), isCurrent: false})),
      { preset: 'current' as const, data: buildChartData(currentProfileData.results, w => w.forwardRisk * 100, globalMax), isCurrent: true }
    ];
  }, [allResults, currentProfileData]);
  const strengthChartDatas = useMemo(() => [
    ...allResults.map(({preset, results}) => ({preset, data: buildChartData(results, w => w.tendonStrength, 100), isCurrent: false})),
    { preset: 'current' as const, data: buildChartData(currentProfileData.results, w => w.tendonStrength, 100), isCurrent: true }
  ], [allResults, currentProfileData]);

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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
        <button
          onClick={() => setActiveTab("simulation")}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === "simulation" ? '#2563eb' : 'transparent',
            color: activeTab === "simulation" ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === "simulation" ? '600' : '500',
            borderBottom: activeTab === "simulation" ? '3px solid #2563eb' : 'none',
            transition: 'all 0.2s',
          }}
        >
          Simulation
        </button>
        <button
          onClick={() => setActiveTab("references")}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === "references" ? '#2563eb' : 'transparent',
            color: activeTab === "references" ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === "references" ? '600' : '500',
            borderBottom: activeTab === "references" ? '3px solid #2563eb' : 'none',
            transition: 'all 0.2s',
          }}
        >
          References
        </button>
      </div>

      {activeTab === "simulation" ? (
        <>
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
              <strong>Total re-injury risk over 26 weeks</strong>
              <span>{(results[0].forwardRisk * 100).toFixed(2)}%</span>
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
              <p>Remaining re-injury risk by week</p>
              <span>{`Max plotted risk: ${riskChartDatas[0].data.maxValue.toFixed(1)}%`}</span>
            </div>
            <svg viewBox="0 0 760 240" className="risk-graph" aria-label="Remaining re-injury risk timeline">
              <line x1="40" y1="24" x2="40" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="40" y1="204" x2="740" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = 24 + fraction * 180;
                const label = `${((1 - fraction) * riskChartDatas[0].data.maxValue).toFixed(1)}%`;
                return (
                  <g key={fraction}>
                    <line x1="36" y1={y} x2="740" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x="10" y={y + 4} fill="#475569" fontSize="10">{label}</text>
                  </g>
                );
              })}
              {riskChartDatas.map(({preset, data, isCurrent}) => (
                <g key={preset}>
                  <path 
                    d={data.path} 
                    fill="none" 
                    stroke={isCurrent ? currentProfileColor : scenarioColors[preset as PresetKey]} 
                    strokeWidth={isCurrent ? "4" : "3"} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    opacity={isCurrent ? "1" : "0.7"}
                  />
                  {data.points.map((point) => (
                    <circle
                      key={`${preset}-${point.week}`}
                      cx={point.x}
                      cy={point.y}
                      r={isCurrent ? "5" : "4"}
                      fill={isCurrent ? currentProfileColor : scenarioColors[preset as PresetKey]}
                      opacity={isCurrent ? "1" : "0.9"}
                      onMouseEnter={() => setHoveredPoint({ chart: "risk", week: point.week, value: point.value, x: point.x, y: point.y })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </g>
              ))}
              {hoveredPoint?.chart === "risk" && renderTooltip(hoveredPoint, "risk")}
              {riskChartDatas[0].data.points.filter((_, index) => index % 5 === 0).map((point) => (
                <g key={`tick-risk-${point.week}`}>
                  <line x1={point.x} y1="204" x2={point.x} y2="210" stroke="#94a3b8" strokeWidth="1" />
                  <text x={point.x} y="226" fill="#475569" fontSize="10" textAnchor="middle">{point.week}</text>
                </g>
              ))}
            </svg>
            <div className="chart-legend">
              {allPresets.map(preset => (
                <div key={preset} style={{ color: scenarioColors[preset], marginRight: '16px', display: 'inline-block', opacity: '0.7' }}>
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </div>
              ))}
              <div style={{ color: currentProfileColor, marginRight: '16px', display: 'inline-block', fontWeight: 'bold' }}>
                Current Profile
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <p>Tendon strength by week</p>
              <span>{`Max possible strength: ${strengthChartDatas[0].data.maxValue}%`}</span>
            </div>
            <svg viewBox="0 0 760 240" className="risk-graph" aria-label="Tendon strength timeline">
              <line x1="40" y1="24" x2="40" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="40" y1="204" x2="740" y2="204" stroke="#cbd5e1" strokeWidth="1" />
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = 24 + fraction * 180;
                const label = `${Math.round((1 - fraction) * 100)}%`;
                return (
                  <g key={fraction}>
                    <line x1="36" y1={y} x2="740" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x="10" y={y + 4} fill="#475569" fontSize="10">{label}</text>
                  </g>
                );
              })}
              {strengthChartDatas.map(({preset, data, isCurrent}) => (
                <g key={preset}>
                  <path 
                    d={data.path} 
                    fill="none" 
                    stroke={isCurrent ? currentProfileColor : scenarioColors[preset as PresetKey]} 
                    strokeWidth={isCurrent ? "4" : "3"} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    opacity={isCurrent ? "1" : "0.7"}
                  />
                  {data.points.map((point) => (
                    <circle
                      key={`${preset}-${point.week}`}
                      cx={point.x}
                      cy={point.y}
                      r={isCurrent ? "5" : "4"}
                      fill={isCurrent ? currentProfileColor : scenarioColors[preset as PresetKey]}
                      opacity={isCurrent ? "1" : "0.95"}
                      onMouseEnter={() => setHoveredPoint({ chart: "strength", week: point.week, value: point.value, x: point.x, y: point.y })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </g>
              ))}
              {hoveredPoint?.chart === "strength" && renderTooltip(hoveredPoint, "strength")}
              {strengthChartDatas[0].data.points.filter((_, index) => index % 5 === 0).map((point) => (
                <g key={`tick-strength-${point.week}`}>
                  <line x1={point.x} y1="204" x2={point.x} y2="210" stroke="#94a3b8" strokeWidth="1" />
                  <text x={point.x} y="226" fill="#475569" fontSize="10" textAnchor="middle">{point.week}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="timeline-table-wrapper">
          <table className="timeline-table">
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col">Remaining re-injury risk</th>
                <th scope="col">Rehab phase</th>
                <th scope="col">Healing phase</th>
                <th scope="col">Tendon strength</th>
                <th scope="col">Mobility</th>
              </tr>
            </thead>
            <tbody>
              {results.map((week) => (
                <tr key={week.week}>
                  <th scope="row">{week.week}</th>
                  <td>
                    <span className={riskBadge(week.forwardRisk)}>
                      {(week.forwardRisk * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td>{formatPhase(week.rehabPhase)}</td>
                  <td>{week.healingPhase}</td>
                  <td>{week.tendonStrength}%</td>
                  <td>{week.mobilityPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </>
      ) : (
        <ReferencesTab />
      )}
    </main>
  );
}
