---
title: "Your GPU is probably waiting for memory"
description: "A small mental model for why more compute does not always make a kernel faster."
topic: ai
concepts: ["gpu", "memory", "performance"]
date: 2026-10-12
written: 2026-11-04
status: published
published: 2026-11-04
order: 0
period: "2025 / 26"
---

You can buy more arithmetic than you know what to do with. Feeding it is another problem.

A useful first question about a GPU kernel is how much work it does for each byte it moves. That ratio is called arithmetic intensity. A kernel that loads two numbers, adds them, and writes the result spends very little time doing arithmetic relative to moving data.

Adding more arithmetic units does not remove that traffic.

## Count the bytes first

Imagine adding two arrays of 32-bit floats. For every output, you read two four-byte values and write one four-byte value. That is roughly twelve bytes of traffic for one addition, before considering cache effects or other overhead.

For a billion elements, that means about twelve billion bytes. Divide that traffic by the bandwidth you actually measure, and you have a useful lower bound on runtime. The advertised peak is a ceiling, not the bandwidth your kernel is guaranteed to get.

![Data moves from device memory through a reusable tile to the arithmetic units. Reusing a tile reduces trips to device memory.](../../diagrams/gpu-memory.svg)

## Reuse changes the equation

Matrix multiplication offers a different opportunity: values can participate in many operations. Loading a tile and reusing it lets the kernel do more arithmetic for each trip to device memory. Good access patterns matter too. Nearby threads reading nearby addresses can let the hardware combine requests.

The exact result depends on the shapes, data types, hardware, and implementation. A matrix multiplication is not automatically compute-bound just because it contains lots of multiplications.

## What I would measure

Start with a trusted implementation and representative input sizes. Measure elapsed GPU time, traffic, and achieved bandwidth. Separate transfers between host and device from work already running on the device.

Then change one thing. Does reuse reduce traffic? Do larger batches improve utilization? Does the kernel get faster, or does a different bottleneck take over?

The useful habit is simple: draw the path the bytes take before counting the operations.

Further reading: [NVIDIA's matrix multiplication performance guide](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/).
