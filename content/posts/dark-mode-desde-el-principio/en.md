---
slug: dark-mode-from-the-start-not-at-the-end
title: "Dark mode: what changes when you design it from the start"
excerpt: "Adding a dark theme at the end means inverting colours and hoping for the best. Designing it from the start means treating colour as a variable, not a fixed value, from the very first screen."
focusKeyphrase: designing dark mode
seoTitle: "How to design dark mode from the start of a project"
seoDescription: "Why adding dark mode at the end of a project almost always goes wrong, and how to design colour tokens from the start so both themes actually work."
ogTitle: "Inverting the colours isn't designing a dark theme"
ogDescription: "What changes when dark mode is planned from the first screen, instead of bolted on at the end."
coverAlt: "Same interface shown in light theme and dark theme"
status: published
publishedAt: 2027-04-12
tags: diseno-ui, design-systems
---

There's a quick way to spot a dark mode that got added at the end: the accent colours look exactly the same in both themes. An amber that works on a white background almost never works at the same intensity on a near-black one — and if it looks identical in both, chances are nobody looked closely at one of the two themes.

## Why "inverting the colours" isn't enough

The naive way to add a dark theme is to take every colour and mechanically darken it: white background becomes black, black text becomes white, done. The problem is that contrast, visual hierarchy and the weight of each colour don't behave the same at both extremes.

A grey that subtly separates two sections on a light background can disappear completely on a dark one, or turn into a line that's too sharp. An accent colour that pops perfectly on white can hurt the eyes on pure black, because the extreme contrast produces a vibrating effect that isn't present in the light theme.

## How I think about it from the start

**Colour is never a fixed value, it's a semantic [token](/en/blog/design-tokens-figma-to-tailwind) with two definitions.** `color-background` isn't "white". It's a name that resolves to one value in light mode and another in dark mode. No component knows the final value — only the role. This is exactly the same layered logic I described for tokens in general, applied specifically to the problem of having more than one theme.

**Every pair of values gets tested together, not separately.** When I define the accent colour, I test it simultaneously against the light background and the dark background, adjusting each until both feel like the same relative visual weight. It isn't the same hex value on both — it's a value calibrated for each context, under the same semantic name.

**Secondary text needs more care than primary text.** Main text contrast against the background usually turns out fine in both themes almost effortlessly, because that extreme of contrast is easy to get right. Secondary text or subtle borders are where badly done work shows the most, because the margin for error is smaller there — too little contrast and it vanishes, too much and it stops feeling "secondary".

## The technical case: where this decision lives in code

On this portfolio, every surface defines its own block of CSS variables instead of inheriting an automatic calculation. The hero, for instance, is a section with a fixed dark background by design, and it defines its own surface tokens for the elements inside it — cards, text — instead of inheriting the page's general theme tokens. That section needs to look consistent regardless of the theme the visitor has chosen, so its internal tokens are calibrated as a separate case, not as an automatic inversion of the rest of the system.

That's a design decision encapsulated in the token system, not a real-time calculation flipping values. Every theme-and-surface combination was looked at and adjusted on purpose.

## Why doing this early is cheaper

If components already assume a fixed background colour — hardcoded, not referenced through a token — adding a second theme later means auditing every component one by one to find where the fixed value breaks the new theme. If everything references semantic tokens from the start, adding the second theme means redefining those tokens in one place, and every component inherits it automatically without anyone having to touch it.

It's the same argument I made about [tokens in general](/en/blog/design-tokens-figma-to-tailwind): the early investment in naming things properly pays off, with interest, every time the system has to grow in a direction that wasn't anticipated at the start but that the token system can absorb anyway.
