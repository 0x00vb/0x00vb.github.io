---
title: "Why I tried DBSCAN for route planning"
description: "A second clustering approach, with a different idea of what a group should be."
topic: ai
concepts: ["ml", "clustering", "evaluation"]
date: 2023-05-11
written: 2026-11-04
status: published
published: 2026-11-04
order: 24
period: "2022 / 23"
---

After starting the route-planning project with k-means, I tried DBSCAN. The attraction was its different treatment of groups and isolated points.

K-means asks for a number of clusters. DBSCAN builds groups from local density and can leave points unassigned as noise. That gave the project another way to represent a map of stops.

## Change the question carefully

The question became: which stops belong to a dense neighborhood, and which need separate attention?

That is useful for exploration. It still does not decide how to visit the stops or how to allocate drivers. An isolated delivery remains a delivery even if the algorithm labels it noise.

## Make distance explicit

Two parameters deserve particular attention: the neighborhood distance, eps, and the support needed for a core point, min_samples. Their meaning depends on the input representation and distance metric.

For geographic coordinates, do not mix degrees with kilometers. A haversine implementation expects angular input and returns angular distance; a local metric projection offers another approach. Choose one deliberately and keep its units consistent.

## A cluster can stretch

The neighborhood radius is not a maximum cluster diameter. Dense chains can connect points across a much larger area. That is especially relevant when a route planner needs compact, manageable territories.

A parameter setting that looks good in one part of a city may also behave poorly where stop density changes. Plot the groups, inspect the unassigned stops, and examine the long connections.

## Compare the useful outcome

Keep the same input and compare against the k-means baseline. Look at the downstream route constraints, not just whether the map looks more natural.

DBSCAN was another candidate grouping stage. It made some assumptions easier to see, particularly the difference between an unusual point and a point the system can afford to ignore.

Further reading: [scikit-learn's DBSCAN documentation](https://scikit-learn.org/1.3/modules/generated/sklearn.cluster.DBSCAN.html).
