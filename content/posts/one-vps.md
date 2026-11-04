---
title: "How far can one VPS go?"
description: "Find the workload limit, then check the recovery plan separately."
topic: systems
concepts: ["deployment", "performance", "databases"]
date: 2024-11-05
written: 2026-11-04
status: published
published: 2026-11-04
order: 5
period: "2024 / 25"
---

There isn't a useful universal answer in “number of users.” A mostly cached page and a write-heavy API ask very different things of the same machine.

I would start with the workload and a latency target.

Record request rate, tail latency, errors, CPU, memory, disk latency, and database connections. Include realistic queries, writes, and response sizes. Keep the machine configuration and application version with the result.

Increase load until something saturates. Watch whether queues recover after the spike. A queue that keeps growing is storing the failure for later.

## Leave room to operate

Deployments, cache misses, and background jobs need headroom. Bound worker concurrency and connection pools. Put timeouts on external calls.

If background work interferes with request latency, another process or worker may be a sufficient next step. It doesn't automatically require another service boundary.

## Capacity doesn't answer availability

One machine is still one failure domain. Keep a backup elsewhere and try restoring into a separate environment. Check how long it takes to provision a replacement, recover the data, and serve a request.

If the business can't tolerate that recovery time, a larger server won't resolve the requirement.

The next capacity change might be a larger instance, a separate database, another app replica, or a worker machine. Pick the one that addresses the resource you actually ran out of.
