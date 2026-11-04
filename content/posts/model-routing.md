---
title: "Which model gets this task?"
description: "Route against task requirements and measure cost per successful completion."
topic: ai
concepts: ["agents", "routing", "evaluation", "performance"]
date: 2026-11-04
written: 2026-11-04
status: published
published: 2026-11-04
order: 31
period: "2025 / 26"
---

I don't want every task going to the most expensive model. I also don't want the cheap model taking three attempts before we call the expensive one anyway.

Start by identifying the work. Extracting fields from a known format, resolving an ambiguous request, and debugging a race have different requirements. Context length, tool support, latency, and data-handling constraints can rule out a model before cost enters the decision.

![A capability check selects an eligible model. A smaller model's result is validated; a failed check can escalate once to a stronger model within the remaining budget.](../../diagrams/model-routing.svg)

## Make escalation explicit

For a sequential cheap-first policy, a rough cost model is:

```text
expected cost = router + small attempt + escalation_rate * large attempt
```

That leaves out retries and other work, so count those too. Sequential escalation also adds latency. Compare against sending the task directly to the stronger model.

Use task checks where they exist: schema, required fields, test results, or the target system's state. A model reporting high confidence is not a calibrated success check.

## Evaluate the policy

Keep a representative task set and record the selected route, outcome, cost, and latency. Inspect the cases that were sent to the smaller model incorrectly. Set the threshold based on the failures you can tolerate.

Cap fallback attempts and require remaining budget before escalating. Validate the escalated result too; a larger model can still be wrong. All routes still go through the same authorization checks; a stronger model doesn't acquire broader permissions.

The [RouteLLM paper](https://arxiv.org/abs/2406.18665) is a useful example of learned routing. A small explicit policy is a reasonable baseline before training one.
