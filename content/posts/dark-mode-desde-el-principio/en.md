---
slug: dark-mode-from-the-start-not-at-the-end
title: "Dark mode: what changes when you design it from the start"
excerpt: "Adding a dark theme at the end means inverting colours and hoping for the best. Designing it from the start means treating colour as a variable, not a fixed value, from the very first screen."
focusKeyphrase: designing dark mode
seoTitle: "Designing dark mode from the start of a project"
seoDescription: "Why designing dark mode at the end of a project goes wrong, and how to define colour tokens from the start so both themes actually work."
ogTitle: "Inverting the colours isn't designing a dark theme"
ogDescription: "What changes when dark mode is planned from the first screen, instead of bolted on at the end."
coverAlt: "Same interface shown in light theme and dark theme"
status: published
publishedAt: 2027-02-08
tags: diseno-ui, design-systems
---

There's a quick way to spot a dark mode that got added at the end: the accent colours look exactly the same in both themes. An amber that works on a white background almost never works at the same intensity on a near-black one. If it looks identical in both, chances are nobody looked closely at one of them. Designing dark mode is more than inverting values.

## Why "inverting the colours" isn't enough

The naive way to add a dark theme is to mechanically darken every colour: white background becomes black, black text becomes white, done. The problem is that contrast, visual hierarchy and the weight of each colour don't behave the same at both extremes.

A grey that subtly separates two sections on a light background can disappear on a dark one, or turn into a line that's too sharp. An accent colour that pops perfectly on white can hurt the eyes on pure black. The extreme contrast produces a vibrating effect that isn't present in the light theme.

## How I approach designing dark mode from the start

**Colour is never a fixed value, it's a semantic [token](/en/blog/design-tokens-figma-to-tailwind) with two definitions.** `color-background` isn't "white". It's a name that resolves to one value in light mode and another in dark mode. No component knows the final value, only the role. It's the same layered logic I described for tokens in general, applied to the problem of having more than one theme.

**Every pair of values gets tested together, not separately.** When I define the accent colour, I test it against the light and the dark background at once, adjusting each until both feel like the same relative visual weight. It isn't the same hex value on both. It's a value calibrated for each context, under the same semantic name.

**Secondary text needs more care than primary text.** Main text contrast usually turns out fine in both themes almost effortlessly, because that extreme of contrast is easy to get right. Secondary text and subtle borders are where badly done work shows the most. The margin for error is small: too little contrast and it vanishes, too much and it stops feeling "secondary". The [WCAG](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum) standard sets the floor, not the ceiling.

## The technical case: where this decision lives in code

On this portfolio, every surface defines its own block of CSS variables instead of inheriting an automatic calculation. The hero, for instance, is a section with a fixed dark background by design. It defines its own surface tokens for the elements inside it — cards, text — instead of inheriting the page's general theme tokens. That section needs to look consistent regardless of the visitor's chosen theme, so its tokens are calibrated as a separate case.

That's a design decision encapsulated in the token system, not a real-time calculation flipping values. Every theme-and-surface combination was looked at and adjusted on purpose.

## Why designing dark mode early is cheaper

If components already assume a fixed background colour — hardcoded, not referenced through a token — adding a second theme later means auditing every component one by one. You have to find where the fixed value breaks the new theme. If everything references semantic tokens from the start, adding the second theme means redefining those tokens in one place. Every component inherits it without anyone touching it.

It's the same argument I made about [tokens in general](/en/blog/design-tokens-figma-to-tailwind). The early investment in naming things properly pays off, with interest, every time the system grows in a direction nobody anticipated.

## The detail that catches most teams out

There's a third state people forget: the visitor who has never chosen a theme at all. Their browser reports a system preference, and nothing gets stamped on the page to say which theme won. If your styles only define colours inside a `[data-theme]` block, that visitor gets a page with no colours defined — usually dark text on a dark ground, or the reverse.

The fix is an ordering rule, not extra code. The base block defines the complete light palette. The media query for the system preference redefines only the tokens. The explicit theme attribute redefines them again, so a manual toggle beats the operating system in both directions. Every colour exists in the base block before anything overrides it.

I check this the same way every time: load the page with no theme chosen, then switch the operating system between light and dark without touching the site. If anything becomes unreadable in either direction, a token is defined in the wrong place.
