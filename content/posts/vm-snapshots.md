---
title: "A VM snapshot is not a backup"
description: "Useful checkpoints, independent copies, and a restore you have actually tried."
topic: systems
concepts: ["linux", "virtual-machines", "reliability"]
date: 2022-09-22
written: 2026-11-04
status: published
published: 2026-11-04
order: 21
period: "2022 / 23"
---

Virtual machines are a good place to experiment because a mistake does not have to become a reinstall.

A snapshot makes that convenient. It can capture a checkpoint you can return to before changing packages, editing a configuration, or testing something unfamiliar. The mistake is assuming that convenience also gives you an independent backup.

## Ask where the checkpoint lives

The exact storage model depends on the hypervisor. A snapshot may depend on the original virtual disk and a chain of later changes. If the host disk fails, the snapshot stored beside that disk may disappear with it.

A backup should be recoverable independently of the machine and storage you are protecting. Its value is established by a restore, not by the presence of a file with a reassuring name.

## Decide what must be consistent

A running guest may be in the middle of a write. A filesystem-consistent image is not automatically an application-consistent copy of every service inside it.

For an experiment, shutting down the guest before creating a checkpoint can remove some uncertainty. For a database, use a backup method that understands the database and verify its restore procedure. Avoid treating every disk image as equally recoverable.

## Keep the experiment small

Write down the guest configuration and the change you are about to make. Take a checkpoint when it helps. Then make one meaningful change and inspect the result.

If you roll back, verify that the intended state returned. Shared folders, external databases, and other systems outside the guest may not roll back with it.

## Try losing the original

A useful recovery exercise starts with a separate destination. Can you restore the guest, boot it, and read the data without relying on the original VM still being present?

Snapshots are excellent shortcuts inside a workflow. Backups answer a different question: what remains recoverable when the original environment is gone?
