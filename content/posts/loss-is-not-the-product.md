---
title: "Your training loss is not the product"
description: "Inspect which decisions improved, not only whether the average went down."
topic: ai
concepts: ["evaluation", "ml", "performance"]
date: 2025-11-18
written: 2026-11-04
status: published
published: 2026-11-04
order: 2
period: "2025 / 26"
---

A lower training loss can coexist with the same mistake in the product.

Maybe frequent examples improved while a rare class got worse. Maybe predicting the dataset better doesn't improve the workflow you actually care about.

Start by naming an observable behavior: preserve an identifier, recognize a cancellation, or abstain when the document doesn't contain the answer. “Better quality” is hard to test.

## Split the data like the system will encounter it

Use validation data while choosing the model. Keep a separate test set for the final estimate. Once you repeatedly tune against the test results, that set has become part of development.

Watch for the same user, duplicate records, or future information appearing on both sides of the split. For a time-dependent task, holding out later data may be more informative than a random split.

## Read a few wrong predictions

Put the input, expected behavior, and prediction next to each other. Is the label ambiguous? Is information missing? Did the model fail on a condition that appears often in real use?

Slice the results by conditions that matter, such as language, input length, or source. Keep a small set of examples that expose different failure modes.

After a better run, I want to know which previously wrong decisions became right and whether another group of cases regressed. The loss curve can tell me that optimization is progressing. It can't answer the product question on its own.
