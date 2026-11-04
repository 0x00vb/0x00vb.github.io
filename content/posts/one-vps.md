---
title: "How far can one VPS go?"
description: "Measure the ceiling before building around an imaginary one."
topic: systems
concepts: ["deployment", "performance", "databases"]
date: 2024-11-05
written: 2026-11-04
status: published
published: 2026-11-04
order: 5
period: "2024 / 25"
---

A small startup can run out of operational attention before it runs out of server capacity.

One machine can be a reasonable starting point. It is also one failure domain. Capacity and availability are separate questions, and a healthy CPU graph only answers part of either.

## Establish a baseline

Measure request rate, tail latency, error rate, CPU, memory, disk latency, and database connections. Use a workload with realistic queries and response sizes. Record the software version and machine configuration so the result means something later.

Then increase load gradually. Watch which resource saturates first and whether queues grow without recovering.

A benchmark that ignores writes or serves everything from cache can produce a very reassuring number for the wrong application.

## Spend headroom deliberately

Do not aim to use every available resource all the time. Deployments, background jobs, cache misses, and traffic spikes need room.

Bound worker concurrency and connection pools. Put timeouts on external calls. A queue that grows forever is delayed failure, not extra capacity.

Separate expensive background work from request handling when it interferes with latency. That separation can begin with another process. It does not require a fleet.

## Make recovery boring

Keep backups off the machine. Test a restore into a separate environment. Document how to provision a replacement and restore the application configuration without depending on files that exist only on the failed host.

If the business cannot tolerate the time that process takes, you have an availability requirement that one server cannot satisfy by being larger.

## Scale the thing that ran out

The next step might be a larger instance, a separate database, another application replica behind a load balancer, or a dedicated worker machine. Pick based on the constraint you observed.

There is no universal number of users a VPS supports. There is a workload, a latency target, and a measured operating range. Start there.
