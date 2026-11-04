---
title: "The agent loop is the easy part"
description: "Put authority, durable state, and verification around the model call."
topic: ai
concepts: ["agents", "architecture", "security"]
date: 2026-11-04
written: 2026-11-04
status: published
published: 2026-11-04
order: 30
period: "2025 / 26"
---

The loop fits in a few lines: ask the model, run a tool, append the result, repeat.

The architecture starts getting interesting around that loop. What can it see? What can it change? What happens if the process dies halfway through a tool call?

![The model proposes a tool call. The runtime checks policy and budget, executes the operation, records its outcome, and returns an observation. Completion is checked against the target system.](../../diagrams/agent-runtime.svg)

## Keep the executor responsible

The model can propose an action. The executor checks its schema, current permissions, and resource scope before running it. A prompt saying “don't do this” is a poor substitute for a boundary the tool actually enforces.

After execution, record the operation and inspect the result. Clicking Save is an input event. Seeing the saved record is evidence of the effect. Those aren't interchangeable.

The durable record matters when the response is lost or the process restarts. Keep operation IDs and uncertain outcomes outside the conversation text.

## Give the loop an exit

Useful stops include verified completion, a denied operation, exhausted budget, missing user input, and repeated failure without progress.

Set limits on wall time, tool calls, and spend. If a task hits a limit, return the state it reached and the decision needed next. Another model call doesn't automatically resolve a missing permission or an unavailable dependency.

I'd start with one model and a small tool surface. Add routing or more workers when a measured failure gives them a job to do.

[Anthropic's agent and workflow patterns](https://www.anthropic.com/research/building-effective-agents).
