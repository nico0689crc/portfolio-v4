---
slug: from-idea-to-mvp-what-to-build
title: "From idea to MVP: how I decide what to build and what to leave out"
excerpt: "The hard part of an MVP isn't building it, it's cutting it. The method I use to decide what goes into the first version, with the real decisions behind the SaaS I run in production."
focusKeyphrase: how to define an MVP
seoTitle: "How to define an MVP: what to build and what to leave out"
seoDescription: "How to define an MVP with judgement: one business question, the critical path test, and a written list of what is deliberately left out."
ogTitle: "An MVP is not your product with fewer things"
ogDescription: "How to decide what goes into the first version, with real decisions from a SaaS in production."
coverAlt: "Product scope diagram showing features inside and outside the first version"
status: published
publishedAt: 2026-09-21
tags: producto, negocio
---

Every project I've seen fail on scope failed the same way: nobody said no in time. Knowing how to define an MVP is, above all, knowing how to cut it. It wasn't one big bad decision, it was thirty small ones, each reasonable on its own, that turned a three-month first version into a fourteen-month one.

The hard part of an MVP isn't building it. It's cutting it. And cutting is an uncomfortable skill, because everything you remove has someone who wants it.

This is the method I use. I applied it building [GymSmartAccess](/en/projects/gym-smart-access), my platform for gyms, which is in production with paying customers. The decisions here had real consequences, not exercise ones.

## How to define an MVP: first, it is not your product with fewer things

The most expensive confusion in product vocabulary is treating the MVP as a trimmed-down version of the final product. It isn't.

An MVP is **an experiment shaped like software**, in the original sense [Eric Ries](http://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html) gave it. It exists to answer a question you can't answer yet, as cheaply as possible. If you already know the answer, you don't need an MVP: you need to build the first version properly.

The difference is practical. If it's a trimmed version, the question is "what do I remove?", and that has no criteria — everything looks necessary. If it's an experiment, the question is "what do I need to answer this?", and suddenly half the list falls away on its own.

## Second: write the question, just one

Before listing features, I write in one line what I want to find out.

For GymSmartAccess the question was: **will the owner of a neighbourhood gym pay a monthly fee to stop chasing members for payment?**

Notice what that question doesn't include. It doesn't ask whether the system can handle 500 locations. It doesn't ask whether the app is beautiful. It doesn't ask about reports. It asks one business thing, and the answer is yes or no.

Any feature that doesn't help answer it is a candidate to be left out. Not "bad idea": out **of this version**.

## Third: the critical path test

With the question written, I draw the shortest path between a user who doesn't know the product and the moment the question gets answered.

For GymSmartAccess that path was: the owner loads their members → the member gets a payment link → they pay → the system marks them current → the member enters the gym showing a QR → the front-desk monitor says whether they're up to date.

That's the product. Everything else is luggage.

Every feature someone proposes goes through a single question: **if this doesn't exist, does the path break?** If the path still works without it, it doesn't go in. No matter how often it's requested or how cheap it looks.

Cheap is exactly the trap: nobody adds fourteen months at once, they add it in batches of "this is two days".

## Fourth: the written list of what's left out

This step looks like bureaucracy and it's the one that saves the most arguments.

I explicitly write down what I'm leaving out and why. For GymSmartAccess that list included: a native app (a PWA is enough to show a QR), advanced reports (nobody pays for charts before trusting the billing), multi-location (my question was about single-location gyms), workout plans (another product disguised as a feature) and biometric access control (the dollar cost of that hardware is precisely the problem I'm solving).

Writing it does two things. It shows whoever asked that their idea was considered rather than ignored, which is half the argument. And it stops the same idea from coming back in three months presented as new.

## Fifth: pick the stack afterwards, not before

This gets done backwards almost always, and I did it backwards for years.

Technology is a consequence of constraints, not a starting point. In GymSmartAccess the constraints were: recurring payments in Argentina (which means Mercado Pago, there's no option), zero hardware cost for the gym (which means a QR on the member's phone, not biometrics), and one developer maintaining it (which means managed infrastructure, not servers to look after).

The stack came out of that. Had I picked the stack first, I'd have hit the constraints when changing was already expensive.

## The mistake I made anyway

So as not to sell this as a foolproof method: I overshot scope anyway.

I built the real-time front-desk monitor — the screen that tells the receptionist whether a member is current — with more polish than answering the question required. Animations, audio states, legible from a distance. None of that was necessary to learn whether anyone would pay.

I did it because it was the fun part. That's the real bias and no method removes it: you cut other people's features better than your own.

What I can say is that the polish came after the critical path worked end to end. Order matters even when discipline fails.

## The summary

One business question written in a single line. One critical path drawn end to end. One rule: if the path doesn't break, it doesn't go in. And a written list of what's left out, so the arguments happen once.

If you're about to start a custom project and want scope decided this way, [get in touch](/en/contact): the first conversation is always about the question, not the feature list.
