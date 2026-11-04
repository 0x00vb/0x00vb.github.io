---
title: "An agent needs a test bench"
description: "Measure the whole task, including what the agent should refuse to do."
topic: ai
concepts: ["evaluation", "agents", "security"]
date: 2026-04-07
written: 2026-11-04
status: published
published: 2026-11-04
order: 3
period: "2025 / 26"
---

An agent demo is easy to admire because you are usually watching the run that worked.

A test bench asks a less comfortable question: what happens across many tasks, including the ones that should stop without taking action?

## Define success before running it

For a support agent, “answer the customer” is too vague. A useful case specifies the starting state, the available tools, the permitted changes, and the expected final state.

If the task is to find an order, success might require returning the right order without changing anything. If the task is to issue a refund, success might require a valid amount, the right account, and the expected authorization.

A fluent explanation cannot compensate for a wrong mutation.

## Check the trace and the state

Look at both the tool calls and the result. An agent may arrive at the right final state through an unsafe route. It may also write an excellent summary of work it never performed.

Use deterministic checks where you can: identifiers, amounts, file contents, database records, tool permissions. Use human review or carefully calibrated model judgment for genuinely qualitative criteria. Do not ask another model to guess whether an exact database update happened.

## Include awkward cases

Missing information, stale results, tool timeouts, contradictory instructions, and untrusted text belong in the suite. Include tasks where the correct response is to ask for a decision or decline an action outside the user's authority.

Keep the cases versioned. Run them when the prompt, model, tool schema, or execution environment changes. Repeat stochastic runs enough to notice variability rather than treating one pass as certainty.

Track cost and latency alongside task success. A system that completes a task after twenty expensive detours may be technically correct and operationally unusable.

The point is to make improvement visible. Without a stable set of tasks, you are mostly comparing how convincing the latest demonstration felt.
