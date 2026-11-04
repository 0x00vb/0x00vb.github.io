---
title: "Design tokens are an API"
description: "Names and contracts matter more than the number of colors in the file."
topic: design
concepts: ["design-systems", "architecture", "communication"]
date: 2025-06-13
written: 2026-11-04
status: published
published: 2026-11-04
order: 9
period: "2024 / 25"
---

A token named `gray-400` tells you what it looks like. A token named `text-muted` tells you what it is for.

Both can be useful. They belong at different levels of a design system.

## Separate the palette from the promise

Primitive tokens describe available values: a color ramp, spacing steps, font sizes. Semantic tokens describe roles: primary text, a surface, an interactive border.

A component using a semantic role can survive a palette change without knowing the implementation. That is the same advantage you expect from a useful software interface.

But the name creates a promise. If `text-muted` is used for essential instructions, it still needs readable contrast. “Muted” should not become permission to make information disappear.

## Themes test the contract

Light and dark modes expose accidental assumptions. A token called `white` cannot explain whether it represents a foreground, a background, or an inverted element.

Map each role deliberately in each theme. Do not mechanically invert the palette and assume the hierarchy survived. Borders, selected states, disabled content, and focus indicators all need a decision.

## Components need behavior too

A shared button is more than padding and a radius. Its contract includes keyboard focus, disabled behavior, loading state, target size, and what happens when its label gets longer.

If each product independently solves those details, you share an appearance without sharing the interaction.

## Change it like an interface

Before renaming a token or changing its meaning, inspect the callers. A value change may be safe; a semantic change may quietly break several contexts.

Document a few good examples and the constraints that matter. Keep the API small enough that engineers can choose a role without searching through fifteen almost-identical names.

The goal is to make correct decisions easier to repeat. A bigger token file is not evidence of a better system.
