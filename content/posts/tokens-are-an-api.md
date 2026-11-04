---
title: "Design tokens are an API"
description: "Give components a stable role instead of making them depend on a color value."
topic: design
concepts: ["design-systems", "architecture", "communication"]
date: 2025-06-13
written: 2026-11-04
status: published
published: 2026-11-04
order: 9
period: "2024 / 25"
---

A token named gray-400 tells me the palette value. A token named text-muted tells me the intended role.

Both are useful, but a component usually benefits from depending on the role.

```text
palette value -> semantic role -> component
violet-600    -> action-primary -> button
```

Changing the palette can then leave the component contract intact. Changing what the role means is a different operation and needs a look at the callers.

## Dark mode exposes the assumptions

A token called white doesn't explain whether it means text, a surface, or an inverted control. Map those roles deliberately in each theme.

Check borders, focus, selected states, and disabled content. Essential instructions still need readable contrast even when the role is called muted. Mechanically inverting the palette won't preserve the hierarchy for you.

The component contract also includes behavior. A shared button should settle focus, loading, disabled state, target size, and long labels. Otherwise each product still has to rediscover those details.

I'd keep the role vocabulary small enough that an engineer can choose a token without comparing fifteen almost-identical names. Add examples showing where a role fits and where it doesn't.

The system earns its place when a good decision becomes easier to repeat. File size and token count aren't useful measures of that.
