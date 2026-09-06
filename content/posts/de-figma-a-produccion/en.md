---
slug: from-figma-to-production-without-losing-anything
title: "From Figma to production: my process for not losing anything in translation"
excerpt: "Designing and coding the same product changes the order of decisions. How I organize the path from a Figma file to real components, without the friction of two people passing a file back and forth."
focusKeyphrase: from Figma to code
seoTitle: "From Figma to code: how to ship a design without losing fidelity"
seoDescription: "The process I use to take a Figma design to production React components: what gets decided in design, what gets decided in code, and why the order matters."
ogTitle: "A design that can't be implemented is a design that isn't finished"
ogDescription: "How I take a Figma file to real components, being the same person on both sides."
coverAlt: "Figma panel next to a code editor showing the same component"
status: published
publishedAt: 2026-10-19
tags: diseno-ui, react, producto
---

When the designer and the developer are the same person, one classic problem disappears — the broken-telephone fight between two roles — and a quieter one takes its place: the temptation to skip steps because "I already know what I want", only to discover in the code that you didn't know it as well as you thought.

This is the process I use so that the path from Figma to production doesn't lose fidelity, even when nobody else is reviewing it.

## The rule that orders everything

**If it can't be implemented without guessing, it isn't designed. It's drawn.**

A pretty Figma file isn't a design system. It's an illustration of what a design system would look like if it existed. The difference shows up in exactly one place: how easily a developer — in my case, myself three days later — can make a decision without having to open the original file to guess a value.

## Step 1: tokens before screens

Before designing a single screen, I define the tokens: colour, spacing, typography, border radii. In the Mexx redesign that was the brand red (#E73E3E), a 4-pixel spacing system, and two typefaces with fixed roles — Inter for interface, Merriweather for editorial content.

This reverses the natural order. The temptation is to design the screen and "extract" the tokens afterwards, looking at what's left. Doing it backwards forces you to decide the system before you have a screen that justifies it, and that system is exactly what turns into Tailwind variables with no translation step in between.

## Step 2: components with states, not screens with cases

I design a button, not forty screens each with a slightly different button. And the button is designed with its states: default, hover, disabled, loading. It isn't a tidiness quirk — it's the difference between a React component with clear props and a developer who has to invent the `disabled` state because nobody designed it and "something has to go there".

When the design already carries the four states, the component in code ships with four planned variants. When it doesn't, the developer improvises, and that improvisation is exactly the point where the final interface stops resembling the design.

## Step 3: the interactive prototype, not the static sheet

I use Figma to build the whole navigable flow, not loose screenshots. A navigable flow exposes problems a static sheet doesn't: a transition that makes no sense, a loading state nobody drew, a way back that doesn't exist.

For Mexx, six interface animations were explicitly documented — the hero slider, the auth modal, the cost breakdown, the save indicator, loading states, checkout transitions. None got improvised in the code, because none reached the code without first being decided in the design.

## Step 4: implementing is where the design gets tested, not where it gets executed

Here's the part that changes when both skills live in the same person: implementation stops being a mechanical step and becomes the last review of the design.

Writing the component in React, questions come up that Figma doesn't force you to answer: what happens if the text is twice as long? What happens on a narrow screen? What happens if the data arrives late? Figma lets you design with the perfect text, the perfect length, loaded instantly. Code forgives none of those three things.

When I find a case the design didn't account for, I go back to the Figma file and resolve it there, not directly in the code. It feels like an extra step — I'm already in the editor, I could just fix it there — but skipping it is exactly how the design file stops being the source of truth and becomes a historical document that no longer describes the real product.

## What this order prevents

**It prevents the fake design system.** One where Figma says one thing and the code does another, and with every iteration the gap grows until nobody trusts either file.

**It prevents redoing work.** If the spacing token is a real Tailwind variable, changing it once changes it everywhere. If it's a number every component copied by hand, changing it means hunting it down component by component and hoping you didn't miss one.

**It prevents the most expensive question in a custom project:** "did we decide this in the design, or are you deciding it right now while coding?". With this order, that question almost never gets asked. It's already answered before it reaches the code.

## The real cost of this method

It isn't free. Designing tokens and states before having a single screen feels slower at first — there's nothing "finished" to show in the early days. For someone used to seeing progress as new screens, that can read as if nothing is happening.

What's actually happening is that the foundation is being built that makes screens six, twelve and twenty ship faster and more consistently than screen number two. The order pays upfront to collect later, and on any project longer than a couple of weeks, it always comes out ahead.

I wrote about the technical half of this in [design tokens: from Figma to Tailwind](/en/blog/design-tokens-figma-to-tailwind), and the full process, with the five stages that come before this point, is in [how I design an interface from scratch](/en/blog/how-i-design-an-interface-from-scratch).
