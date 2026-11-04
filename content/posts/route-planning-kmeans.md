---
title: "Clustering delivery stops with k-means"
description: "The first step in a route-planning project: turn a map of stops into candidate groups."
topic: ai
concepts: ["ml", "clustering", "evaluation"]
date: 2022-12-08
written: 2026-11-04
status: published
published: 2026-11-04
order: 22
period: "2022 / 23"
---

The route-planning project started with k-means. Given a set of stops, the first useful intermediate result was a map of groups rather than one large cloud of points.

That was a smaller problem than finding complete routes. It was also easier to inspect.

## What the first model answered

K-means takes a chosen number of clusters and tries to reduce squared distances from points to their assigned centers. That makes it a useful baseline when compact groups are a reasonable fit.

But choosing k already makes a statement. Is it the number of vehicles, the number of areas, or just a parameter for an experiment? Those are not necessarily the same thing.

I would keep the groups separate from vehicle assignments. Otherwise a modeling parameter quietly becomes an operational constraint.

## Coordinates need a decision

Latitude and longitude are angles. Treating them as flat coordinates can introduce misleading distances. For a compact local area, a suitable local projected coordinate system can be useful. The projection and its units should be explicit.

Even a good geometric distance is still different from driving time. Two nearby stops may sit on opposite sides of a river or a restricted road.

## Inspect the groups

Plot the assignments. Look at boundaries, uneven group sizes, and isolated stops. Run different initializations and compare whether the useful structure survives.

A lower clustering objective does not establish a better delivery plan. The practical checks include workload, travel time, capacity, and the number of awkward stops left to handle.

## Keep the baseline

The first model is valuable because it gives the next experiment something to beat. Retain the input data, preprocessing choices, parameters, and output assignments.

K-means gave the project a concrete first stage. The next question was whether forcing every stop into one of k compact groups matched the geography well enough.

Further reading: [scikit-learn's k-means documentation](https://scikit-learn.org/1.2/modules/clustering.html#k-means).
