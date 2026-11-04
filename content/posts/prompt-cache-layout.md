---
title: "Put the stable prefix first"
description: "Keep reusable instructions separate from request-specific context."
topic: ai
concepts: ["agents", "memory", "inference", "caching"]
date: 2026-11-04
written: 2026-11-04
status: published
published: 2026-11-04
order: 32
period: "2025 / 26"
---

A timestamp near the start of a prompt can make the rest of a carefully reused prefix miss the cache.

For prefix caching, the structure matters. Put stable instructions, tool definitions, and genuinely shared reference material before request-specific content. Keep their serialization stable too. The provider determines the serialized order of tools and messages, so check that layout rather than treating the request JSON as the prompt.

![Two requests share the same instruction and tool prefix. Their different tasks and tool results appear after the reusable boundary.](../../diagrams/prompt-cache.svg)

## Know which cache you're discussing

A prompt cache reuses computation for eligible input. A response cache reuses a previous answer. They have different invalidation rules.

A prefix hit still leaves generation work to do. Reusing an answer may skip the model call entirely, but now the application must decide whether the answer is fresh and authorized for this caller.

Tool results need their own freshness rules. Caching a successful lookup doesn't establish that a record or permission remains unchanged.

## Inspect the requests

Check for reordered tool schemas, injected timestamps, changing metadata, and edits early in the shared context. Identical-looking text isn't enough if another request setting invalidates the provider's cache.

Minimum cacheable length, retention, cache writes, and usage accounting depend on the provider and model. Check those rules instead of assuming that a reused string will produce a hit.

Measure cache reads and writes alongside time to first token and total request cost. Don't pad a prompt with irrelevant text just to make the cached-token number bigger.

For an agent, this is also a context-layout decision: keep the stable prefix intact where useful, append changing observations later, and compact deliberately.

[Claude's prompt caching contract](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
