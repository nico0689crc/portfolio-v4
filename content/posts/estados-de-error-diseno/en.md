---
slug: designing-for-when-something-goes-wrong
title: "Designing for when something goes wrong, not only for when everything works"
excerpt: "Most mockups show the perfect state: complete data, stable connection, everything working. The error state almost never gets designed, it gets improvised in the code, and it shows."
focusKeyphrase: designing error states
seoTitle: "Designing error states: why they can't be a last-minute idea"
seoDescription: "Why an interface's error states need the same design attention as the ideal state, with the criteria for making sure an error never feels like a dead end."
ogTitle: "The state that gets designed the least is the one that frustrates the most"
ogDescription: "The criteria for designing error states that never leave anyone stranded."
coverAlt: "Interface showing an error state with a clear action to continue"
status: published
publishedAt: 2027-06-21
tags: diseno-ui, producto
---

If you look at the mockups of any project at its design stage, almost all of them show the same scenario: complete data, a perfect connection, everything working. It's the easiest state to design and the least representative of how a product actually gets used, because in production errors aren't the rare exception — they're a constant part of real use.

## Why the error state gets improvised

When the design doesn't account for what happens if something fails, the developer has to decide it on the spot, without the time or context a designer has to think it through calmly. The result is almost always a generic message, with no clear action, written in a hurry before a deploy — it's exactly the same problem I documented about [microcopy](/en/blog/microcopy-is-a-product-decision): whatever doesn't get designed with intention gets solved with whatever occurs first to whoever is coding that screen.

## The three error categories I design differently

**Recoverable user error.** A badly filled-out field, an invalid format. Here the design has to point exactly at what's wrong and how to fix it, right where the error is, not in a generic message above the entire form that forces you to hunt down which of ten fields is the problem.

**Temporary system error.** The connection dropped, an external service didn't respond in time. Here the design has to communicate that the problem isn't the user's fault and offer a clear retry. "Something went wrong" says neither thing — it doesn't say whether it was their fault, and it doesn't say what they can do.

**Empty state, which isn't technically an error but feels similar.** No search results, no content loaded yet. I design this with the same attention as a real error, because for the user the feeling is the same: they arrived somewhere with no clear way out.

## The criteria I apply to every error message

Every error state has to answer two specific questions, or it isn't finished: **what happened?** and **what can I do now?** A message that answers only the first leaves the person knowing something failed but with no action — that's information with no way out. One that answers neither is noise.

## A concrete example from this very site

When someone submits the contact form and the server can't process the message, the error state doesn't say "there was an error". It specifically says there was a problem sending the message and that they can try again later — the person knows it wasn't their fault and knows what to do with that information, instead of staring at a generic message with no direction.

## Why this is a design decision, not only a content one

Where the error appears matters as much as what it says. A validation error that appears far from the problem field forces the person to hunt for it. An error that unexpectedly pushes the layout down can make the person lose track of where they were looking. Designing the error state includes designing where it spatially lives, not just what words it uses.

## How I know if an error state is well designed

I show it to someone with no prior context of the product and ask them what they'd do next. If the answer is immediate and matches the correct action, the error is well designed. If the person hesitates, or asks "so now what do I do?", the error is still a dead end disguised as an informative message.

## The rule that sums this up

An error state designed with the same care as the ideal state isn't a luxury for well-funded projects. It's recognizing that, in any product's real use, the error state isn't the exception — it's a constant part of the experience, and treating it as a last-minute afterthought means designing for only a fraction of the moments that actually matter.
