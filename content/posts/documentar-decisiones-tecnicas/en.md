---
slug: documenting-decisions-nobody-asked-me-to-document
title: "Why I document technical decisions nobody asked me to document"
excerpt: "A README that explains why something was chosen, not just what was chosen, is the difference between a decision that can be reviewed with judgement a year later and one that gets accepted or rejected blindly."
focusKeyphrase: documenting technical decisions
seoTitle: "Why documenting the why of a technical decision, not just the what"
seoDescription: "What I document for every architecture decision I make, beyond the code, and why that documentation pays for itself months later."
ogTitle: "A year from now, nobody will remember why we chose this — not even me"
ogDescription: "Why I document the reasoning behind a technical decision, not just the decision itself."
coverAlt: "Architecture document explaining the reasoning behind a technical decision"
status: published
publishedAt: 2027-08-16
tags: casos, producto
---

The code says what got built. It almost never says why it got built that way instead of another, and that second question is the one that matters most when someone — myself included, months later — needs to decide whether an old decision still makes sense or doesn't anymore.

## The problem this solves

Without documenting the reasoning, every technical decision turns into a black box over time. Someone looks at the code, sees PostgreSQL was chosen over MongoDB, and has no way to know whether that choice was a deliberate call against specific constraints, or just the first thing that occurred to me on a rushed Tuesday. Without that context, the safest option is never touching it, even though the constraints that motivated the original decision may have already changed.

## What I document, specifically

**The context at the time of deciding, not just the decision.** What constraints existed, what alternatives were evaluated, and what information was missing at that moment that might be available today. When I chose Mercado Pago for GymSmartAccess over Stripe, I documented that the reason was the target market billing and paying in Argentine pesos — not just "we use Mercado Pago", but why that was the right option given the specific context.

**What got discarded, and why.** It's as important as what got chosen. If someone proposes Stripe six months later without knowing it was already evaluated and discarded for a specific reason, a discussion that already happened gets repeated, wasting time arriving at the same conclusion again.

**Under what condition this decision would stop making sense.** This is what carries the most value and gets documented the least. "We chose this assuming low transaction volume; if volume grows tenfold, this decision needs revisiting" gives whoever reads the document later an objective criterion for knowing when to reopen the conversation, instead of having to guess whether the moment to reconsider has already arrived.

## Where this documentation lives

Not in a separate document nobody reopens. I put it as close as possible to the code it documents — comments in the relevant file, or an architecture decisions file inside the same repository — so whoever is reading the code has the context a click away, not in an external wiki that goes stale without anyone noticing.

## The cost of not doing it, with a real example

Without this documentation, when someone — or I myself — comes back to an old decision without remembering the context, there are two paths, and both are bad: redoing the decision from scratch, losing the analysis work already done, or leaving it untouched out of fear of breaking something not fully understood, even though the conditions that justified it have completely changed.

## Why this isn't bureaucracy

The obvious objection is that this adds work to every decision, and it does. But it's work paid once, at the moment the context is still fresh in the mind of whoever decided, instead of being paid many times over — every time someone needs to reconstruct that context from scratch, without the information that existed at the original moment.

## The rule I apply

I document any decision that would take more than ten minutes to explain from memory six months from now. If the decision is obvious and admits no reasonable alternative, it doesn't need explaining. If someone could reasonably ask "why didn't we do it the other way?", that question deserves a written answer before someone has to ask it out loud, with no context, months later.
