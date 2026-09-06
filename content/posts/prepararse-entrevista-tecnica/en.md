---
slug: how-i-prepare-for-a-technical-interview
title: "How I prepare for a technical interview without memorizing algorithms I'll never use"
excerpt: "Practicing data structure exercises you'll never write in real work is the most common way to prepare, and probably the least useful. What I practice instead."
focusKeyphrase: how to prepare for a technical interview
seoTitle: "How to prepare for a technical development interview without memorizing algorithms"
seoDescription: "What I practice before a technical interview instead of memorizing data structure algorithms that are almost never used in real work, with concrete examples."
ogTitle: "I never inverted a binary tree in a real job. I did practice explaining decisions"
ogDescription: "How I prepare for technical interviews by practicing what actually gets used day to day."
coverAlt: "Person explaining a technical decision at a whiteboard, no algorithm code"
status: published
publishedAt: 2027-05-10
tags: carrera
---

There's an entire industry of technical interview prep built around algorithm exercises — inverting binary trees, solving dynamic programming problems against the clock. I practiced those exercises at the time, and the honest conclusion is that they almost never reflect the work I actually do every day afterwards.

This is what I practice instead, and why it feels more representative of what actually matters at work.

## Why the classic exercise measures what matters least

An algorithm exercise under time pressure measures speed of reasoning on an isolated problem with no business context. That's a real skill, but it's exactly the skill used least day to day in product development work — almost no real problem arrives with no context, and almost no important decision gets made under the artificial pressure of a forty-minute timer.

What gets used every day is explaining why you chose one architecture over another, to someone who doesn't share all your context and is going to question your reasoning.

## What I practice instead

**Explaining a real decision from one of my own projects, out loud, to someone who doesn't know it.** Not reviewing the project — specifically explaining why I chose one approach and what I discarded. When I explain why I chose Next.js and Supabase for [GymSmartAccess](/en/projects/gym-smart-access), I practice saying not just the conclusion but the full reasoning: what constraints I had, what alternatives I evaluated, why I discarded them. That full narrative is what a technical interviewer is actually evaluating when they ask about a résumé project.

**Anticipating the uncomfortable question about my own decision.** Before the interview, I actively ask myself what the weakest point of every decision I'm going to mention is, and practice answering that honestly instead of defending it as if it were perfect. "I chose X, and the trade-off I accepted was Y" sounds far more solid than pretending there's no trade-off, and it's also more true.

**Explaining someone else's code, not just writing my own.** I take a fragment of code from an open source project and practice explaining out loud what it does and why it's probably written that way. This looks a lot more like the real task of joining a team and understanding an existing codebase than writing an algorithm from scratch on a blank whiteboard.

**Practicing saying "I don't know, but here's how I'd find out".** It's the answer that needs the most practice and gets the least, because it feels like admitting a weakness. In practice, it's the answer that builds the most confidence, because it shows the interviewer how I think when facing the unknown, which is exactly the situation that repeats every week in a real job.

## What I do review, even without memorizing it mechanically

The fundamentals that do come up often in real work: how JavaScript's event loop works, what problem each type of database index solves, when a component needs to be Server or Client in Next.js — I wrote about that in [this article](/en/blog/server-vs-client-components-nextjs). I don't memorize them as exam answers — I review the reasoning behind them, so I can reconstruct the answer even if the question is phrased in a way I didn't expect.

## The point that was hardest for me to accept

Not every interview is going to value this preparation. Some companies still use the pure-algorithms format, and this specific preparation doesn't fit perfectly there. But even in those cases, the ability to explain reasoning clearly — not just arrive at the correct answer — is what separates a mediocre interview from one that leaves a good impression, even within the format I trust the least.
