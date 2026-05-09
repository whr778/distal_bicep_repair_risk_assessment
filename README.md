# Distal Biceps Repair Simulation

Educational Next.js application modeling distal biceps tendon repair recovery.

## Setup

Install dependencies:

```bash
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Tests

Unit tests:

```bash
npm test
```

End-to-end tests:

```bash
npm run test:e2e
```

## What’s Included

- `app/page.tsx`: interactive simulation UI
- `lib/simulation.ts`: recovery engine based on healing and rehab phase rules
- `tests/simulation.test.ts`: Jest coverage for the simulation engine
- `tests/e2e/simulation.spec.ts`: Playwright smoke test
- `PLAN.md`: implementation plan for the simulation
