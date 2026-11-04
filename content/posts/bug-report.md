---
title: "A good bug report saves a round trip"
description: "Show the boundary crossing with the smallest reproducible example."
topic: security
concepts: ["security", "communication", "evaluation"]
date: 2024-02-08
written: 2026-11-04
status: published
published: 2026-11-04
order: 8
period: "2023 / 24"
---

The engineer reading your report should be able to reproduce the issue without first interviewing you.

I'd start here:

```text
Expected: user A can read invoices in tenant A.
Observed: user A can read a test invoice in tenant B.
Prerequisites: two test accounts, one invoice per tenant.
Steps: the minimum request sequence that reproduces it.
Evidence: sanitized requests and responses.
```

Use a system you own or have permission to test. Stay inside the program's scope and stop once you have enough evidence. Collecting more people's data doesn't make the report better.

## Separate what happened from what might happen

“The response contained tenant B's test invoice” is an observation. “Every invoice may be exposed” is a hypothesis unless you have an authorized basis for saying more.

Explain the impact that follows from the evidence. Include timing or ordering if it matters. If the issue only reproduced once, say that too.

Remove credentials and unrelated personal data from the examples. Keep the details needed to repeat the failure.

A remediation note can point to the missing policy check. Avoid prescribing an exact patch when you don't know the internal design.

The report is finished when another person can follow the same path, see the same failure, and understand which rule didn't hold. The severity adjective can wait until then.
