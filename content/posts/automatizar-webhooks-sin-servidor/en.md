---
slug: automating-payment-webhooks-without-a-server-of-my-own
title: "Automating payment webhooks without running a server of my own"
excerpt: "Writing every webhook integration myself would have proved I could code them. Automating them with an external tool reduced the surface of things that could break while I sleep, which was the actual goal."
focusKeyphrase: automating payment webhooks
seoTitle: "Automating payment webhooks: why I didn't write my own server"
seoDescription: "Why I chose to automate the Mercado Pago webhook flow with an external tool instead of writing my own server, and what I gained and lost with that decision."
ogTitle: "The goal wasn't proving I could write the code"
ogDescription: "Why I automated payment webhooks with an external tool instead of maintaining a server of my own."
coverAlt: "Flow diagram of a payment webhook passing through a serverless automation"
status: published
publishedAt: 2027-04-19
tags: casos, negocio, nextjs
---

When I built the billing flow for [GymSmartAccess](/en/projects/gym-smart-access), I had two technically valid paths for processing Mercado Pago webhooks: write my own server that receives, validates and processes them, or automate the flow with an external tool. I chose the second one, and the reason wasn't that I didn't know how to do the first.

## Why this decision isn't about technical ability

Writing an endpoint that receives a webhook, validates its signature, and updates a member's status in the database isn't hard. It's exactly the kind of code that proves you can program, and in a different context — a project where I needed to show specific technical depth — I'd have written it by hand without hesitating.

But the goal here wasn't to prove anything. It was minimizing the number of things that could fail silently while I wasn't watching, being the only person keeping the system running. That constraint completely changed which decision was correct.

## The real cost of a server of my own for this

A server of my own that processes webhooks needs: retry handling if Mercado Pago doesn't get a confirmation in time, logging so I can investigate what happened when something fails, alerts so I know if something goes down, and ongoing security updates on the infrastructure running it. None of those four things is the business logic itself — they're all the scaffolding around it that makes the business logic work reliably.

Writing that business logic would have taken me a day. Building and maintaining the scaffolding around it, so it stayed reliable in production without me having to actively monitor it, was the real, recurring work.

## What I gained by automating the flow with Make.com

Retries, logging, and alerts already come solved by the tool, battle-tested in production across far more use cases than mine. My work shrank to defining the specific business flow — what to do with each type of Mercado Pago event — without having to rebuild the reliability infrastructure around it.

This connects directly to what I wrote in [building and running a SaaS](/en/blog/building-and-running-a-saas-in-production): a lost webhook at 2am isn't an abstract bug, it's a member who paid and the system tells them no. Reducing the surface of my own code that could fail on that critical path was a decision directly aligned with that sustainability constraint, not an aesthetic preference for "less code".

## What I lost, without hiding it

Less granular control over exact behaviour in very specific edge cases. If Mercado Pago changes something in their API in a way the automation tool doesn't yet support, I depend on them updating it, instead of being able to patch my own code immediately. And there's a monthly cost for the service that wouldn't exist if everything ran on my own infrastructure.

For this project's size and stage, that trade-off made sense. For a project with much higher volume, where the external tool's cost would grow faster than the maintenance time it saves, the right decision would change — and that's exactly the point: there's no universal answer, there's a correct answer for each project's specific constraints.

## The criteria I use for decisions like this

I ask myself which part of the work actually differentiates my product, and which part is generic infrastructure any similar system needs to solve the same way. I write the first. For the second, I prefer a tool already battle-tested by thousands of other cases, even if that means less of my own code to show. The goal of a real project is never maximizing how much code I wrote — it's that it works reliably with the time I have to keep it running.
