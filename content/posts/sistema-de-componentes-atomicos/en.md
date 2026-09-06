---
slug: atomic-components-that-actually-get-reused
title: "Atomic components that actually get reused (not just in theory)"
excerpt: "Atomic design is easy to explain and often applied badly: components that are technically atomic but that nobody reuses because they were born coupled to a single screen."
focusKeyphrase: atomic components
seoTitle: "Atomic components that actually get reused"
seoDescription: "Why so many 'atomic' component systems don't get reused in practice, and the criteria I use to design components that survive past the second screen."
ogTitle: "A reusable component doesn't know which screen it's on"
ogDescription: "The real criteria behind atomic design, beyond the atoms-and-molecules naming."
coverAlt: "Interface components arranged from small pieces up to full screens"
status: published
publishedAt: 2026-11-23
tags: design-systems, react, diseno-ui
---

[Atomic design](https://bradfrost.com/blog/post/atomic-web-design/) has a marketing problem. The atoms-molecules-organisms metaphor is so catchy that people memorize the names and forget the question it exists to answer. Without that question you end up with a folder of atomic components that fits the naming and that nobody reuses.

## What makes atomic components actually reusable

**Does this component know which screen it's on?**

If the answer is yes, it isn't reusable, no matter how small it is or which folder you saved it in. A button with `if (page === 'checkout') { ... }` inside isn't an atom. It's a checkout-screen component you decided to move to a different folder.

The real test for an atomic component is: **could this be used on a screen that doesn't exist yet, without anyone having to touch it?** If the answer is no, the component is coupled to something, even if the coupling isn't obvious at a glance.

## Where the coupling leaks in, in practice

**Hardcoded text instead of props.** A `Badge` component that says `<span>Available</span>` instead of receiving the text as a prop is tied to a single use case. The day you need the same badge to say "Sold out", you end up copying the whole component instead of reusing it, because copying is faster than refactoring under delivery pressure.

**Styles that assume their container.** A component with a fixed `margin-top: 40px` assumes it will always sit below something specific. Margin is the parent's responsibility — the parent knows what's around it, the component itself shouldn't know whether there's anything above it. This is exactly what I described in [from Figma to production](/en/blog/from-figma-to-production-without-losing-anything) about designing with consistent spacing via [tokens](/en/blog/design-tokens-figma-to-tailwind): external spacing lives with whoever uses the component, not inside it.

**Business logic inside a visual component.** A `PriceTag` component that calculates the discount inside itself stops being a presentation component and becomes a business rule disguised as UI. The day the discount rule changes, you have to touch a file that was only supposed to draw a number.

## The criteria I use to know if something is a real atom

A component passes the test if it meets three conditions:

**It receives everything through props, assumes nothing from context.** Not the text, not the state, not the colour comes hardcoded — everything enters from outside.

**It has no margin or position of its own.** External spacing is the caller's responsibility. The component only controls its internal spacing.

**It knows no business rules.** If it has to decide anything more complex than "how do I look with this data", that decision isn't its to make.

With those three conditions, a button, a badge or a card can move to any future screen without anyone having to open the file and "adapt it first". Without them, every new component inherits the previous one's coupling, and the design system turns into a collection of components that are technically in the right folder but that nobody reuses in practice — every new screen ends up writing its own, because adapting the existing one costs more than copying it.

## When NOT to atomize

There's a limit to this, and it's worth saying because the opposite extreme also fails.

Not everything needs to be a reusable atom. A specific section of a landing page, that exists exactly once on the whole site, gains nothing from being designed as if it were going to be reused in five places. Atomizing something that will never repeat is work invested in flexibility nobody will use, and that work carries the same opportunity cost as any other.

The signal to atomize is that **you've already seen the pattern repeat twice**, not that it might repeat someday. Building the abstraction before you have the second real case almost always guesses the wrong shape for the component to have.

## The result, when it works

On this very portfolio, the `Reveal` component that wraps almost every scroll animation doesn't know whether it's in the hero, in a blog card, or in an FAQ question. It receives the animation as a prop, receives the content as children, and cares about nothing else. That's why it's used in more than ten different places without any of them needing to touch the component itself.

That's the proof a component is genuinely atomic: not that it lives in an `atoms/` folder, but that nobody ever needed to open it to use it somewhere new.
