---
slug: documenting-decisions-nobody-asked-me-to-document
title: "Why I document technical decisions nobody asked me to document"
excerpt: "A README that explains why something was chosen, not just what was chosen, is the difference between a decision that can be reviewed with judgement a year later and one that gets accepted or rejected blindly."
focusKeyphrase: documenting technical decisions
seoTitle: "Documenting technical decisions, not just the outcome"
seoDescription: "Documenting technical decisions: what context to keep, which discarded options to note, and the condition under which the decision stops making sense."
ogTitle: "A year from now, nobody will remember why we chose this — not even me"
ogDescription: "Why I document the reasoning behind a technical decision, not just the decision itself."
coverAlt: "Architecture document explaining the reasoning behind a technical decision"
status: published
publishedAt: 2027-06-14
tags: casos, producto
---

The code says what got built. It almost never says why it got built that way instead of another. Documenting technical decisions is, above all, keeping the answer to that second question. It is the one that matters most when someone — myself included, months later — has to decide whether an old decision still holds.

## The problem this solves

Without the reasoning written down, every technical decision turns into a black box over time. Someone looks at the code and sees PostgreSQL was chosen over MongoDB. They have no way to know whether that was a deliberate call against specific constraints, or the first thing that occurred to me on a rushed Tuesday. Without that context, the safest option is never to touch it, even after the original constraints have changed.

## What to note when documenting technical decisions

**The context at the time, not just the decision.** Which constraints existed, which alternatives were evaluated, and what information was missing back then. When I chose Mercado Pago for [GymSmartAccess](/en/projects/gym-smart-access) over Stripe, I documented the concrete reason: the target market bills and pays in Argentine pesos. I didn't write "we use Mercado Pago", I wrote why that was the right option in that context.

**What was discarded, and why.** It matters as much as what was chosen. If someone proposes Stripe six months later without knowing it was already evaluated, a whole discussion gets repeated. And the cost isn't the discussion itself: it's arriving at the same conclusion with less information than the first time.

**The condition under which the decision stops making sense.** This is the most valuable part and the least written one. A concrete example: "we chose this assuming low transaction volume; if volume grows tenfold, this needs revisiting". That gives whoever reads it an objective criterion for reopening the conversation, instead of having to guess whether the moment has arrived.

## Where this documentation lives

Not in a separate document nobody opens again. I put it as close as possible to the code it documents: comments in the relevant file, or an architecture decisions file inside the same repository.

The format I follow is the [architecture decision record](https://adr.github.io/): one short page per decision, with context, options and consequences. That way whoever reads the code has the why one click away, not in an external wiki that goes stale without anyone noticing.

## The cost of not doing it

When someone comes back to an old decision without the context, there are two paths and both are bad. One is redoing the decision from scratch, losing the analysis that was already done. The other is leaving it untouched out of fear of breaking something not fully understood, even after the conditions that justified it have changed completely.

Both cost the same thing: the time of someone who no longer has the information that existed when the decision was made.

## Why this isn't bureaucracy

The obvious objection is that it adds work to every decision, and that's true. But it's work paid once, while the context is still fresh in the mind of whoever decided. The alternative is paying it many times over, every time someone reconstructs that context from scratch.

It's the same logic I apply to [writing a case study for a non-technical reader](/en/blog/how-i-write-a-case-study-anyone-without-a-design-background-can-follow): explaining the why well once saves explaining it badly ten times.

## The rule I apply

I document any decision that would take more than ten minutes to explain from memory six months from now. If it's obvious and admits no reasonable alternative, it doesn't need explaining.

If someone could reasonably ask "why didn't we do it the other way?", that question deserves a written answer. Preferably before someone has to ask it out loud, with no context, months later.

The same criterion applied to scope instead of architecture is in [from idea to MVP](/en/blog/from-idea-to-mvp-what-to-build).
