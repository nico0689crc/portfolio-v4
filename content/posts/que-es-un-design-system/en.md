---
slug: what-is-a-design-system-and-when-you-dont-need-one
title: "What a design system is (and when you DON'T need one)"
excerpt: "Building a design system for a single-screen project is spending two weeks on flexibility nobody will use. When it's worth it and when it's over-engineering with a fancier name."
focusKeyphrase: what is a design system
seoTitle: "What is a design system, and when you don't need one"
seoDescription: "What is a design system, how it differs from a component library, and the signals that tell you whether your project needs one at all."
ogTitle: "A design system nobody reuses is a component library with a fancier name"
ogDescription: "When a design system is worth the investment, and when it's work spent on flexibility nobody will use."
coverAlt: "Library of interface components organized hierarchically"
status: published
publishedAt: 2027-01-04
tags: design-systems, diseno-ui
---

Asking what is a design system is less interesting than it looks. It's one of those phrases used to justify both necessary work and wasted work, and the difference isn't in the definition. It's in whether the project actually needed it.

## What is a design system, without the marketing

A design system combines three things. First, [tokens](/en/blog/design-tokens-figma-to-tailwind): the named values for colour, spacing and typography. Second, components: the pieces built from those tokens. Third, usage rules: when to use each component and when not to. The public systems that show it best are [Material Design](https://m3.material.io/) and Polaris.

It isn't a component library. A component library is only the second of the three pieces. You can have forty well-built components and not have a design system, if there are no consistent tokens behind them and nobody documented when to use each one.

## When it's actually worth it

**When the same visual pattern repeats across three or more screens.** If the same card, with the same structure, shows up in the project listing, the blog and the resources page, that's evidence enough. It's worth turning into a reusable component with clear rules.

**When more than one person will touch the interface.** Without a documented system, every new person makes their own micro-decisions: slightly different spacing, a subtly different shade of grey. Those decisions pile up until the product looks like three different people designed it, because effectively they did.

**When the product is going to grow in screens, not just in users.** A design system pays off its cost on screen number fifteen, not on screen number two. If the project has a real growth roadmap, the system more than repays the initial investment.

## When it's over-engineering

**A single landing page project.** If the entire product is one page, building semantic tokens, component variants and usage documentation is work spent on flexibility that project will never need. Consistent values copied with judgement, without the full machinery, is enough there.

**A validation prototype.** If you don't yet know whether the product survives its first version, a scalable system is betting time on a future that might not arrive. The right discipline there is speed, not reusability.

**When you're the only one who will ever touch the interface.** This is rarer than it sounds, but it exists: an internal, single-person project with no plans to grow into a team. There, a formal system of documented usage rules is overhead with nobody to serve — you already know the rules, they're in your head.

## The most reliable signal I use

I ask myself: **have I already seen this pattern repeat twice, or do I just think it will repeat someday?**

If it's already repeated twice, systematizing it saves real work, because the third repetition is already coming and it should be faster than the previous two. If it hasn't repeated yet and I'm anticipating, I'm usually guessing the wrong shape for the system to have — because a pattern I've never seen used twice hasn't given me enough information about which variants are actually needed.

## The middle ground I use on most projects

You don't always need the full extreme — Storybook, exhaustive documentation, three-layer tokens. On small-to-medium projects, I use a lighter version: tokens defined from the start (that almost never hurts, costs little, saves a lot), a handful of well-built base components, and usage rules living in my head and in code comments, not in a separate document that has to be kept in sync.

I reserve the full system, with formal documentation, for projects where I know someone else will have to understand the rules without being able to ask me directly. That's the case that actually justifies the extra cost.
