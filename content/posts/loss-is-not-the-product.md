---
title: "Your training loss is not the product"
description: "A lower number can hide the failure your users actually care about."
topic: ai
concepts: ["evaluation", "ml", "performance"]
date: 2025-11-18
written: 2026-11-04
status: published
published: 2026-11-04
order: 2
period: "2025 / 26"
---

A training run finishes with a better loss. The product still makes the same embarrassing mistake.

There is no contradiction. The objective measured one thing. You needed another.

## Ask what the number contains

An average can improve while a small, important slice gets worse. A classifier might become more accurate on frequent examples and less reliable on the rare class that matters most. A language model might become better at predicting text without becoming better at completing your particular workflow.

The first step is to name the behavior you need. Not “higher quality.” Something you can observe: distinguish a refund request from a cancellation, preserve an identifier, or abstain when a document does not contain an answer.

## Keep a separate test

Use validation data while choosing the model. Keep a separate test set for a less biased estimate after those choices. If you repeatedly inspect the test set and adjust the system around it, it has become another development set.

Make the split match deployment. Random splitting can be misleading when nearly identical records, the same users, or future information appear on both sides. For a time-dependent task, a chronological holdout may tell you more.

## Read the failures

Keep a small collection of examples that expose distinct mistakes. Inspect predictions alongside the input and the expected behavior. Separate labeling ambiguity from a clear model error.

Then slice the evaluation by conditions that matter: language, input length, missing fields, unfamiliar sources. Those slices should come from actual use, not an unlimited hunt for a flattering metric.

Training loss is useful feedback for optimization. A good evaluation connects that optimization to the thing you intend to ship.

The practical question after a better run is: which previously wrong decisions became right, and what did we give up?
