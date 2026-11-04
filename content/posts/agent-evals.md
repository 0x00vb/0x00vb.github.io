---
title: "An agent needs a test bench"
description: "Check the tool calls and the resulting state, including runs that should stop."
topic: ai
concepts: ["evaluation", "agents", "security"]
date: 2026-04-07
written: 2026-11-04
status: published
published: 2026-11-04
order: 3
period: "2025 / 26"
---

The agent says the refund is done. I want to see the refund record.

A final answer is a claim about the task. The test needs an observation from the system the agent was supposed to change.

## Give the test a starting state

For a refund case, define the order, account, allowed amount, available tools, and expected result. Use a test environment with records you can inspect.

Then check three things:

- Did it use the right account and operation?
- Did it stay inside its authority?
- Does the target system contain the expected change?

A correct final state can still hide an unsafe tool call along the way. Keep the trace as well as the result.

## Test the run that gets awkward

Include a tool timeout after the action may have succeeded. Include a missing identifier. Include untrusted text telling the agent to ignore its instructions. Include a task that requires a decision from the user before continuing.

Measure recovery separately. An agent that catches its own wrong click is different from one that never makes it. Both can finish the demo; their operating costs are different.

Use exact checks for exact properties: IDs, amounts, files, database rows. Human review or a calibrated model judge can help with prose quality. Neither should guess whether a database mutation happened.

Track completion rate, cost per completed task, latency, and unauthorized actions. Repeat stochastic cases. One successful run after a prompt change is a reason to run the suite, not a reason to replace it.
