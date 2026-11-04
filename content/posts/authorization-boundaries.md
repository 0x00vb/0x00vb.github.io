---
title: "The ID is not the permission"
description: "Scope the lookup to the caller, the resource, and the requested action."
topic: security
concepts: ["security", "architecture", "authorization"]
date: 2023-08-17
written: 2026-11-04
status: published
published: 2026-11-04
order: 7
period: "2023 / 24"
---

An API can have authentication on every endpoint and still return another customer's invoice.

The missing check is usually between the caller and the object being loaded.

```sql
SELECT * FROM invoices
WHERE id = :invoice_id
  AND tenant_id = :authorized_tenant;
```

The tenant must come from verified membership. Taking both IDs from the request just moves the unchecked input into a longer query.

## Check the action too

Reading an invoice and refunding it are separate permissions. Check the requested action against the resource's current state. A role string alone doesn't establish either.

Downloads, exports, nested resources, and background jobs need the same rule. So do caches. If a response varies by authorization context, an object ID alone may be an unsafe cache key.

![Users in separate tenants can access their own invoices. A cross-tenant request is denied before the record is returned.](../../diagrams/authorization.svg)

I like a regression test with two users, two tenants, and two synthetic records. First prove that the allowed actions work. Then swap the identifiers and prove that the boundary holds. Run it only against systems you're authorized to test.

An unguessable ID is still an ID. Someone can obtain it from a link, a log, or another endpoint. The access decision has to survive that.

[OWASP's object authorization guidance](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/).
