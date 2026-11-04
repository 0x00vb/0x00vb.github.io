---
title: "Clusters are not delivery routes"
description: "Carry the grouping result through to a feasible trip before judging it."
topic: ai
concepts: ["clustering", "architecture", "evaluation"]
date: 2023-08-02
written: 2026-11-04
status: published
published: 2026-11-04
order: 25
period: "2022 / 23"
---

The k-means and DBSCAN experiments produced groups of stops. There was still no route.

A group doesn't tell a driver where to start, which stop comes next, or whether the vehicle can carry the workload.

![Validated stops become candidate groups. Ordering uses travel costs and constraints, then the finished trip is checked for feasibility.](../../diagrams/route-pipeline.svg)

## Define what improves

“Optimize the route” could mean less total travel, a shorter longest shift, fewer vehicles, or meeting every time window. Those objectives can disagree.

Pick one and write down the constraints: depot, capacity, working hours, service time, required return trip. A pretty grouping can make those constraints harder to satisfy.

For a first ordering baseline, a simple heuristic is enough to expose bad groups. Include the depot and use a distance or travel-time model that fits the area. Straight-line distance won't represent a bridge, a one-way street, or a restricted turn.

## Compare complete plans

Use the same stops and assumptions for both methods. Record infeasible cases and unassigned stops instead of dropping them from the comparison.

Then look at the route cost, workload distribution, and sensitivity to small input changes. A slightly better clustering objective doesn't guarantee improvement in any of those.

Keeping grouping and routing separate lets me compare a grouping method without rewriting the whole planner.
