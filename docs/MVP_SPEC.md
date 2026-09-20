# MVP Specification

## Goal

Build one exceptionally polished **6–8 minute vertical slice** that proves the entire RIPPLE product thesis.

## Non-goals

Before DKC submission, do not build:
- user accounts,
- live social-media integrations,
- a chatbot,
- an abuse-reporting backend,
- an AI moderation system,
- a complex admin portal,
- real victim-case intake,
- payments,
- native mobile apps.

## Screen flow

### 0. Landing
- RIPPLE BD logo
- “Every click has a consequence.”
- CTA: **Enter Nodi**

### 1. Safety & fiction notice
- scenarios are fictional,
- no real person/community is being accused,
- user can exit at any time,
- no sensitive story submission required.

### 2. Nodi introduction
“10,000 people live here digitally. Your actions will change what happens next.”

### 3. Baseline / MIRROR
Show a realistic feed card and choices:
- Share
- Verify
- Comment
- Ignore
- Support / Report where relevant

Do not reveal scores yet.

### 4. Ripple Engine
Animate:
- reach,
- reaction,
- human consequence,
- community trust/safety.

### 5. Reflection checkpoint
Prompt:
“What changed because of your action?”

### 6. REWIND
Signature transition:
“You saw how harm spreads. Now rewind it.”

Reverse metrics and feed state.

### 7. PEACE retry
Unlock safer tools:
- verify source,
- add context,
- support target,
- de-escalate,
- report,
- amplify authentic voice.

### 8. Manipulation X-Ray
Interactive layers:
- urgency,
- missing source,
- cropped context,
- social proof,
- identity framing.

### 9. Scenario completion
Show what changed in the second path.

### 10. SHIELD Mode
For targeted-person scenarios:
Recognize → Support → Preserve → Report → Escalate.

### 11. Digital Reflex Profile
Five dimensions:
- Verify Before Sharing
- Manipulation Detection
- Bystander Response
- Target Support
- De-escalation

### 12. Booster invitation
Offer Day-3 and Day-7 links/codes without forcing account creation.

## Performance requirements

- mobile-first;
- no paid API calls;
- first meaningful render quickly on low-end Android;
- deterministic demo;
- graceful offline-like behavior after initial load where practical;
- no autoplay audio;
- keyboard accessible;
- reduced-motion fallback.

## Definition of done

MVP is submission-ready when:
- three scenarios work end to end;
- no broken route or dead button exists;
- score calculations are deterministic;
- mobile layout works at 360px width;
- pilot can run without developer intervention;
- result screen exports or records only consented non-sensitive metrics;
- all claims in app copy pass safeguarding review.
