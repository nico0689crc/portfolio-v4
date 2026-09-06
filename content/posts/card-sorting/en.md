---
slug: card-sorting-how-people-group-information
title: "Card sorting: finding out what information looks alike, according to who uses it"
excerpt: "Before deciding how a site's categories get grouped, I ask people to group them themselves. What comes out is almost never what I would have guessed."
focusKeyphrase: card sorting
seoTitle: "Card sorting: the technique for grouping information"
seoDescription: "What card sorting is, how to run an open and a closed session, and how it differs from tree testing in the information architecture process."
ogTitle: "I asked ten people to group 40 cards, and none grouped them the way I expected"
ogDescription: "How I use card sorting to discover how people group information, before deciding a site's structure."
coverAlt: "Content cards grouped into different categories on a table"
status: published
publishedAt: 2026-12-21
tags: ux-research
---

The [tree testing](/en/blog/tree-testing-information-architecture) I documented in another article has an uncomfortable prerequisite: you need a category tree already in place to test it. Card sorting is what I do **before** that, when I don't yet know how to group anything.

## The technique of card sorting, without the fluff

I give each participant a deck of cards. Each one has the name of a real piece of content or product — not a category, a specific item. I ask them to group them however makes sense to them, and afterwards to name each group they built.

That's the whole experiment. The interesting part is never the instruction, it's what people do with it when nobody tells them how to group.

## Open vs. closed

**Open card sorting:** the person builds their own groups and names them whatever they want. Useful when I have no prior structure and want to discover what categories make sense from scratch. It's the one that surprises the most, because there's no suggested category that could bias the answer.

**Closed card sorting:** I give already-defined categories and ask them to place each card into one. Useful for validating a structure I've already built, before moving to formal tree testing. It's an intermediate step between "I have no structure" and "I want to test the structure I already have".

I almost always start with an open one. If I already have a strong structural hypothesis, I use a closed one to confirm it faster.

## What card sorting almost always reveals that you didn't expect

The most common surprise isn't which cards get grouped together — that usually matches intuition reasonably well. It's **what the groups get named**. It's exactly the same kind of finding I documented with the "Software" category at Mexx: people group products reasonably, but the name they give the group almost never matches the company's internal catalogue.

That's the real value of the technique: it doesn't organize the information for you. It shows you the vocabulary people already think in about that information, so the structure can speak that language instead of yours.

## How many people it takes

Between 15 and 20 for an open sort, more than the 10 that's usually enough for a survey or a tree test. The reason is that there's no success-or-failure task to measure here. There are grouping patterns that need to repeat several times before you can trust they're a real pattern, and not a coincidence between a couple of people who happened to think alike.

## Tools

I use the same ones — [UXTweak](https://www.uxtweak.com/), [Optimal Workshop](https://www.optimalworkshop.com/) — as for tree testing. Both offer the two techniques on the same platform, designed to complement each other: sort first to discover groups, then test the resulting tree to confirm it actually navigates well.

## Where card sorting fits in the full process

Card sorting comes before [tree testing](/en/blog/tree-testing-information-architecture), in the definition stage of [my design process](/en/blog/how-i-design-an-interface-from-scratch). The order matters: sorting first gives you the candidate structure, testing afterwards confirms whether that structure actually navigates well.

Skipping the sort and guessing the structure upfront means testing a hypothesis that was never checked against how people group things in their heads. When that hypothesis fails, the structure has to be redone after the tree test. That's exactly the double work these two techniques, used in order, exist to avoid.

It's tempting to skip the sorting step when a project's timeline is tight, because it feels like one more research task rather than part of the design itself. But information structure is the foundation every screen after it stands on, and a badly sorted foundation forces you to redo visual work you'd already called finished.
