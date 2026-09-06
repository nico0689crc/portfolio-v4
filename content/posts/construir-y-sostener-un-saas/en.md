---
slug: building-and-running-a-saas-in-production
title: "Building and running a SaaS: what changes once customers are paying"
excerpt: "There's a huge difference between building a product and keeping it running on a Tuesday at 3am when a payment webhook fails. What I learned taking GymSmartAccess from idea to a real business."
focusKeyphrase: building a SaaS
seoTitle: "Building a SaaS: what changes with paying customers"
seoDescription: "What changes between building a SaaS and running it in production with real customers: support, technical debt, and the decisions those constraints force."
ogTitle: "Building the product is 30% of the work"
ogDescription: "What changes when a SaaS stops being a project and starts having customers who depend on it working."
coverAlt: "Monitoring dashboard of a SaaS in production with real-time metrics"
status: published
publishedAt: 2026-12-07
tags: casos, negocio, producto
---

Building a SaaS and running it are two different jobs, and almost nobody tells you that before you're stuck doing the second one. Building [GymSmartAccess](/en/projects/gym-smart-access) — my platform for independent gyms, with automated billing and QR-based access control — was maybe 30% of the real work. The other 70% started the day the first gym began paying.

## The day you stop being the only user

While you're developing, you're the most forgiving user there is. You know which button doesn't work, you know to wait if something's slow, you know that error means "restart the server". The day a real gym owner starts using the system, none of that applies. An error you'd shrug off as "oh yeah, I know what that is" becomes a message at 10pm saying nobody can get into the gym.

That shift in perspective was the hardest thing for me to internalize. I wasn't building software. I was building something another business was starting to depend on to open its doors Monday morning.

## What "running it" actually means

**Payment webhooks don't fail quietly, they fail at 2am on a weekend.** When Mercado Pago confirms a payment, the system has to process it, mark the member as current, and do it without losing a single event. A missed webhook isn't an abstract bug — it's a member who paid and the system is telling them no.

I learned to design so a missed webhook can be reconstructed afterwards, by checking the real state in Mercado Pago. It's more upfront work. And it's the difference between a system that self-corrects and one that needs me to notice and fix it by hand.

**Support is part of the product, not a separate cost.** When a gym owner doesn't understand why a member can't get in, they don't care whether the problem is UX, data, or Mercado Pago. They care that someone answers fast and in their language. That direct support taught me more about the product's real problems than any planned research session — every repeated question is a sign that something in the interface doesn't explain itself.

**Technical debt gets charged with interest, not all at once.** A rushed decision in month 2 — a table missing the right index, a validation "I'll add later" — doesn't show up until month 8. By then there's ten times more data, and the problem that used to be invisible turns into a query that takes three seconds.

## Decisions for running a SaaS, not just for building a SaaS

I chose managed infrastructure — [Supabase](https://supabase.com/), Vercel — over my own servers, precisely because I'm a single developer keeping this running. Your own server is cheaper on the monthly bill and more expensive in the hours you spend keeping it alive. That math changes completely when the person who answers at 2am is you and nobody else.

I chose to automate the webhook flows with Make.com instead of writing every integration from scratch. The goal wasn't to prove I could write the code. It was to minimize the surface of things that could break silently while I slept.

I chose a simple front-desk monitor, with clear visual states, over a panel with more data. In production I understood something you can't see in development: the person watching that screen at a gym's front desk has no time to interpret a dashboard. They need to know in two seconds whether the member gets in or not.

## What a case study usually doesn't show

Most case studies end at launch, with a nice screenshot and a list of results. GymSmartAccess's real results aren't only the numbers I show in the portfolio — eliminating delinquency from manual billing, zero hardware cost, full payment automation. They're also the things I had to fix once it was already in production. A query that started slowing down when we went from dozens to hundreds of members. A case where two Mercado Pago webhooks arrived in the wrong order and duplicated a state. A monitor screen that read poorly under direct sunlight at a gym's entrance.

None of those problems showed up in the development environment. All of them showed up with real data and real users, which is the only way they ever show up.

## Why this matters if you're evaluating who to hire

A developer who has only built demos and portfolio projects never had to answer a failed webhook on a Sunday. One who runs their own SaaS in production knows, firsthand, which of today's decisions will cost them dearly six months from now — and designs differently because of it.

It's no guarantee everything will go perfectly. It's the difference between someone who learned this in theory and someone who already paid real money for not thinking about it sooner.

The complete case, with screenshots of the system and the concrete numbers, is in [my portfolio](/en/projects/gym-smart-access).
