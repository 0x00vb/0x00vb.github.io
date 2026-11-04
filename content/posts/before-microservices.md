---
title: "Before you split the monolith"
description: "Find the bottleneck before adding another deployment boundary."
topic: systems
concepts: ["architecture", "databases", "deployment"]
date: 2024-07-19
written: 2026-11-04
status: published
published: 2026-11-04
order: 4
period: "2024 / 25"
---

If the API is slow, I want to see a trace before I see a new architecture diagram.

Where did the request spend its time? A query, a saturated pool, an external call, serialization? Splitting the application won't answer that question for you.

## Try a boundary inside the process

Separate responsibilities into modules. Give them clear interfaces. Stop letting arbitrary code reach into another module's tables.

That gives you a boundary you can test without introducing network calls, partial failures, or another deployment. It also makes a later extraction less speculative.

![An API and worker share one application boundary. The database remains separate. Extracting a module adds a network and failure boundary.](../../diagrams/monolith.svg)

A service can be worth it when a workload needs independent scaling, a different failure boundary, or separate ownership. Image processing and an interactive API might reasonably need different resources.

Write down what that independence buys. Then account for retries, version compatibility, observability, and operations that can succeed in one service and fail in another.

For the next experiment, pick the smallest change that tests the diagnosis: add the index, bound concurrency, move slow work to a queue, or isolate the module. Compare tail latency and errors under the same workload.

A missing index is quite capable of surviving a migration to microservices.
