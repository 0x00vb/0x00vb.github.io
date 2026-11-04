---
title: "A good bug report saves a round trip"
description: "Give the person fixing it a short path from claim to reproduction."
topic: security
concepts: ["security", "communication", "evaluation"]
date: 2024-02-08
written: 2026-11-04
status: published
published: 2026-11-04
order: 8
period: "2023 / 24"
---

A report is useful when someone else can understand the issue, reproduce it safely, and decide what to fix.

Length is not a substitute for that sequence. A page of alarming language can still leave the engineer guessing which request mattered.

## Start with the boundary

Describe the expected behavior, the observed behavior, and the condition that separates them. “A user in tenant A can retrieve a synthetic invoice belonging to tenant B” is clearer than “critical access control vulnerability.”

Severity can follow from demonstrated impact. It should not carry the explanation.

## Keep the reproduction small

List the environment, relevant prerequisites, and the minimum steps. Include sanitized request and response examples when they make the issue easier to reproduce. Remove credentials, unrelated identifiers, and personal data.

If a request sequence matters, preserve its order. If timing matters, state that explicitly. If you only observed the behavior once, say so instead of presenting it as deterministic.

A useful proof shows the boundary crossing with the least access necessary. Respect the program's scope, stop when you have sufficient evidence, and use its stated reporting channel.

## Separate evidence from interpretation

“The response contained this test record” is an observation. “This may affect all records of this type” is a hypothesis until you have an authorized basis for saying more.

You can explain the plausible impact without expanding access to prove the broadest possible version of it.

## Suggest a direction, not a blind patch

A remediation note can identify the missing policy or validation. Avoid prescribing a change that assumes internal architecture you have not seen.

The best report leaves a clean handoff: what happened, how to reproduce it, why it matters, and what remains unknown. That is enough to start useful work without another exchange just to recover the basic facts.
