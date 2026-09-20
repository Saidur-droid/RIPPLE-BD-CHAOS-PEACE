# Technical Architecture

## Architecture principle

**Static-first, deterministic, privacy-light, zero-paid-dependency.**

The MVP should survive a live judging demo without depending on:
- an LLM API,
- a remote database,
- authentication,
- third-party analytics,
- unstable external content.

## Proposed stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Motion or CSS transitions
- Lucide icons
- JSON scenario definitions
- localStorage/sessionStorage for temporary progress
- GitHub Pages for hosting

## Suggested structure

```text
src/
├── app/
├── components/
│   ├── FeedCard/
│   ├── DecisionPanel/
│   ├── RippleTimeline/
│   ├── RewindTransition/
│   ├── XRayPanel/
│   ├── ShieldMode/
│   └── ReflexProfile/
├── engine/
│   ├── scenarioEngine.ts
│   ├── rippleEngine.ts
│   ├── scoring.ts
│   └── retention.ts
├── scenarios/
│   ├── croppedClip.ts
│   ├── viralMeme.ts
│   └── missingVoice.ts
├── data/
├── pages/
└── styles/
```

## Scenario data model

Each scenario should contain:
- metadata,
- learning objective,
- baseline decision,
- decisions[],
- immediate effects,
- secondary effects,
- human consequence,
- community consequence,
- x-ray mechanisms,
- rewind state,
- peace choices,
- score deltas,
- debrief.

## Ripple Engine

The engine should be deterministic.

Example conceptual output:
```ts
{
  reach: +24,
  hostility: +18,
  targetSafety: -15,
  communityTrust: -11
}
```

These are **simulation values**, not claims about real-world causal effect sizes. UI must label them as simulation indicators.

## Scoring engine

Scores are scenario-learning metrics, not psychological diagnoses.

Dimensions:
- verification,
- manipulation recognition,
- bystander response,
- target support,
- de-escalation.

## Privacy

Pre-submission build should not require:
- name,
- phone,
- email,
- NID,
- social-media handle,
- location.

Pilot linking for Day-7 can use random participant codes.

## Accessibility

Minimum:
- semantic buttons,
- visible focus states,
- no information conveyed by color alone,
- reduced-motion setting respected,
- readable contrast,
- Bangla text testing,
- screen-reader labels for interactive cards.

## Deployment

Primary: GitHub Pages.

For the judged demo:
- preload all scenario content,
- avoid remote runtime dependencies,
- keep a local browser copy available as backup.
