---
slug: testing-with-real-customers-before-scaling
title: "Testing with real customers before scaling: GymSmartAccess's pilot runs"
excerpt: "No development environment simulates a real gym, with direct sunlight, unstable wifi, and a receptionist in a hurry. What I adjusted after the pilot tests, and why no prior test would have shown it."
focusKeyphrase: product pilot testing
seoTitle: "Product pilot testing: what a lab test never shows"
seoDescription: "What product pilot testing at real gyms changed in GymSmartAccess, and why controlled testing never finds those problems in the first place."
ogTitle: "The gym's wifi wasn't the same as my apartment's"
ogDescription: "What real-context pilot testing revealed that no controlled test would have shown."
coverAlt: "Access monitor screen installed at a real gym's front desk"
status: published
publishedAt: 2027-04-05
tags: casos, ux-research, producto
---

Before offering [GymSmartAccess](/en/projects/gym-smart-access) as a general product, I ran product pilot testing at real gyms, with real members walking through the real door. That distinction, real versus simulated, generated the most adjustments. None of them would have shown up in a development environment, no matter how careful the testing was there.

## Why a controlled environment isn't enough for this

A usability test in Maze or a demo on my own computer have something in common: they control the variables. Constant light, a stable connection, a user who knows they're being observed and gives the task full attention. A real gym controls none of those three things. And the product has to work anyway, because those are the real conditions of use. It's the same argument behind [field studies](https://www.nngroup.com/articles/field-studies/).

## What product pilot testing changed

**The monitor screen's size and contrast, because of the real lighting on site.** The front-desk monitor I designed to read in two seconds — I documented it in [that article](/en/blog/designing-a-screen-that-reads-in-two-seconds) — looked perfect at my desk, under controlled office light. At a real gym's front desk, with direct sunlight through a window at certain hours, that contrast wasn't enough. I adjusted size and contrast for the worst-case lighting, not for the average.

**QR scan time, because of real congestion at peak hours.** In a controlled test, one person scans their QR without any rush. At a real gym at seven in the evening there's a line, and every extra second gets multiplied by the number of people waiting. That friction was invisible in the individual test. I reduced processing time for that concurrent scenario, which no one-person-at-a-time test could reveal.

**Behaviour under unstable connectivity.** A neighbourhood gym's wifi isn't the same as my office's. I found cases where a payment confirmation took longer than expected over a slower connection than I'd tested with. That made me revisit how the system communicates a "processing" state, instead of leaving the receptionist with no information.

## Why this doesn't contradict prior testing

Controlled usability testing and pilot testing aren't substitutes: they solve different problems. Controlled testing answers whether the basic flow makes sense, whether someone understands what to do and whether the information sits in the right place. Pilot testing answers whether that flow survives the real, messy conditions where it gets used.

Skipping controlled testing and going straight to pilot means spending the most expensive resource, real customers with limited patience, on basic problems. A ten-person test finds those far more cheaply. Doing both, in that order, avoids both mistakes.

## The sign it was worth doing this way

None of the adjustments I made after the pilot showed up as a direct complaint. Nobody wrote "the contrast is bad" or "the scan is slow". I noticed by observing real use: where someone squinted to read the screen, where a longer-than-expected line formed. That kind of finding almost never arrives as explicit feedback. It only arrives if you're watching the real context, not the report someone decides to write afterwards.

## The rule I apply now on any new project

Before calling a product used in a specific physical context "finished", a front desk, a storefront, a factory floor, I insist on watching it work there. Even with just one pilot installation, before assuming desk testing was enough. The real context always finds something the controlled environment can't.

And the pilot should last more than a day. On the first day everyone pays attention, because they know something new is being tried. The problems that matter show up in the second week, once the system is routine and nobody watches it closely.
