---
title: "A small web app, one request at a time"
description: "Browser, server, storage: a practical way to untangle a simple project."
topic: systems
concepts: ["web", "architecture", "evaluation"]
date: 2023-02-16
written: 2026-11-04
status: published
published: 2026-11-04
order: 23
period: "2022 / 23"
---

A small web project can contain several different failures that all look like “the page does not work.”

The browser might never send the request. The server might reject it. The database might accept a change that the next screen does not display. Debugging became more useful when I followed one request across those boundaries.

## Start with the browser

Use the network panel to establish whether a request happened. Look at the method, destination, status, and response body. A success status with an unexpected body is different from a connection that never reached the server.

Then inspect what the interface does with that response. A rendering error can make a successful operation look like a server failure.

## Follow one input

Choose a small example and keep its identifier visible through the workflow. Confirm how the server interprets the request and what it stores.

Do not assume the value displayed in an input is the value received by the server. Serialization, omitted fields, defaults, and validation can all change the result.

A useful error preserves enough context to identify the failing step without recording credentials or unnecessary personal data.

## Test the awkward path

Reload the page after saving. Submit an invalid value. Try a record that does not exist. Simulate a slow response. Each case asks whether the application can explain its state instead of merely looking correct in the happy path.

You can explore those cases with ordinary browser tools and a small local dataset. A complicated test environment is not required to discover that a button lets you submit twice.

## Keep the system understandable

For a small project, a few clear boundaries are enough: request handling, application decisions, and persistence. Name them in the code and avoid mixing them just because everything fits in one file.

The result is easier to debug and easier to explain. You can point to where a request entered, where a decision happened, and where the resulting state can be checked.
