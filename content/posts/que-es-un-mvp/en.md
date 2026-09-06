---
slug: what-an-mvp-is-and-isnt
title: "What an MVP is and isn't (almost everyone defines it wrong)"
excerpt: "The acronym gets used to justify two opposite things: shipping little and shipping badly. The difference matters, especially if you're the one paying for the build."
focusKeyphrase: what is an MVP
seoTitle: "What an MVP is and isn't: the definition that matters if you're paying for it"
seoDescription: "What Minimum Viable Product actually means, how it differs from a prototype and from a trimmed-down version, and how to tell whether what you're offered is a real MVP."
ogTitle: "\"It's an MVP\" is not an excuse for shipping something broken"
ogDescription: "Minimum and viable are two words, and the second one is usually ignored."
coverAlt: "Comparison between a small working product and an incomplete version"
status: published
publishedAt: 2026-10-12
tags: producto, negocio
---

"Let's do an MVP" is one of those phrases everyone nods at in a meeting and each person understands differently. And when money is involved, that difference in interpretation is what gets argued about over email later.

If you're about to commission a build and you're offered an MVP, this is how to know what you're buying.

## The two words that matter

**Minimum Viable Product.** People argue about the first word and ignore the second.

**Minimum** means it does few things. One, ideally.

**Viable** means that thing **actually works**. That it can be used, that it doesn't lose data, that if it takes money it takes it correctly.

The common mistake is treating "minimum" as permission for it to also be fragile. It isn't. An MVP can do one single thing, but that thing has to be finished. If your MVP processes payments, payments can't fail 10% of the time. You can have no reports, no mobile app, no admin panel — but what's there works.

The usual analogy is a good one: a scooter is an MVP of a car, because it gets you from A to B. Half a car body with no engine isn't an MVP of anything. Both are "minimum". Only one is viable.

## What an MVP is not

**It's not a prototype.** A prototype is looked at, an MVP is used. The Figma prototype I built for [the Mexx redesign](/en/projects/mexx-ux-redesign) navigates and looks real, but it doesn't process a purchase. It's useful to validate whether people understand an interface. It's useless for learning whether anyone pays.

**It's not a demo.** A demo runs on prepared data and a rehearsed path. An MVP has to survive someone doing things in the wrong order.

**It's not "version 1 with fewer features".** This is the most expensive confusion. If you already know the product has a market and what it needs to do, you don't need an MVP: you need to build the first version properly, in stages. Calling it an MVP won't grant you permission to skip quality.

**It's not an excuse.** "It's an MVP" doesn't justify losing data or a main screen that takes eight seconds.

## So what is it for?

To **answer a business question you can't answer yet**, spending as little as possible.

When I built [GymSmartAccess](/en/projects/gym-smart-access), the question was whether the owner of a neighbourhood gym would pay a monthly fee to stop chasing members for payment. Everything that helped answer that went in. Everything else stayed out: advanced reports, multi-location, a native app, workout plans.

But the billing genuinely worked. Because if billing failed, the answer I'd get wouldn't be about my question: it would be about my execution.

That's the subtle part. **A badly executed MVP doesn't answer your question, it contaminates it.** If people don't come back, you'll never know whether it was because the idea was wrong or because the product was broken.

## How to tell if what you're offered is a real MVP

Three questions you can ask in the first meeting:

**What question does this MVP answer?** If the answer is a feature list rather than a business question, it isn't an MVP: it's a quote with a nice name on it.

**What is explicitly left out, and why?** Good scope comes with a list of exclusions. If nobody can tell you that list, scope hasn't been decided and it will grow.

**What happens if the answer is no?** An MVP has to account for the scenario where the idea doesn't work. If the plan only makes sense assuming success, you're not validating: you're building on hope.

## What getting it wrong costs

The two failures are symmetrical and I've seen both.

An MVP that's **too big** burns the budget before you learn anything. You reach the market fourteen months in and discover what you could have discovered in three.

An MVP that's **too fragile** gives you a no that means nothing. The idea might have been good; you'll never know.

The right point is deliberately uncomfortable: very few features, executed seriously.

If you want to see how that cutting gets decided in practice, I wrote it up in [from idea to MVP](/en/blog/from-idea-to-mvp-what-to-build).
