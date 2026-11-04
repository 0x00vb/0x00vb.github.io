---
title: "A summary is not execution state"
description: "Keep operation IDs and uncertain outcomes outside compressed conversation history."
topic: ai
concepts: ["agents", "memory", "reliability", "architecture"]
date: 2026-11-04
written: 2026-11-04
status: published
published: 2026-11-04
order: 33
period: "2025 / 26"
---

Suppose an agent sends an email. The provider accepts it, but the connection drops before the message ID is saved.

Then the conversation gets compacted. The summary says “send the email.” What should happen on resume?

Another send might duplicate the first one. A sentence saying “done” would be equally unhelpful without evidence.

![Conversation history is compressed into a summary. A separate operation journal retains exact identifiers and outcomes, and is loaded alongside the summary when the agent resumes.](../../diagrams/durable-state.svg)

## Persist the operation before the attempt

Give the intended operation a stable ID and record its state before calling the tool. Use provider idempotency when available. Save the provider receipt when it arrives.

```text
operation_id: send_42
status: outcome_unknown
provider_message_id: null
```

If the receipt is missing, reconcile against the provider before deciding whether to retry. Some providers don't offer a reliable way to deduplicate or look up the attempt. That uncertainty needs to remain visible.

The journal and external action aren't one atomic transaction. A checkpoint doesn't remove the gap between them.

## Load state, then decide

A summary can preserve the goal and relevant reasoning. Exact operation IDs, pending approvals, retry state, and remaining budget belong in explicit records that compaction doesn't rewrite.

On resume, read those records and check current authority before executing another action. A permission or fact from the previous run may have changed.

That's the recovery path I want to inspect in an agent architecture: which state survives, which observation resolves uncertainty, and what prevents the same effect being requested twice.

[LangGraph's persistence model](https://docs.langchain.com/oss/python/langgraph/persistence).
