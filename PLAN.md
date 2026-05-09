# Distal Biceps Tendon Repair Simulation Plan

## Purpose
Build an educational, browser-based simulation of distal biceps tendon repair recovery using Next.js. The application will help learners understand biological healing, rehabilitation phases, and re-injury risk based on realistic clinical timelines.

## Goals
- Model tendon healing across inflammatory, proliferative, and remodeling phases
- Represent rehabilitation phases and safe activity progressions
- Visualize risk windows for re-rupture and complications
- Show the impact of compliance, smoking, chronic repair timing, and load management
- Support "what if" scenarios for educational exploration

## Audience
- Medical students and trainees
- Physical therapy students
- Patients seeking an educational overview of tendon repair recovery
- Educators building teaching tools for rehabilitation and orthopedics

## Technology Stack
- Frontend: Next.js (React)
- Styling: CSS Modules or Tailwind CSS
- Data / state management: React state + context or simple client-side store
- Simulation engine: JavaScript / TypeScript module in the Next.js app
- Visualization: charts and timeline components
- Testing: Jest for unit tests, Playwright for end-to-end integration

## Core Simulation Concepts
### Healing Phases
- Inflammatory Phase: Days 0–7, minimal tensile strength, highest vulnerability
- Proliferative / Repair Phase: Weeks 2–6, type III collagen formation, fragile scar tissue
- Remodeling Phase: Weeks 6–12+ months, maturation to type I collagen and aligned fibers

### Rehabilitation Phases
- Phase 1 (Weeks 0–6): immobilization, early protected range of motion, no forceful contraction
- Phase 2 (Weeks 6–12): active motion, light resistance, progressive strengthening
- Phase 3 (Weeks 12–26): advanced strengthening, functional tasks, return-to-sport preparation

### Re-Injury Risk Windows
- Weeks 1–3: highest risk, especially with non-compliance or sudden force
- Weeks 4–8: moderate risk if activity is too aggressive
- Weeks 9–12: low risk but still vulnerable under heavy load
- Weeks 13–26: very low risk unless traumatic or high-impact event

### Risk Factors
- Rehabilitation compliance
- Smoking or biological impairment
- Chronic repair timing (>4 weeks from injury)
- Heavy lifting or sudden high-impact activity
- Secondary complications such as nerve injury

## Application Architecture
### 1. Simulation Engine (core module)
- Time-step simulation at the weekly level
- State variables:
  - healingStage
  - tendonStrength
  - mobilityRange
  - painLevel
  - protectionStatus
  - complianceScore
  - riskScore
- Phase control and state transitions based on week index
- Activity inputs and safety checks
- Risk calculation and event generation for re-rupture or delayed healing

### 2. User Interface
- Landing page with simulation overview
- Patient profile form and scenario presets
- Week-by-week timeline dashboard
- Rehab phase progression display
- Activity selector with safe/unsafe categorization
- Risk meter and decision feedback
- Educational content panels summarizing phases and best practices

### 3. Scenario / Educational Mode
- Prebuilt profiles: standard repair, smoker, chronic repair, athlete
- Compare scenarios side-by-side
- Explain how choices affect risk and progress
- Highlight clinical guidance from rehabilitation and healing docs

### 4. Testing and Validation
- Unit tests for the simulation engine and risk logic
- Scenario tests for phase transitions and expected outputs
- Playwright E2E tests for user flows and visualization accuracy

## Implementation Roadmap
### Milestone 1: Foundations
- Scaffold Next.js app
- Create core simulation engine module in TypeScript
- Define data model for patient state and week progression
- Build basic UI pages and navigation

### Milestone 2: Interactive Simulation
- Add patient input controls and scenario presets
- Implement weekly progress and phase visualizations
- Display risk warnings and recommended actions
- Integrate simulation engine with UI state

### Milestone 3: Educational Content
- Add detailed descriptions of healing and rehab phases
- Add tooltips, learning cards, and phase guidelines
- Provide textual feedback for safe vs. unsafe activity choices

### Milestone 4: Testing and Refinement
- Create unit tests for all core simulation logic
- Add Playwright end-to-end tests for main flows
- Validate the model against the documented rehab and healing timelines
- Tune risk probabilities and phase transitions for educational realism

### Milestone 5: Polish and Deployment
- Refine UI and responsiveness
- Add legend, charts, and progress summary
- Prepare README and user guidance for educational use
- Deploy as a static or server-rendered Next.js site

## Notes
- The simulation is educational only and should not be used as medical advice.
- Focus on clear phase-based guidance, not clinical decision support.
- Use the documents from `POST_SURGICAL_REINJURY.md`, `REHABILITATION.md`, and `TENDON_HEALING_PROCESS.md` as the source for content and timeline rules.

## Next Step
Start implementation by scaffolding a Next.js project and building the simulation engine module with week-based healing and risk logic.