---
slug: how-i-prioritize-design-ideas-fvd-matrix
title: "How I prioritize design ideas without the loudest one winning"
excerpt: "Every ideation meeting produces ten proposals and budget for three. The matrix I use so the decision doesn't depend on who spoke with the most confidence."
focusKeyphrase: product prioritization matrix
seoTitle: "Product prioritization matrix: the FVD method"
seoDescription: "How to use a product prioritization matrix built on feasibility, value and difficulty, with a real example of 10 design ideas scored."
ogTitle: "10 ideas, 6 survived, and none of them survived for being anyone's favourite"
ogDescription: "The matrix I use to prioritize design and product ideas without the loudest one winning."
coverAlt: "Prioritization matrix with ideas plotted by value and difficulty"
status: published
publishedAt: 2026-12-28
tags: producto, diseno-ui
---

Every ideation session ends the same way: fifteen ideas on a whiteboard, budget for three. The discussion gets resolved by whoever spoke with the most conviction, not by which idea was better. A product prioritization matrix exists to take that decision out of the meeting room and put it into a calculation anyone can check.

## The three questions in a product prioritization matrix

**Feasibility:** can we build it with what we have — time, team, technology? Not "is it possible in theory?", but "is it possible for us, right now?".

**Value:** how much does it move the needle on the problem we're solving? Not "does someone like it?", but specifically whether it helps answer the business question behind the project.

**Difficulty:** how much real effort does it cost, beyond how much it looks like it costs? This is the column that's almost always underestimated. An idea that sounds simple in one sentence can hide technical complexity nobody sees until it's already half-built.

I score each from 1 to 5, and the final score is feasibility plus value, minus difficulty. Deliberately simple: a complicated formula invites people to tweak it until it gives the answer they already wanted.

## The real case: 10 ideas, 6 survived

In the Mexx redesign, I evaluated ten ideas to fix the lost-cart and hidden-cost problems. Six survived: persistent cart synced in the database, floating cost breakdown, digital-product label, express login modal, guest checkout, cart recovery via magic link.

And four were dropped that sounded interesting in the meeting: WhatsApp cart integration, an AFIP tax calculator, an AI chatbot, gamification.

None of the four dropped ones were bad ideas in the abstract. The AI chatbot, for instance, had reasonable value — it could answer user questions. But its difficulty was high for the four-week timeline. And its value for the two problems we were solving, cart and costs, was low: it didn't attack either one. It lost by the matrix, not by opinion.

## Why this avoids the ego fight

The most useful part of the matrix isn't the calculation. It's that it **separates the person from the idea**. When someone proposes something and it gets dropped, the conversation isn't "your idea is bad". It's "this idea scored low on value for the problem we're solving this time". That's defensible without anyone feeling attacked, and it's reversible: the same idea can score differently on another project.

It also avoids the most common bias in unstructured prioritization: the idea of whoever has the most seniority or speaks with the most confidence wins by default. The matrix doesn't know who proposed it.

## The honest limit

The matrix doesn't remove judgement, it makes it explicit. Scoring "value" a 4 instead of a 3 is still a subjective call. What changes is that subjectivity gets written down and made discussable, instead of hidden behind "I just think this is more important".

And there's a real risk if it's misused: if someone wants their idea to win, they can inflate the value or minimize the difficulty until the number agrees with them. That happens to any scoring method, [RICE](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/) included. The matrix protects against authority bias, not against bad faith. For that, what helps is scoring as a group, out loud, where every number can be challenged on the spot.

## When it isn't worth using

For two or three ideas it's faster to decide by direct judgement: building the matrix costs more than it saves. It becomes valuable from around eight or ten ideas onward. That's where memory and intuition start failing, and where an unstructured discussion drags on for an hour without landing anywhere.

This is one of the tools I use in the ideation stage of [my design process](/en/blog/how-i-design-an-interface-from-scratch), right after defining the problem with [tree testing](/en/blog/tree-testing-information-architecture) and before touching Figma.
