---
title: "Clustering delivery stops with k-means"
description: "A first grouping baseline for the route-planning project."
topic: ai
concepts: ["ml", "clustering", "evaluation"]
date: 2022-12-08
written: 2026-11-04
status: published
published: 2026-11-04
order: 22
period: "2022 / 23"
---

The route-planning project started with k-means. Grouping the stops was a manageable first experiment before trying to produce complete trips.

K-means takes a chosen number of clusters and tries to reduce squared distance to their centers. It is a reasonable baseline when compact groups fit the problem.

The first decision is what k means. Number of vehicles? Number of service areas? Just a parameter for exploration? Those aren't necessarily interchangeable.

## Check the map behind the numbers

Latitude and longitude are angles. Treating them as flat coordinates can produce misleading distances. For a local area, use an appropriate projection if the clustering method expects Euclidean geometry, and record the units.

That still gives geometric distance, not driving time. A river or one-way street won't appear in a centroid calculation.

Plot the groups. Check uneven workloads, awkward boundaries, and isolated stops. Try different initializations and see whether the structure is stable.

Then evaluate a complete plan: travel cost, capacity, service times, and feasibility. A lower k-means objective only establishes improvement against that clustering objective.

Keep the input, preprocessing, parameters, and assignments with the experiment. They give the next approach a baseline that can actually be reproduced.

That next approach was DBSCAN, mainly because I wanted to inspect a grouping that could treat isolated points differently.

[K-means reference](https://scikit-learn.org/1.2/modules/clustering.html#k-means).
