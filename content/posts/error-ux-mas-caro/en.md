---
slug: the-ux-mistake-that-repeats-the-most
title: "The UX mistake I've seen repeated the most (and made myself)"
excerpt: "It has nothing to do with tools or methodology. It's confusing 'we finished testing' with 'there's nothing left to find', and the difference gets expensive in production."
focusKeyphrase: common UX mistakes
seoTitle: "Common UX mistakes: the one I have seen repeated most"
seoDescription: "Common UX mistakes: the most repeated one I have seen in real projects, with a documented example of my own, and how I avoid falling for it again."
ogTitle: "Finishing the test isn't the same as having no more findings"
ogDescription: "The mistake I've seen repeated the most in UX projects, with my own example that I documented instead of hiding."
coverAlt: "Research report with one finding marked as pending"
status: published
publishedAt: 2026-11-16
tags: ux-research, producto
---

Of all the common UX mistakes, the most expensive one I have seen — and made myself — has nothing to do with tools or methodology. It is simpler and more human: confusing "we finished the test" with "there's nothing left to find".

## What common UX mistakes look like in practice

You run a [usability test](https://www.nngroup.com/articles/usability-testing-101/), measure success rate and time. Everything comes out reasonably well and the project moves forward. The test did its job: it validated that the main flow works. What's easy to forget is that a test validates **what you decided to measure**, not everything that exists in the interface.

In the test for the [Mexx redesign](/en/projects/mexx-ux-redesign), with 10 participants in Maze, I measured two tasks: cart continuity and cost transparency. Both measured well. But the test revealed something I wasn't looking for: a **49-51% misclick rate** in the header, people clicking where there was nothing to click.

That finding wasn't part of the tasks I designed. It showed up anyway, because real behaviour doesn't respect the boundaries of what you decided to evaluate.

## The mistake, specifically

It wasn't failing to measure the header from the start. Nobody can measure everything upfront, and prioritizing what gets tested is a legitimate part of the job. The mistake would have been closing the project without mentioning it, or mentioning it as a weightless footnote because the two "important" tasks had gone well.

With a four-week timeline, I didn't get to redesign the header in that cycle. What I did was document it explicitly as outstanding debt, with the exact number, in the same report where I showed the positive results.

## Why this is harder than it sounds

There's real, almost always unspoken pressure for a research report to close on a positive note. A client who paid for the project wants to see it worked. A résumé wants to show wins. And documenting an unresolved finding feels like admitting the work was incomplete. It is actually the opposite: proof that the research was honest enough to find something nobody was looking for.

A case study that only tells you what went well isn't a case study. It's a brochure, and a brochure is useless to anyone evaluating whether you know how to do this work. Every real project has something unresolved. The only question is whether whoever did it knows and says so, or missed it, or hid it. I wrote about that in [how I write a case study](/en/blog/how-i-write-a-case-study-anyone-without-a-design-background-can-follow).

## How I try to avoid it now

Before closing any research, I ask myself a specific question: **what did I find that I wasn't looking for?** Not "did I answer the questions I set out to answer?" — that always has a comfortable answer — but what showed up on the margins, without me having asked for it.

There's almost always something. An odd click pattern, a comment a participant made in passing, a screen where everyone hesitated a second too long even though they technically completed the task. Those side signals are almost always where the next real problem lives, precisely because nobody was looking for them yet.

## The cost of not doing it

If that header misclick rate had gone undocumented, the problem wouldn't have disappeared. It would have stayed there, waiting for someone to rediscover it — probably in production, with real users, months later, when it's already more expensive to fix and nobody remembers there was already evidence it existed.

Documenting it when it shows up, even if it doesn't get fixed right away, is the difference between a known problem that gets prioritized when there's time, and an invisible one someone rediscovers by surprise.
