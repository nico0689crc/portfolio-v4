---
slug: how-i-prepare-for-a-technical-interview
title: "How I prepare for a technical interview without memorizing algorithms I'll never use"
excerpt: "Practicing data structure exercises you'll never write in real work is the most common way to prepare, and probably the least useful. What I practice instead."
focusKeyphrase: prepare for a technical interview
seoTitle: "How to prepare for a technical interview, properly"
seoDescription: "How to prepare for a technical interview without memorizing algorithms: what I practice instead, what I still review, and with which examples."
ogTitle: "I never inverted a binary tree in a real job. I did practice explaining decisions"
ogDescription: "How I prepare for technical interviews by practicing what actually gets used day to day."
coverAlt: "Person explaining a technical decision at a whiteboard, no algorithm code"
status: published
publishedAt: 2027-05-10
tags: carrera
---

There's an entire industry built around algorithm exercises: inverting binary trees, solving dynamic programming problems against the clock. I practiced those at the time. The honest conclusion is that how you prepare for a technical interview has little to do with them, because they almost never reflect the work I do every day.

This is what I practice instead, and why it feels more representative of what actually matters at work.

## Why the classic exercise measures what matters least

An algorithm exercise under time pressure measures speed of reasoning on an isolated problem with no business context. That's a real skill, but it's the one used least in product development. Almost no real problem arrives without context, and almost no important decision gets made with a forty-minute timer running.

What gets used every day is explaining why you chose one architecture over another. To someone who doesn't share your context and is going to question your reasoning.

## How to prepare for a technical interview: what I practice

**Explaining a real decision from one of my own projects, out loud, to someone who doesn't know it.** Not reviewing the project: explaining why I chose one approach and what I discarded. When I explain why I chose Next.js and Supabase for [GymSmartAccess](/en/projects/gym-smart-access), I practice saying the full reasoning. What constraints I had, what alternatives I evaluated, why I discarded them. That narrative is what an interviewer evaluates when they ask about a résumé project.

**Anticipating the uncomfortable question about my own decision.** Before the interview I ask myself what the weakest point of every decision I'll mention is. Then I practice answering that honestly instead of defending it as if it were perfect. "I chose X, and the trade-off I accepted was Y" sounds more solid than pretending there's no trade-off, and it's also true.

**Explaining someone else's code, not just writing my own.** I take a fragment of code from an open source project and explain out loud what it does and why it's written that way. It's the deliberate version of [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging). It looks far more like joining a team and understanding an existing codebase than writing an algorithm on a blank whiteboard.

**Practicing saying "I don't know, but here's how I'd find out".** It's the answer that needs the most practice and gets the least, because it feels like admitting a weakness. In practice it builds the most confidence. It shows the interviewer how I think when facing the unknown, which is the situation that repeats every week in a real job.

## What I do review, even without memorizing it mechanically

The fundamentals that do come up often: how JavaScript's event loop works, what problem each type of database index solves, when a component needs to be [Server or Client in Next.js](/en/blog/server-vs-client-components-nextjs). I don't memorize them as exam answers. I review the reasoning behind them, so I can reconstruct the answer even if the question is phrased differently.

## What I do the day before

Nothing new. I reread my own projects and pick three decisions I can tell from memory, with their context and their trade-off. If I have to open the repository to remember why I did something, that decision doesn't make the list: telling one of your own decisions badly leaves a worse impression than not mentioning it.

## The point that was hardest for me to accept

Not every interview is going to value this preparation. Some companies still use the pure-algorithms format, and this specific preparation doesn't fit perfectly there. But even there, explaining reasoning clearly, and not just arriving at the correct answer, is what separates a mediocre interview from one that leaves a good impression.
