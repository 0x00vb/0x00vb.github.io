---
title: "A small web app, one request at a time"
description: "Trace one input through the browser, server, and stored result."
topic: systems
concepts: ["web", "architecture", "evaluation"]
date: 2023-02-16
written: 2026-11-04
status: published
published: 2026-11-04
order: 23
period: "2022 / 23"
---

“The page doesn't work” could mean the browser never sent a request, the server rejected it, or the UI failed to display a successful response.

I find it easier to follow one small example through the whole path.

Start in the network panel. Check the method, destination, status, and body. A successful status with the wrong payload is different from a request that never reached the server.

Then look at how the client handles that result. A rendering error can make a completed operation look like a server failure.

## Keep one identifier in view

Follow the same test record through request parsing, validation, application logic, and storage. The value displayed in a form isn't necessarily the value the server received. Defaults, omitted fields, and serialization can change it.

Record enough context to find the failing step without logging credentials or unrelated personal data.

After saving, reload the page. Submit an invalid value. Request a missing record. Slow the connection down. Check whether the UI explains its state and whether a second click can repeat the operation.

For a small project, a few clear boundaries are enough: request handling, application decisions, persistence. Naming them makes debugging less dependent on remembering where every line happens to live.

You should be able to point to where the input entered, where a decision was made, and where the resulting state can be checked.
