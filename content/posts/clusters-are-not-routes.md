---
title: "Clusters are not delivery routes"
description: "Grouping stops is one stage. Ordering them under real constraints is another."
topic: ai
concepts: ["clustering", "architecture", "evaluation"]
date: 2023-08-02
written: 2026-11-04
status: published
published: 2026-11-04
order: 25
period: "2022 / 23"
---

A map of colored clusters can look like a finished routing system. It is an intermediate result.

The project experiments with k-means and DBSCAN helped divide the input into candidate groups. The remaining question was how to turn those groups into feasible trips.

## Separate the stages

A simple pipeline starts with validated stops, then candidate groups, then vehicle assignments and an ordering of visits. The stages can inform each other, but they answer different questions.

A cluster does not specify a starting depot. It does not encode which roads are usable. It does not establish whether a vehicle can carry the workload or arrive within a required window.

![Input stops pass through candidate grouping and then visit ordering. Clustering alone does not produce a feasible route.](../../diagrams/route-pipeline.svg)

## Write the objective down

“Optimize the route” leaves too much open. You might be minimizing total travel time, reducing the longest driver's day, using fewer vehicles, or meeting every time window.

Those goals can disagree. A geographically tidy grouping may produce an unfair workload. A short route may be infeasible because the vehicle is too small.

Choose an objective and state the constraints before comparing methods.

## Start with a modest baseline

A simple ordering heuristic can be enough to reveal problems with the grouping stage. Use a distance or travel-time model appropriate to the actual area. Keep the depot and return trip in the calculation when the task requires them.

Then inspect failures: unassigned stops, impossible workloads, excessive travel between neighboring areas, and cases where a small input change produces a large route change.

## Measure the whole pipeline

Compare complete plans using the same stops and assumptions. Retain infeasible cases rather than quietly removing them from the comparison.

The useful outcome of a clustering experiment is not the number of colors on a map. It is evidence that one stage helps the routing problem you actually need to solve.

That distinction also makes the software easier to change. A grouping method can be replaced without pretending that it was the entire planner.
