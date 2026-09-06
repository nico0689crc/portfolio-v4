---
slug: saas-decisions-that-have-nothing-to-do-with-code
title: "The decisions behind a SaaS that have nothing to do with code"
excerpt: "The framework you pick matters less than you think. The decisions that actually determine whether a product survives happen earlier, and they're business decisions, not architecture ones."
focusKeyphrase: product decisions
seoTitle: "Product decisions that define a SaaS before any code"
seoDescription: "The product decisions that defined GymSmartAccess before any framework was chosen: who not to sell to, how to charge, and what to automate first."
ogTitle: "I chose who not to sell to before I chose the framework"
ogDescription: "The decisions that determine whether a SaaS works, and none of them are about code."
coverAlt: "Diagram of business decisions preceding a product's technical architecture"
status: published
publishedAt: 2026-09-28
tags: producto, negocio, casos
---

When someone asks me about [GymSmartAccess](/en/projects/gym-smart-access), the first question is almost always technical: why Next.js, why Supabase, how it handles payment webhooks. Those are legitimate questions and I'm happy to answer them. But none of those decisions were the ones that determined whether the product would work.

The ones that mattered happened earlier, and they're uncomfortable to discuss because there's no objectively "correct" answer. They're business bets.

## Decision 1: who not to sell to

The most important one of all, and the one almost nobody makes on purpose.

GymSmartAccess handles billing and access control for independent gyms in Argentina. I explicitly decided **not** to target large chains with multiple locations, even though they'd pay more per subscription.

The reason isn't modesty. It's that a large chain already has a system — a bad one, probably, but installed — and replacing it is a committee decision that takes months and goes through a bidding process. An independent gym is decided by the owner, in one conversation, the same week. The sales cycle is ten times shorter, and for a product that needs to validate the idea fast, that's worth more than a higher average ticket.

Saying no to the big client is the most profitable product decision I made, and I made it without writing a single line of code.

## Decision 2: how to charge, before how to charge technically

Mercado Pago was the technical decision. The product decision was **who pays and when**.

I chose to have the gym charge its own members directly — not to have the gym pay me a fixed monthly license — so that the product's cost scales alongside the client's business. A gym with 40 members and one with 400 pay proportionally to what each one bills, not a fixed amount that weighs differently on each.

That decision determined the billing architecture long before the billing architecture existed. I chose the business model and the code came to serve it, not the other way around.

## Decision 3: what to automate first

With limited budget and time, I didn't automate a gym member's entire lifecycle. I automated **one single friction point**: manual cash collection, which is what made gym owners "chase" their members every month.

I could have started with workout plans, or a class-booking system, which are flashier features to show in a demo. I chose billing because it directly affects the client's revenue, and a client who sees their delinquency drop to zero in the first month doesn't need me to explain the product's value. They see it in their bank account.

Automating what looks best in a demo and automating what first convinces someone to pay are almost always two different things. It is what Clayton Christensen called [the job the customer hires the product to do](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done): here the job was billing, not training. Choosing the second one is a product decision, not an engineering one.

## Decision 4: the hardware I decided not to sell

Traditional biometric access systems cost real dollars and need physical installation. I decided access control would be a dynamic QR code on the member's phone, read by a cheap camera, with no proprietary hardware.

This wasn't a technical limitation dressed up as a choice. It was the reverse: I first decided that the entry cost for the gym had to be zero in hardware, because that's the real barrier that keeps a neighbourhood gym owner from even considering modernizing. Only then did I look for the technical solution that met that constraint.

Had I picked the technology first — "let's do biometric access control, that's what the big gyms do" — I'd have built a product my actual client can't afford.

## Which product decisions to discuss before you hire

If you're evaluating building something custom, the most valuable conversation you can have with whoever is going to build it isn't about the stack. It's about these four questions: who you don't sell to, who pays and when, what you automate first, and what business constraint the technical solution has to satisfy before you pick the technical solution.

A developer who only asks about features will build what you ask for. One who asks about these four things first will help you build what you actually need, which isn't always the same thing.

The scope-cutting that underlies all of this is in [from idea to MVP](/en/blog/from-idea-to-mvp-what-to-build), and the full GymSmartAccess case is in [my portfolio](/en/projects/gym-smart-access).
