---
title: "Your GPU is probably waiting for memory"
description: "Count the data movement before buying more arithmetic."
topic: ai
concepts: ["gpu", "memory", "performance"]
date: 2026-10-12
written: 2026-11-04
status: published
published: 2026-11-04
order: 0
period: "2025 / 26"
---

Adding two arrays is one addition per output. For 32-bit floats, it also means reading two four-byte values and writing another four bytes.

That is roughly twelve bytes moved for one addition, before considering cache effects and implementation details. A billion elements implies about twelve billion bytes of traffic.

Divide that traffic by achieved memory bandwidth and you get a useful lower bound on runtime. Use measured bandwidth, not the number on the hardware's product page.

## Reuse changes the workload

Matrix multiplication can reuse values across many operations. A tiled kernel loads a block of values and does more work before fetching another one.

![A tile is loaded from device memory and reused for several operations on the GPU. Reuse reduces repeated global-memory transfers.](../../diagrams/gpu-memory.svg)

Arithmetic intensity is the work performed per byte moved. It helps distinguish a kernel starved for data from one limited by arithmetic throughput. Shapes, data types, access patterns, and implementation still matter. “It's a matrix multiply” isn't enough to identify the bottleneck.

I would benchmark a trusted implementation first, then measure GPU elapsed time, traffic, and achieved bandwidth on representative sizes. Keep host-to-device transfers separate from work on data already resident on the GPU.

Change one thing at a time: reuse, access pattern, or batch shape. Check whether traffic fell and whether runtime improved. More compute won't help much while the arithmetic units are waiting for their next inputs.

[NVIDIA's matrix multiplication guide](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/).
