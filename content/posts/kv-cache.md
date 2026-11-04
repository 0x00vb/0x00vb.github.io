---
title: "Where the KV cache uses memory"
description: "Account for running conversations as well as model weights."
topic: ai
concepts: ["memory", "inference", "gpu"]
date: 2026-06-23
written: 2026-11-04
status: published
published: 2026-11-04
order: 1
period: "2025 / 26"
---

A model fitting on the GPU is only the first part of the memory budget.

During generation, attention layers can retain keys and values for previous tokens. That avoids recomputing those projections at every decoding step. The retained tensors are the KV cache.

For a conventional full-attention transformer, a rough estimate is:

```text
KV bytes = 2 * layers * tokens * KV_heads * head_dim * bytes_per_value
```

Use KV heads, not query heads. Grouped-query and multi-query attention can make those counts different. This estimates cached tensors; it excludes weights, temporary buffers, allocator overhead, and runtime state. Sliding-window and other attention designs change the calculation.

![A device's memory contains model weights, a KV cache that grows with active sequences, and workspace plus headroom. The regions are schematic, not measured sizes.](../../diagrams/kv-budget.svg)

## Concurrency multiplies the problem

Independent sequences need their own cache entries unless the serving implementation can share an eligible prefix. Long inputs and long outputs both affect how much space remains for new work.

Paged allocation helps manage that space in blocks. Prefix reuse can avoid repeating some prefill work. Neither makes additional context free.

Measure the input-length and output-length distributions you expect to serve. Track concurrency, time to first token, and time between generated tokens separately.

A single short prompt tells you little about how the server behaves when several users submit long documents at once.

[vLLM's prefix caching documentation](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html).
