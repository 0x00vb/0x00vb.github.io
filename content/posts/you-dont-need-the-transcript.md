---
title: "You don't need the transcript"
description: "NVIDIA shows agents keep accuracy with short context and frequent compaction. The useful unit is a compact semantic state, not a growing chat log."
topic: ai
concepts: ["agents", "architecture", "inference"]
date: 2026-11-04
written: 2026-11-04
status: published
published: 2026-11-04
order: 36
period: "2025 / 26"
---

A new NVIDIA paper, [You don't need long context](https://arxiv.org/abs/2611.05306), asks a blunt question: do agents actually need the giant context windows everyone is racing to ship?

Their answer, across long-horizon coding benches and long-document tasks, is mostly no. Keep a short live context. Compact often. Sometimes compact after every single action. Accuracy holds. Cost drops hard, because later tokens are much more expensive to generate than earlier ones (up to about 7x on the open-weight models they measured).

That lands close to how I think about harnesses.

## What they measured

On SWE-bench Verified, Claude Opus 4.5 with simple end-of-conversation compaction went from 70.0 to 74.8. With single-action compaction (one tool call per fresh context, carry only a handoff state) it scored 70.2. Median peak context fell from around 32K tokens to about 8K.

Same story on Terminal-Bench. Selective reading of long inputs often beat dumping the whole document into the prompt. The useful information for the next step was small. The input was large.

They call the extreme form a semantic state space model: the agent reads a language description of state, takes one action, updates that state, and a new inference call continues from the brief instead of the full history.

## Transcript vs state

A chat log is a convenient default. It is a bad working memory.

Most of a long agent run is noise for the next decision: old tool dumps, false starts, already-applied edits. What the next step needs is narrower. What is the goal. What is true so far. What was tried and failed. What evidence already passed. What to do next.

That is a state object, not a transcript. Compaction that tries to "summarize the story" keeps the wrong things. Compaction that keeps a brief for further execution (task, plan, artifacts, verification status, dead ends) is closer to what their appendix found works.

This is the same cut I made with [vstack](https://github.com/0x00vb/vstack). The agent does not carry the whole playbook. It gets one step. It submits evidence. Gates decide whether the step is allowed to end. Re-verify if the code changes after a check. The workflow lives outside the prompt as a small machine, not as more text the model has to remember.

NVIDIA's single-action setup is the same shape pushed further: each context is almost only state + one action. The transcript becomes optional history you can re-read selectively if you need it, instead of the default substrate of every call.

## What long context is still good for

They are careful not to claim every task works this way. Some problems need exact earlier facts. The fix is usually not "paste the whole past into every call." It is keep durable records outside the model and let the agent read them when needed.

So the interesting design question is not "how many tokens can we stuff in." It is:

what must stay in the live window
what can live in files, state, and retrieval
what has to be checked by the harness instead of believed from a summary

Long context windows are useful insurance. They are a weak default architecture for agents that run for hundreds of steps.

## Cheap tokens are the ones you never load

If later tokens cost several times more to generate, every unnecessary line in the live context is a tax on every future step. Compaction is not only a memory trick. It is an inference scheduling decision.

The paper questions whether we should keep training and serving models as if full-history accumulation were the natural form of work. I think agents already tell us the answer in practice. The runs that stay coherent are the ones where someone (or something) maintains state, permissions, and verification outside the chat.

Read the paper. Then look at your harness and ask what you are paying to keep in context that should have been state.
