---
slug: designing-a-screen-that-reads-in-two-seconds
title: "Designing a screen that reads in two seconds, not ten"
excerpt: "GymSmartAccess's front-desk monitor isn't a dashboard. It's a single answer, in a context where nobody has time to interpret anything. How I designed for that limit instead of against it."
focusKeyphrase: dashboard design
seoTitle: "Designing an at-a-glance interface: the GymSmartAccess monitor"
seoDescription: "How I designed a gym's front-desk monitor to be understood in two seconds without reading text, and why that meant cutting almost everything a normal dashboard would have."
ogTitle: "The best dashboard here was the one that looked least like a dashboard"
ogDescription: "How I designed a screen for a receptionist to understand without reading a single word."
coverAlt: "Monitor screen with one large, clear status indicator and no extra text"
status: published
publishedAt: 2027-02-01
tags: diseno-ui, casos, producto
---

When I designed the front-desk monitor for [GymSmartAccess](/en/projects/gym-smart-access) — the screen that tells a gym's receptionist whether the member who just scanned their QR code is current or not — my first sketch looked like a normal dashboard: member name, expiry date, payment history, profile photo. All the information a management system "should" show, in the abstract.

I threw it out after thinking for ten seconds about who actually looks at that screen.

## The context that changes everything

A gym receptionist, at peak hours, has maybe two or three seconds of real attention for that screen before looking at the next member walking in. They aren't sitting down analyzing data. They're standing, with people queuing, and they need exactly one thing: **do they get in or not?**

Any information that doesn't answer that question directly is noise in that specific context, even if it's perfectly useful information somewhere else. The member's name matters for a later audit case, not for the decision to let them through. Payment history matters to the gym owner at the end of the month, not to the receptionist at noon on a Tuesday.

## What I ended up designing

A single state, filling almost the entire screen: green with a clear icon if the member is current, red with a different icon if not. No long text, no tables, nothing that requires reading more than one word.

I added sound, and that was the change with the biggest impact. The receptionist isn't always looking at the screen at the exact moment of the scan — they might be taking a payment, talking to another member. A different sound for each state — one for "go ahead", another for "there's a problem" — means they don't need to be looking at the screen to know. They just need to be in the room.

## Why this is design, not simplification

Removing information isn't the same as simplifying without judgement. I evaluated every piece of data I removed from that screen against one specific question: "does this help decide whether the member gets in, in the two seconds available to look at it?" If the answer was no, it isn't that the data didn't matter — it's that it didn't matter **there**, on that screen, for that person, at that moment.

That information didn't disappear from the system. It lives in the admin panel, where the gym owner has the time and context to review it. The same database, two completely different interfaces, because the two people using them have completely different needs and completely different amounts of attention available.

## The mistake I almost made

My initial sketch wasn't wrong for being ugly or badly aligned. It was wrong because I designed thinking about what a management system "should show" in the abstract, not about who would actually be standing in front of that specific screen, at that specific moment, with that specific amount of attention available.

It's the same mistake, in a different shape, that I documented in [the Mexx heuristic audit](/en/blog/nielsen-heuristic-audit): designing for the system's internal logic instead of for the real vocabulary and context of whoever uses it.

## The proof it worked

During pilot tests at real gyms, I adjusted element sizes so they'd read from a distance — someone walking in doesn't stand right up against the screen — and reduced QR scan time to prevent queues at peak hours. Neither adjustment was about adding information. Both were about making the one piece of information that mattered read faster and from farther away.

That's the sign the cut was right: when the only thing left to improve was the speed of the essential, not the amount of data.
