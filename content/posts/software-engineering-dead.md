---
title: "Is software engineering dead?"
description: "Writing code got cheaper. Deciding what should happen is still work."
topic: essays
concepts: ["agents", "judgment", "work"]
date: 2026-01-29
written: 2026-11-04
status: published
published: 2026-11-04
order: 10
period: "2025 / 26"
---

If software engineering means typing implementations from a clear specification, a large part of that work is getting cheaper.

I think the more interesting question is what happens when the specification is missing, contradictory, or wrong.

## Someone still has to decide

A customer asks for an export. Which records should it include? Who may download it? What happens if it takes ten minutes? Can it expose deleted data? Does it need to reproduce the state at the moment the request was made?

Those decisions are software engineering too. They were easy to overlook when implementation consumed most of the calendar.

Faster code generation does not answer them automatically. It can make it easier to commit to an answer before anyone notices there was a question.

## The work is changing anyway

It would be convenient to say nothing important changes because judgment still matters. I do not believe that either.

If one person can build and revise an implementation faster, teams will change how they divide work. Some tasks will need fewer people. Other projects will become worth attempting for the first time. The transition will not distribute its benefits neatly.

Being good at a task does not guarantee that the market will continue buying the same amount of it.

## Build a better feedback loop

The skill I would invest in is turning an uncertain problem into a testable decision. Understand the user. Name the constraints. Build something small. Inspect what actually happens. Revise.

Tools can participate in every step. You still need a way to tell whether the result is useful and whether its failures are acceptable.

I do not think engineering disappears when writing code becomes easier. I think the gap between producing code and taking responsibility for a system becomes harder to ignore.

That is a demanding change. It is also a reason to learn more of the system around the code.
