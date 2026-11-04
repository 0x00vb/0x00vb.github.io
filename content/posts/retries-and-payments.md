---
title: "When a retry becomes a second payment"
description: "Persist the operation identity before making a request you may need to retry."
topic: systems
concepts: ["payments", "agents", "reliability"]
date: 2025-03-22
written: 2026-11-04
status: published
published: 2026-11-04
order: 6
period: "2024 / 25"
---

The payment request timed out. The provider might still have charged the card.

That leaves an unknown outcome. Treating it as a definite failure is how a helpful retry becomes a second payment.

## Give the operation one identity

Create and store an idempotency key when the business operation is created. Reuse it for retries of that same operation. A fresh key on every attempt gives the provider fresh operations to execute.

![The first payment attempt loses its response. A retry carries the same stored operation key and resolves to the same payment result.](../../diagrams/retry.svg)

Check the provider's actual contract: parameter matching, concurrent attempts, retention, and which outcomes it stores. An idempotency key only helps within those guarantees.

## Record uncertainty

Your database update and the external charge aren't one atomic write. A crash can happen after the charge but before you save the receipt.

Keep a durable operation record. Store the provider ID when available. Reconcile ambiguous attempts through the provider's lookup or event APIs before deciding whether to retry.

Events can be duplicated or arrive out of order too. Make the relevant state transitions safe to replay.

For an agent, this belongs in the payment tool's implementation. The model should receive an explicit pending or unknown state. Remembering a sentence about retries is a weak place to put duplicate-charge prevention.

[Stripe's idempotency contract](https://docs.stripe.com/api/idempotent_requests).
