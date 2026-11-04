---
title: "A VM snapshot is not a backup"
description: "Try restoring without the original virtual machine or its host disk."
topic: systems
concepts: ["linux", "virtual-machines", "reliability"]
date: 2022-09-22
written: 2026-11-04
status: published
published: 2026-11-04
order: 21
period: "2022 / 23"
---

A snapshot is convenient before an experiment. Change the package, break the configuration, roll back.

What I want to know next is where that checkpoint lives and what it depends on.

Depending on the hypervisor, a snapshot can be part of a chain that still needs the original virtual disk. If the host disk fails, the checkpoint stored beside it can disappear too.

![A VM disk and dependent snapshot live on one host disk. An independent backup lives on separate storage and can be restored to another host.](../../diagrams/vm-backup.svg)

## Check what a restore would recover

A running guest can be halfway through a write. Filesystem consistency and application consistency are different requirements. For a database, use a backup method that understands its recovery rules.

For a small experiment, shutting the guest down before taking a checkpoint removes some uncertainty. Record the guest configuration and the change you're about to make so the result can be compared.

After rollback, verify the state you intended to recover. Shared folders and external databases may not have rolled back with the guest.

The useful recovery test starts on a separate destination. Can you restore the machine, boot it, and read the required data without relying on the original VM?

Snapshots make experimentation less tedious. An independently recoverable copy is what helps after the original environment is gone.
