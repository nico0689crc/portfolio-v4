---
slug: prototyping-interfaces-fast-with-ai
title: "How I use AI to prototype interfaces fast (without it replacing design)"
excerpt: "Going from an idea to a first navigable HTML in minutes turns an abstract discussion into a concrete one. The difference between using AI to explore and using it to decide."
focusKeyphrase: prototyping with AI
seoTitle: "Prototyping with AI without losing design judgement"
seoDescription: "Prototyping with AI without mistaking a generated sketch for a finished design: what I use it for, which decisions stay mine, and where I draw the line."
ogTitle: "A three-minute AI-generated sketch beats a description in a meeting"
ogDescription: "How I fold AI into interface prototyping, and where I draw the line between exploring and deciding."
coverAlt: "Quickly generated interface sketch next to a refined final version"
status: published
publishedAt: 2027-01-04
tags: ia, diseno-ui
---

Discussing an interface idea using only words is slow and ambiguous: two people can agree while imagining different things. Prototyping with AI changes that conversation, because having something navigable on screen, even a rough sketch, moves it from "can you picture something like..." to "look at this, what would you change?".

AI shortened the path between the idea and that sketch from minutes to seconds. This is what changed in my process, and what didn't.

## What prototyping with AI is good for, specifically

**Exploring layout variants before committing to one.** I describe the content and function of a screen and ask for two or three different structures. Not to directly pick which one to use, but to see quickly what options exist before investing real time drawing in Figma.

**Turning an abstract idea into something viewable, in the first meeting with a client.** When someone describes what they need in words, generating a navigable HTML on the spot, even a rough one, reveals misunderstandings that a verbal description hides. It's far cheaper to discover in meeting one that "that's not what I meant" than to discover it after two weeks of design work.

**Generating realistic filler content.** Instead of "Lorem ipsum", I ask for example text that resembles the real content — product names, prices, short descriptions. A design reads completely differently with real content versus generic content, and this speeds up getting that more honest version from the start.

## Where I draw the line

**The generated sketch is never the final design.** It's a starting point for discussion, not a finished proposal. The difference matters because an AI sketch solves the obvious: where the title goes, where the button goes. And it systematically doesn't solve what requires judgement, like the correct visual hierarchy for *this* content, spacing that follows the project's [tokens](/en/blog/design-tokens-figma-to-tailwind), or an accessible focus state.

**System decisions don't get delegated.** Which colours are semantic, what spacing the project uses, which accessibility rules apply — those decisions come from the design system that already exists, not from whatever AI generated for that specific prompt. If I let every generated sketch bring its own values, I end up with an interface that isn't consistent with itself, even though each individual screen looks fine.

**Everything goes through the same accessibility and usability test as any design.** A quickly generated sketch isn't exempt from the heuristic audit or from testing with real users. It speeds up the first version, it doesn't replace validation.

## A concrete example of how I combine it with my process

When I'm exploring a new screen, I start by generating two or three quick variants with AI, pick the one that best resolves the information hierarchy, and **only then** rebuild it by hand in Figma, applying the project's real tokens and reviewing contrast and keyboard focus. The generated part saved me the initial exploration. The manual part is what turns that exploration into something that can be implemented without guessing, which is the test I described in [from Figma to production](/en/blog/from-figma-to-production-without-losing-anything).

## Why this doesn't replace the full process

A sketch generated in minutes doesn't replace the research stages that come before it: understanding the problem, defining what's being solved, prioritizing between alternatives. What [Nielsen wrote about low-fidelity prototypes](https://www.nngroup.com/articles/paper-prototyping/) decades ago still holds: the value is in what it reveals, not in how finished it looks. It speeds up the part where an idea that already went through those stages gets *materialized*. Using it to skip the research is like using a fast car to drive in the wrong direction: you get to the wrong place sooner.

AI bought me time in the prototyping stage. I reinvest that time in the testing stage, which is what actually determines whether the design works.
