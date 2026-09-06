---
slug: design-tokens-figma-to-tailwind
title: "Design tokens: how what I design in Figma ends up as Tailwind config"
excerpt: "A design token isn't a decorative best practice: it's what turns changing a colour into one line instead of a component-by-component search. How I organize them and how they cross into code."
focusKeyphrase: design tokens
seoTitle: "Design tokens: from Figma variables to Tailwind config"
seoDescription: "What design tokens are, how to organize them in three layers (primitive, semantic, component) and how they cross from Figma into Tailwind."
ogTitle: "The day the brand colour changed in a single line"
ogDescription: "How I organize design tokens so a design change is a code change, not a component-by-component search."
coverAlt: "Colour palette organized into primitive and semantic token layers"
status: published
publishedAt: 2026-10-26
tags: design-systems, diseno-ui, react
---

There's a simple test to know whether a project has real design tokens or just has the word "tokens" on a slide: ask someone to change the brand colour and count how many files they have to touch.

If the answer is "one", there are tokens. If the answer is "let me find every place we used that orange", there aren't, no matter what the Figma folder is called.

## What a token is, without the fluff

A named design value, used by reference instead of copied. Instead of writing `#E73E3E` in forty places, you write `color-brand` in forty places, and that name points to a single value. Change the value once, it changes in all forty places.

That's it. The interesting part isn't the definition — it's how they're organized so they scale.

## The three layers

I use three levels, and confusing them is the most common mistake I see in systems that call themselves "token-based".

**Primitives.** The raw values. `amber-500: #E73E3E`. `space-4: 4px`. They don't say what they're for, only what they are. It's the base vocabulary.

**Semantic.** These give a primitive a role. `color-accent: amber-500`. `color-danger: red-600`. This is where meaning lives: if the accent colour changes from amber to blue tomorrow, the semantic token points to a different primitive, and no component notices the change because it never knew the raw value, only the role.

**Component.** Specific cases that need their own name. `button-primary-bg: color-accent`. These are for when a component needs to deviate from the general semantic without breaking the chain.

The reason for three layers instead of one is that each changes for a different reason. Primitives change when you redesign the entire palette. Semantics change when you redefine what "the danger colour" means in your product. Component tokens change when one specific button needs to behave differently. Without the layers, those three reasons for change get tangled in the same place, and touching one risks breaking the other two.

## How design tokens cross from Figma into code

In Figma, "variables" or "styles" are the visual version of the semantic layer: you assign them a value and the library's components reference them. Up to there, it's exactly the same mental model as in code.

The real crossover happens in a configuration file. On a project using Tailwind, that means the Figma semantic token has a mirror row in [the project's theme](https://tailwindcss.com/docs/theme):

```
--color-accent: hsl(38 92% 50%);
--space-4: 1rem;
```

And React components use the Tailwind class that references that variable, never the raw value. `bg-accent`, not `bg-[#E73E3E]`. The second form works exactly as well on day one, and it's exactly what breaks the system the day the colour changes: you search for `bg-[#E73E3E]` across the entire project and hope you didn't miss one.

## The case where this paid for itself

In the Mexx redesign, the whole system was: the palette with the brand red, two typefaces with fixed roles, a 4-pixel spacing system, and reusable atomic components. None of that lived inside an individual component — it lived in the semantic layer, and every component inherited from there.

That meant when a new component showed up — the express login modal, say — there was no need to decide again what spacing to use or what shade of grey for secondary text. Those decisions were already made once, in the semantic layer, and the new component inherited them for free.

## The mistake worth naming

The most common mistake isn't having no tokens. It's having **only primitives**, with no semantic layer.

It looks like this: a file with twenty well-named colours — `blue-500`, `red-600` — but each component decides on its own which one to use for what. The danger button uses `red-600` because someone put it there. The error message uses `red-500` because someone else, on a different day, picked a slightly different shade. Both "are a token", in the sense that they're named and not a loose magic value. But they don't share meaning, so changing "the product's danger colour" is still a manual search.

The semantic layer is what turns "I have names for my colours" into "I have a system".

## Why this isn't exclusive to big teams

The usual objection is that design tokens are overhead you can only justify on a large team. It's the opposite: the smaller the team, the more they're worth it, because there's nobody else remembering the decisions but you.

Without tokens, it's you six months from now trying to remember whether the secondary-text grey was `#71717A` or `#737373` across three different files. With tokens, it's a named variable, and the name tells you the role even after you've forgotten the value.

This is the system half of the full process I use to take a design to production, which I described in [from Figma to production](/en/blog/from-figma-to-production-without-losing-anything).
