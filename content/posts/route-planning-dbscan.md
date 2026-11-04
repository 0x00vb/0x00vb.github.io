---
title: "Why I tried DBSCAN for route planning"
description: "Compare density-based groups with the k-means baseline."
topic: ai
concepts: ["ml", "clustering", "evaluation"]
date: 2023-05-11
written: 2026-11-04
status: published
published: 2026-11-04
order: 24
period: "2022 / 23"
---

After k-means, I tried DBSCAN in the route-planning project. I wanted to see what changed when the grouping method could leave isolated stops unassigned.

K-means needs a chosen number of groups. DBSCAN grows groups around dense neighborhoods and can label points as noise. That is a different assumption about the input, not a guarantee of better routes.

![On toy coordinates, k-means assigns an isolated stop to a group. DBSCAN can label that stop as noise.](../../diagrams/stop-clustering.svg)

## Be precise about distance

The neighborhood radius, eps, and the support threshold, min_samples, determine what counts as dense. Their interpretation depends on the distance metric and its units.

Don't mix degrees with kilometers. If using haversine distance, check the implementation's expected coordinate order and radians. A suitable local projection is another option for a compact area.

Also, eps is a neighborhood radius, not a maximum cluster diameter. A chain of nearby dense regions can connect into a long group.

Plot the assignments and inspect the noise points. An isolated delivery still needs service. Density changes across the area may also make one parameter setting awkward.

Compare the downstream plans using the same stops, travel-cost assumptions, and constraints as the k-means baseline. A map that looks more natural may still produce a worse day's driving.

The diagram uses toy coordinates, not results from the project.

[DBSCAN reference](https://scikit-learn.org/1.3/modules/generated/sklearn.cluster.DBSCAN.html).
