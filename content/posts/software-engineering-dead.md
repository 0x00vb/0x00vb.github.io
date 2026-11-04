---
title: "Is software engineering dead?"
description: "Code got cheaper. The decisions around it still have to be made."
topic: essays
concepts: ["agents", "judgment", "work"]
date: 2026-01-29
written: 2026-11-04
status: published
published: 2026-11-04
order: 10
period: "2025 / 26"
---

A lot of implementation work is getting cheaper. Pretending that won't change teams or jobs seems wishful.

But take a request as ordinary as “add an export.” Which records? Which permissions? Which point in time? What happens if the export takes ten minutes or includes a record the user just lost access to?

Someone has to settle those questions. Generating the handler faster doesn't make them disappear. It can make it easier to ship an answer before anyone notices there was a decision.

I also don't find “judgment still matters” very reassuring on its own. If fewer people can produce the same amount of implementation, the way work is divided will change. Being good at a task doesn't guarantee the market will keep buying it in the same quantity.

The thing I'd keep practicing is getting from an unclear request to a result you can check. Understand the user, identify the constraints, build a small version, and inspect what it does. Then change your mind when the evidence warrants it.

Models can help throughout that process. You still need a way to distinguish a convincing answer from a system that works.

I don't think that work disappears. I do think we'll have less room to hide behind the amount of code it took.
