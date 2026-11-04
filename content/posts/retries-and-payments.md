---
title: "When a retry becomes a second payment"
description: "A timeout tells you what you did not hear, not what did not happen."
topic: systems
concepts: ["payments", "agents", "reliability"]
date: 2025-03-22
written: 2026-11-04
status: published
published: 2026-11-04
order: 6
period: "2024 / 25"
---

Your application sends a payment request. The connection times out. Should it send the request again?

The dangerous assumption is that no response means no payment. The provider may have completed the operation before the response was lost.

## Give the operation an identity

An idempotency key identifies one intended operation across retries. Generate it when the business operation is created, store it, and reuse it for subsequent attempts at that same operation.

Generating a fresh key on every retry gives each attempt a new identity. That defeats the point.

![Two attempts carrying the same operation key reach the payment service and resolve to one stored result.](../../diagrams/retry.svg)

## Define the contract

The receiver needs to handle concurrent attempts, bind a key to the relevant request parameters, and define how long the result remains available. A key is useful only within the actual guarantees of the service accepting it.

Your own database matters too. Recording “paid” and making an external charge are separate operations. A crash between them can leave ambiguous state. Use provider identifiers, durable operation records, and reconciliation to recover.

## A timeout is an unknown state

Model that uncertainty explicitly. An operation can be pending reconciliation instead of immediately becoming failed. Query the provider when its API supports that, or wait for a verified event. Do not ask the user to retry a charge while telling them with certainty that the first attempt failed.

Webhook delivery can also repeat. Deduplicate events and make state transitions safe to replay. Protect against out-of-order events rather than assuming delivery order matches business order.

## Agents inherit the same problem

An agent deciding to “try again” does not change the protocol. Tool implementations should preserve the operation identity and expose uncertain outcomes clearly.

The safest retry policy lives in the payment integration, with durable state and a documented contract. It should not depend on a model remembering an instruction about duplicate charges.

Further reading: [Stripe's idempotent request contract](https://docs.stripe.com/api/idempotent_requests).
