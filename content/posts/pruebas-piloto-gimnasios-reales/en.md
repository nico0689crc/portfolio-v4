---
slug: testing-with-real-customers-before-scaling
title: "Testing with real customers before scaling: GymSmartAccess's pilot runs"
excerpt: "No development environment simulates a real gym, with direct sunlight, unstable wifi, and a receptionist in a hurry. What I adjusted after the pilot tests, and why no prior test would have shown it."
focusKeyphrase: product pilot testing
seoTitle: "Product pilot testing: what you learn that no prior test shows"
seoDescription: "What concrete adjustments came out of GymSmartAccess's pilot tests at real gyms, and why those findings differ from what shows up in controlled testing."
ogTitle: "The gym's wifi wasn't the same as my apartment's"
ogDescription: "What real-context pilot testing revealed that no controlled test would have shown."
coverAlt: "Access monitor screen installed at a real gym's front desk"
status: published
publishedAt: 2027-06-07
tags: casos, ux-research, producto
---

Before offering [GymSmartAccess](/en/projects/gym-smart-access) as a general product, I tested it at real gyms, with real members walking through the real door. That distinction — real versus simulated — ended up generating the most adjustments, and none of them would have shown up in a development environment, no matter how careful the testing was there.

## Why a controlled environment isn't enough for this

A usability test in Maze or a demo on my own computer have something in common: they control the variables. Constant light, a stable connection, a user who knows they're being observed and gives the task their full attention. A real gym controls none of those three things, and the product has to work just as well under those uncontrolled conditions — because those are, precisely, the real conditions of use.

## What I adjusted after seeing the product in context

**The monitor screen's size and contrast, because of the real lighting on site.** The front-desk monitor I designed to read in two seconds — I documented it in [that article](/en/blog/designing-a-screen-that-reads-in-two-seconds) — looked perfect at my desk, under controlled office light. At a real gym's front desk, with direct sunlight coming through a window at certain hours, the contrast that worked in my apartment wasn't enough. I adjusted element size and contrast specifically for that worst-case lighting scenario, not for the average case.

**QR scan time, because of real congestion at peak hours.** In a controlled test, one person scans their QR without any rush. At a real gym at seven in the evening, there's a line of people waiting, and every extra second the scan takes gets multiplied by the number of people in the queue, generating friction that was invisible in the individual test. I reduced processing time specifically for that concurrent-use scenario, which no one-person-at-a-time test could have revealed.

**Behaviour under unstable connectivity.** A neighbourhood gym's wifi isn't the same as my office's. I found cases where a payment confirmation took longer than expected to arrive over a slower connection than I'd tested with, and that made me revisit how the system communicates a "processing" state instead of leaving the receptionist with no information while waiting.

## Why this doesn't contradict prior testing

Controlled usability testing and real-context pilot testing aren't substitutes for each other — they solve different problems. Controlled testing answers whether the basic flow makes sense: whether someone understands what to do, whether the information is in the right place. Pilot testing answers whether that flow, which we already knew made sense, survives the real, messy conditions where it will actually be used.

Skipping controlled testing and going straight to pilot would have meant spending the most expensive resource — real customers, with limited patience — to discover basic problems a ten-person test in a controlled environment would have found more cheaply. Doing both, in that order, is what avoids both mistakes.

## The sign it was worth doing this way

None of the adjustments I made after the pilot showed up directly in early users' complaints — nobody wrote "the contrast is bad" or "the scan is slow". I noticed it by observing real use, seeing where someone squinted to read the screen, or where a longer-than-expected line formed. That kind of finding almost never arrives as explicit feedback. It only arrives if you're watching the real context, not the report someone decides to write afterwards.

## The rule I apply now on any new project

Before calling any product that's used in a specific physical context — a front desk, a storefront, a factory floor — "finished", I insist on watching it work in that real context, even with just one pilot installation, before assuming desk testing was enough. The real context always finds something the controlled environment can't.
