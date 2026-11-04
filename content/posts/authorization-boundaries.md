---
title: "The ID is not the permission"
description: "An ordinary object lookup can be the boundary your API forgot to enforce."
topic: security
concepts: ["security", "architecture", "authorization"]
date: 2023-08-17
written: 2026-11-04
status: published
published: 2026-11-04
order: 7
period: "2023 / 24"
---

An endpoint receives an object ID and returns the matching record. The code is short. The missing question is who is allowed to see that record.

Knowing an identifier is not the same thing as having access to the object it names. An unguessable ID makes accidental discovery harder; it does not replace an authorization decision.

## Scope the lookup

In a multi-tenant application, a lookup often needs both the object identifier and an authorized tenant context. That context must come from verified membership, not simply a tenant ID supplied by the client.

Check the intended action too. Permission to read an invoice does not imply permission to refund it. A role name without an action and a resource is an incomplete rule.

## Look beyond the main endpoint

Downloads, exports, search, background jobs, and nested resources need the same boundary. A carefully protected detail page is not enough if an export can retrieve everything.

Caches also need attention. A response cached under an object ID alone can cross an access boundary if the content depends on the requesting user. Choose cache keys and caching rules that match the authorization model.

## Test two identities

A useful regression case creates two tenants with distinct users and objects. Confirm that each user can perform the intended action on their own object, then verify that crossing the boundary is denied.

Keep these checks in an environment you own or are explicitly authorized to assess. Use synthetic records. You do not need to collect someone else's data to demonstrate a broken boundary.

## Make the rule visible

Centralize policy where it is appropriate, but do not hide the resource context. A generic “is authenticated” middleware only establishes who is calling. It does not answer whether they can access this object.

The habit worth keeping is to read every object lookup as two operations: find the record, and establish the caller's authority over the requested action.

Further reading: [OWASP's API object authorization guidance](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/).
