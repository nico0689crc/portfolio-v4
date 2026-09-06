---
slug: how-i-decide-which-user-feedback-to-prioritize
title: "How I decide which user feedback to prioritize (and which to ignore)"
excerpt: "Not all feedback carries the same weight, and treating it as if it did is the most common way a product ends up cluttered with features that only matter to whoever asked for them."
focusKeyphrase: prioritizing user feedback
seoTitle: "How to prioritize user feedback without a product losing focus"
seoDescription: "The criteria I use to decide which user feedback turns into a feature and which gets discarded, without the decision depending on who asked loudest."
ogTitle: "The loudest feedback isn't the most important"
ogDescription: "The criteria I use to decide which user feedback gets priority and which gets left aside."
coverAlt: "Feedback message inbox with some items marked as priority"
status: published
publishedAt: 2027-05-24
tags: ux-research, producto
---

Every product with real users gets a constant stream of feedback, and the most common temptation is treating every request as if it carried the same weight. It doesn't. Treating it that way is exactly how a focused product turns, within a year, into one trying to be everything to everyone and not being genuinely good at anything.

## The first question: who asked, and why that matters

It isn't elitism. It's that different users represent different risks and opportunities. On [GymSmartAccess](/en/projects/gym-smart-access), feedback from a gym owner who's been paying for eight months carries different weight than feedback from someone trying the free version a week ago — not because one matters less as a person, but because one has shown sustained commitment to the product and the other hasn't yet.

A request from a client that represents a pattern — three different gyms asked for the same thing, without coordinating — carries far more weight than an isolated request, no matter how convincing that isolated request sounds in the moment.

## The second: does this solve the underlying problem, or the symptom someone reported?

When someone asks for a specific feature, they're almost never describing the right solution — they're describing the only solution that occurred to them, with their partial knowledge of the whole system. My job is to understand the problem behind the request, not to literally execute what they asked for.

A gym owner asking for "I want to be able to send a mass message to all members" probably doesn't need a full messaging system — they probably need to announce a schedule change or a holiday, which is a much smaller, more specific problem than the requested solution suggests.

## The third: does this request compete with the product's core purpose, or reinforce it?

Every new feature has to pass the same test I described in [from idea to MVP](/en/blog/from-idea-to-mvp-what-to-build) about the critical path: if this didn't exist, would the product stop solving its main problem? If the answer is no, the request might still be valid, but it falls into a different category — "improves the experience" instead of "essential" — and competes for priority with everything else in that same category.

## What I discard outright, no negotiation

**Requests that only benefit an extremely specific, rare edge case.** Building for the 1% of edge cases at the cost of complicating the experience for the other 99% is an investment that almost never pays off.

**Requests that contradict the reason the product exists.** If GymSmartAccess exists to simplify billing and access, a feature that adds administrative complexity for the gym owner — even if someone asks for it — works against the core purpose, not for it.

**Requests where the person can't explain the underlying problem, only the solution they imagined.** When I ask "and what specifically do you need that for?" and the answer is vague, it usually means the request doesn't come from a real, recurring problem, but from a loose idea of the moment.

## How I communicate that something won't get built

I don't say "no" without explanation — that creates the feeling that the feedback doesn't matter and discourages people from sharing more of it. I explain specifically why that request isn't going in at this stage: whether it's because it doesn't solve the core problem, because it affects very few cases, or because there's a simpler solution for the real problem behind the request. Whoever asked leaves knowing they were heard, even if the answer is no.

## The mistake that's hardest to avoid

Whichever client shouts loudest, or holds the most weight in the business relationship, tends to win by default if there's no explicit criteria. Having the three questions written down — who, and with what pattern; what's the underlying problem; does it reinforce or compete with the core purpose — is what lets me say no to an insistent request without it feeling arbitrary, either to me or to whoever asked.
