---
slug: how-i-use-ai-in-my-workflow-without-losing-judgement
title: "How I use AI in my workflow without losing judgement"
excerpt: "AI doesn't replace technical judgement, it tests it more often. Where I use it, where I don't, and why the right question isn't how much it speeds things up but which decisions a person still has to make."
focusKeyphrase: AI in software development
seoTitle: "AI in software development, without losing judgement"
seoDescription: "Where I use AI in software development and where I don't, with the criteria I apply so it accelerates without replacing the decisions that matter."
ogTitle: "The AI that writes code fastest is the one you should trust least unsupervised"
ogDescription: "Where I fold AI into my workflow, and the three questions I ask before accepting anything it generates."
coverAlt: "Code editor with an AI suggestion next to a manual review"
status: published
publishedAt: 2026-11-23
tags: ia, producto
---

The question I get asked most about AI in software development isn't whether I use it: that's already assumed. It's whether I trust what it generates. The short answer is no, and that specific distrust is exactly what makes it useful instead of risky.

## Where I use AI in software development every day

**To speed up the mechanical parts.** Boilerplate, repetitive component structure, migrating a pattern I've already defined to a new case. There AI does in seconds what would take me minutes by hand. The risk of it getting something wrong is low because the pattern is already decided: it's only applying it.

**To explore architectures before committing.** When I'm evaluating a new approach, I ask AI to generate a quick version of two or three alternatives. Not to use the code it produces, but to see the trade-offs of each path faster, before investing real hours in one.

**To debug with another perspective.** Pasting an error and asking for hypotheses is faster than searching forums. It helps most with configuration or dependency errors, where the answer already exists somewhere and you just have to find it.

**To prototype interfaces fast.** Going from a design idea to a first navigable HTML in minutes, so I can discuss it with something concrete instead of an abstract description.

## Where I don't use it, or use it with much more care

**Architecture decisions that will live for years.** When I chose the stack for [GymSmartAccess](/en/projects/gym-smart-access), the decision depended on very specific constraints of my business: infrastructure cost, one developer maintaining it, recurring payments in Argentina. An AI doesn't have that context unless I give it explicitly, and by the time I gave it all of it, I had already made the decision — AI at best confirms reasoning I already did, it doesn't replace it.

**Code that touches money or sensitive data.** A payment webhook, a permissions check. There I review every line as if it were written by someone I don't fully trust, because that's exactly the right relationship to have with generated code in a place where a mistake isn't an annoying bug but a real customer's lost money.

**Anything where "looks reasonable" isn't enough.** AI is remarkably good at generating code that **looks correct** and remarkably bad at explaining why you should trust that it is. For critical code, I need to understand the reasoning, not just the result.

## The three questions I ask before accepting anything it generated

**Do I understand why it works, not just that it works?** If I can't explain the logic without looking at the code again, I don't accept it yet. Accepting code I don't understand is accumulating invisible technical debt: it works today, and the day it fails, nobody — not even me — will know why.

**What did it assume that I never told it?** AI fills context gaps with assumptions that look reasonable in a vacuum but rarely match my project's real constraints. I review specifically what it assumed, because that's where the quietest bugs hide.

**Is this exactly what I need, or is it the generic thing that resembles it?** Generated code often solves a similar, reasonable problem, but not the specific problem I have. It looks fine, passes a quick review, and fails on the particular case that actually matters.

## The effect nobody talks about enough

According to [Stack Overflow's survey](https://survey.stackoverflow.co/2024/ai), most developers already use these tools daily, so the advantage isn't in using them. What changed my work the most wasn't the speed of writing code. It's that, by delegating the mechanical writing, I have more energy left for the two things that actually matter: the user experience and the structural quality of what I'm building. Writing code faster is worth nothing if the thinking behind it is wrong — AI doesn't fix that, it just produces it faster.

## The rule that sums this all up

I use AI to produce options faster, never to make the final call. The decision stays mine because I'm the one who understands the project's real constraints, and those constraints are almost never complete in the prompt I wrote.
