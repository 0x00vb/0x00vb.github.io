---
title: "What actually starts a Linux service?"
description: "Check the unit, process environment, and listening interface separately."
topic: systems
concepts: ["linux", "deployment", "architecture"]
date: 2022-04-14
written: 2026-11-04
status: published
published: 2026-11-04
order: 20
period: "2022 / 23"
---

“It runs in my shell” doesn't tell me why the service won't start.

My shell has a user, a working directory, a PATH, and probably some environment variables. The service may have none of the values I was relying on.

On a system using systemd, these are three useful views of the attempt:

```sh
systemctl status example.service
systemctl cat example.service
journalctl -u example.service -b
```

Substitute a service on a machine you control. The first command shows its state, the second its unit configuration, and the third its journal entries from this boot. Journal access may require additional permissions.

## Follow the startup conditions

Check the account, executable path, working directory, and configuration paths. A relative path is only useful once you know what it is relative to.

Check how required variables reach the service. Avoid dumping an entire environment into a log just to inspect one setting; it may contain credentials.

A restart policy can turn one immediate error into a long stream of repeated attempts. Find the first useful failure before changing the policy.

Then check the application itself. A process marked active might not have a healthy database connection or a working endpoint. Make a local request to the interface it is supposed to serve.

The chain is short enough to draw on paper: unit configuration, process, listening socket, successful request. Find the first link that doesn't hold.
