---
title: "Give the agent one step at a time"
description: "Put the workflow in a small CLI so the model only sees the current step, and evidence has to pass gates before it moves on."
topic: ai
concepts: ["agents", "architecture", "evaluation"]
date: 2026-10-28
written: 2026-11-04
status: published
published: 2026-11-04
order: 34
period: "2025 / 26"
---

Agents write code quickly. Without control, they also say "done" before they run anything, add casts and empty catch blocks, and forget instructions once the context gets long.

I wanted the workflow outside the prompt. Not another long skill file the model has to remember. A small CLI that prints one step, checks the evidence, and refuses to advance when the gates fail.

That tool is [vstack](https://github.com/0x00vb/vstack). The main ideas come from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan. pstack keeps the workflow in skills the agent reads. vstack keeps it in a CLI the agent calls.

![The agent sends evidence to the vstack CLI. The CLI runs project checks and a slop scan. If a gate fails, the task stays on the same step. If every gate passes, the CLI saves the evidence and prints the next step.](../../diagrams/vstack-gates.svg)

## What the agent sees

A task has a flow and a size. A flow is a sequence of steps: feature, bugfix, refactor, investigate, or spike. A size (`S`, `M`, or `L`) decides which steps appear.

The agent starts with `vstack start`. The CLI prints the current step: what to do, which principles apply, and what evidence to give. The agent works. Then it runs `vstack done "..."` with what it did and what it saw.

The CLI examines the evidence and runs the gates for that step. Types, lint, tests, and a slop scan over the lines the task added. Predictions like "should work" are refused when the step needs observed evidence. If a gate fails, the task stays put and the CLI prints the useful part of the error. If every gate passes, it saves the evidence and prints the next step only.

The agent never has to load the whole playbook. Always-loaded skill text stays small. Instructions for one feature task stay on the order of a few thousand characters instead of tens of thousands.

## The feature flow

![The feature flow moves through frame, design, build, verify, review, and ship. Frame and verify are mandatory. Size S skips design and review.](../../diagrams/vstack-feature-flow.svg)

`frame` writes the goal, who sees the change, acceptance criteria, and what is out of scope. `design` reads only the code the change touches, then writes the caller's shape first. `build` makes the smallest change that meets the criteria. `verify` runs the feature on the real surface and quotes what happened. `review` gets a second look without shared context. `ship` orders the commits and the PR description.

Dark steps are mandatory. Light steps can be skipped with a reason. After verify, if the code changes again, the CLI refuses to pretend the old gate still holds.

## Why the gate is the point

A model saying the CSV export works is a claim. `curl` returning three rows is evidence. Empty `catch` blocks and `any` casts are the kind of quiet failure a prompt alone rarely catches for long.

The slop scan looks at added lines for type escapes, swallowed errors, narrating comments, and a few other patterns. Intentional exceptions are marked on the line. The rest has to be fixed before the step advances.

I still decide what to build. The CLI decides whether this step is allowed to end.

If you want the complete skill-based system inside Cursor, use pstack. If you want a small set of gates that work across Claude Code, Codex, Cursor, and other agents that read Agent Skills, try [vstack](https://github.com/0x00vb/vstack).
