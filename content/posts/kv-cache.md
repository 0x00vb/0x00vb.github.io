---
title: "The KV cache is a memory bill"
description: "Why a longer conversation takes more room, even when the model stays the same."
topic: ai
concepts: ["memory", "inference", "gpu"]
date: 2026-06-23
written: 2026-11-04
status: published
published: 2026-11-04
order: 1
period: "2025 / 26"
---

A model can fit on a GPU and still run out of memory when people start using it.

Weights are only part of the allocation. During autoregressive generation, an attention layer can retain keys and values for previous tokens. Keeping them avoids recomputing those projections at every new decoding step. This is the KV cache.

## Context has a cost

A rough cache-size estimate for a conventional transformer is:

```text
2 × layers × tokens × KV heads × head dimension × bytes per value
```

The two accounts for keys and values. Multiply again for independent sequences. This is an estimate for the cached tensors, not a formula for the server's whole memory footprint.

Use the number of KV heads, which can differ from the number of query heads. Architecture, quantization, allocation strategy, and attention variants all change the details.

## Serving is a packing problem

One short request can be cheap. Many long requests arriving together can consume the space you expected to use for more concurrent work.

That creates a tradeoff between admitting more sequences and reserving memory for the ones already generating. A system with excellent throughput on short prompts may behave very differently when the context distribution changes.

Paged allocation helps manage the cache in blocks instead of requiring one large contiguous region for each sequence. Prefix caching can also reuse work when requests share an eligible prefix. These improve memory management and reuse; they do not make every additional token free.

## Measure the workload you have

Track input lengths, output lengths, concurrency, and the latency readers actually feel. Time to first token and time between subsequent tokens describe different parts of the experience.

A benchmark with one tiny prompt tells you very little about a service handling long documents.

Before choosing a larger model, sketch the memory budget: weights, cache, temporary work, runtime overhead, and headroom. Then test the actual distribution of requests. Model size alone is an incomplete capacity plan.

Further reading: [vLLM's explanation of automatic prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html).
