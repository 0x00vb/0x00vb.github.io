---
title: "Before you split the monolith"
description: "Separate the problem you have from the architecture you want to try."
topic: systems
concepts: ["architecture", "databases", "deployment"]
date: 2024-07-19
written: 2026-11-04
status: published
published: 2026-11-04
order: 4
period: "2024 / 25"
---

A slow application does not tell you it needs microservices. It tells you something is slow.

That sounds obvious until a diagram with six boxes starts looking like a performance plan.

## Find the expensive boundary

Trace a representative request. How much time goes to the database? How many queries does it issue? Is a connection pool saturated? Is work repeated? Does a synchronous call wait on something that could happen later?

A missing index survives a service extraction. Now it also has a network boundary.

![One application contains separate modules and connects to one database. A measured bottleneck can be extracted later without splitting everything at once.](../../diagrams/monolith.svg)

## Modules are a real architectural tool

You can separate responsibilities inside one deployable. Define interfaces, make ownership explicit, and stop reaching into another module's tables from arbitrary places.

That work is valuable even if you eventually extract a service. It lets you discover whether the boundary is stable before paying for remote calls, retries, independent releases, and distributed debugging.

## Know what independence buys

A service can make sense when it needs a different scaling pattern, a different failure boundary, or genuinely independent ownership. Background image processing and an interactive API may have very different resource needs.

Write down that reason. Then write down the operating cost: deployment, monitoring, authentication between services, version compatibility, and data consistency.

If one user action now spans several services, decide what happens when only half the work succeeds. That decision is part of the architecture, not cleanup after deployment.

## A smaller next step

Try the cheapest change that tests your diagnosis. Fix the query, bound concurrency, add a worker, or isolate a module. Measure the result under comparable traffic.

A monolith is not a promise to remain one forever. It is a deployment choice you can revise when you have a specific reason. The useful question is what the next boundary makes easier and whether that benefit covers its cost.
