---
slug: nielsen-heuristic-audit
title: "How I audit an interface with Nielsen's 10 heuristics"
excerpt: "A heuristic audit is the cheapest way to find real problems before touching a single pixel. Here's how I run one, and what it surfaced on an e-commerce platform with 34 years in the market."
focusKeyphrase: heuristic audit
seoTitle: "Heuristic audit: how to evaluate an interface"
seoDescription: "How to run a heuristic audit step by step with Nielsen's 10 principles, with a real case where 7 out of 10 heuristics were failing."
ogTitle: "7 out of 10 usability heuristics were failing. Nobody had noticed"
ogDescription: "How to run a heuristic audit that finds real problems instead of design opinions."
coverAlt: "Usability heuristics checklist over an interface"
status: published
publishedAt: 2026-09-14
tags: ux-research, casos
---

A heuristic audit has a bad reputation because it sounds bureaucratic: a checklist, a report, nobody reads it. But it's the tool with the best ratio between what it costs and what it finds. You don't need users, you don't need budget and you don't need permission. You need an afternoon and a method.

It's also the only way I know to turn "this interface is bad" into a list people can discuss without fighting.

## What it actually is

Walking the interface and evaluating it against the [10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) Jakob Nielsen published in 1994, which aged surprisingly well. It isn't an opinion about whether something looks nice. It's a check against criteria that existed before you joined the project.

All ten, one line each:

1. **Visibility of system status.** Does the system tell me what's going on?
2. **Match with the real world.** Does it speak my language or the database's?
3. **User control and freedom.** Can I undo, exit, go back?
4. **Consistency and standards.** Is the same thing named and drawn the same everywhere?
5. **Error prevention.** Does it stop the error or just report it afterwards?
6. **Recognition over recall.** Do I have to remember something from the previous screen?
7. **Flexibility and efficiency.** Are there shortcuts for people who already know?
8. **Aesthetic and minimalist design.** Does everything on screen earn its place?
9. **Help users recognize and recover from errors.** Does the message say what to do?
10. **Help and documentation.** Can I find out how something is done?

## How I run one

**I pick flows, not screens.** Auditing "the site" never ends. Auditing "buying a digital product from a phone" has a beginning and an end. I take two or three critical flows — the ones that make money or generate support tickets — and walk them end to end.

**I record my screen while doing it.** That's the step that changed my results the most. When you review the recording afterwards, you see the hesitations you already forgot: where you stopped, where you went back, where you read something twice. That hesitation is the finding.

**I document every violation with three things:** a screenshot, which heuristic it breaks, and what happens to the user. That third one is what makes the report readable. "Violates heuristic 1" moves nobody. "The user doesn't know whether the payment went through and clicks again" moves priorities.

**I score severity.** I use Nielsen's own 0-to-4 scale. Without severity, a report with 40 findings is a list of complaints. With severity, it's a work plan.

## What I found at Mexx

I applied this to the Mexx platform, Argentina's largest tech retailer. **7 of the 10 heuristics were failing.** Two examples that show why this isn't an academic exercise:

**Match with the real world.** The category was called "Software". People searched for "licenses", "Windows", "Office". The name came from the internal catalogue, not from the vocabulary of the person buying. A later tree test confirmed it with a number: **40% directness**, meaning 6 out of 10 people never got there.

**Error prevention.** A digital Windows license added over $250 in physical shipping. A product you download, with freight attached. The error wasn't the user's: the system let them walk into a dead end and only told them at the last step, on the Mercado Pago screen.

Neither finding had anything to do with how the interface looked. Both were costing sales.

## What a heuristic audit cannot do

Here's the limit, and saying it matters more than selling the technique.

A heuristic audit tells you **what is probably wrong**. It does not tell you **how often it happens** or **to how many people**. It's you evaluating, with your judgement and your biases, not ten people using the product.

That's why I never use it alone. I use it as a first filter: it reduces an enormous surface to a short list of hypotheses, and only then do I spend the expensive resource — real users — confirming the ones that matter. At Mexx, the audit flagged hidden costs as suspicious; the survey confirmed it when **100%** of respondents named them as a reason to abandon.

The audit finds. The test confirms. Skipping the second step is diagnosing over the phone.

## Where to start tomorrow

If you've never run one, don't start with the whole site. Pick **one flow**, record your screen as you walk it like a first-time user, and note every time you hesitate. Then map those hesitations against the ten heuristics.

Almost always, half of your hesitations land on heuristic 2 — the system speaking its own language instead of yours — and that is, in my experience, the cheapest class of problem to fix and the one people notice fastest.

This is one of the five steps in [my complete design process](/en/blog/how-i-design-an-interface-from-scratch), and the full Mexx case, with the navigable prototype, is in [my portfolio](/en/projects/mexx-ux-redesign).
