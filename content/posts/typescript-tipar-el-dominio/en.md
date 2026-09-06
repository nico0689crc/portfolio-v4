---
slug: typing-the-domain-saves-more-bugs-than-any-test
title: "Properly typing the business domain saves more bugs than any test"
excerpt: "TypeScript is almost always used to catch syntax mistakes. Its biggest value lies elsewhere: making an invalid business state simply impossible to represent in the code."
focusKeyphrase: typing the domain in TypeScript
seoTitle: "Typing the domain in TypeScript, not just the typos"
seoDescription: "Typing the domain in TypeScript makes an invalid business state impossible to write, and that prevents more bugs than any test suite does."
ogTitle: "The best bug is the one that can't even be written"
ogDescription: "Why typing the business domain with TypeScript prevents more bugs than any test suite."
coverAlt: "TypeScript type diagram modeling valid states of a business domain"
status: published
publishedAt: 2027-05-31
tags: react, nextjs
---

The most common way to explain TypeScript's value is that it catches errors before production, illustrated with a typo in a property name. That's real, and it's the least interesting part. Typing the domain in TypeScript aims at something else: modeling the business so an invalid state can't even be written.

## Typing the domain in TypeScript prevents, it does not catch

A test catches an error after the code already allows writing it: it runs, fails, warns. A well-designed type makes that code not compile. That's a stronger guarantee, because it doesn't depend on someone having written the right test, nor on that test running in time. [Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) are the main tool for it.

## A concrete example: an order's state

The naive way to model an order's state is with a loose string and boolean:

```typescript
interface Order {
  status: string; // "pending" | "paid" | "shipped" | "cancelled"
  trackingNumber?: string;
}
```

This type allows writing states that make no business sense: an order with `status: "pending"` that still has a `trackingNumber` set, or a `status: "shpiped"` typo that TypeScript can't catch because it's a free string.

## How I model it instead

```typescript
type Order =
  | { status: "pending" }
  | { status: "paid" }
  | { status: "shipped"; trackingNumber: string }
  | { status: "cancelled"; reason: string };
```

With this discriminated union, an order in `"shipped"` status **has to** have a `trackingNumber` — the type doesn't compile if it's missing. And an order in `"pending"` can't have a `trackingNumber`, because that field doesn't exist in that variant of the type. The invalid state — a pending order with a tracking number — stopped being something you have to remember to avoid through discipline, and became something the compiler rejects outright.

## Why this saves more bugs than tests

A test that checks "a pending order shouldn't have a tracking number" only protects that case, and only if someone thought to write it. The type protects that case and every one nobody has anticipated yet. The constraint lives in the data structure, not in a check that runs afterwards.

This doesn't replace tests: I still need them to verify behaviour. But it removes an entire category of bugs from their responsibility, because those bugs can no longer exist in the code.

## Where I apply this with the most care

**At the system's boundaries.** Data from an external API or a form arrives with no real type. There I explicitly validate and transform it into the internal type, instead of trusting that the external data arrives in the right shape. It is the same criteria I apply to [form validation](/en/blog/real-time-validation-can-be-worse-than-validating-on-submit).

**In states the business genuinely distinguishes.** Not everything needs a discriminated union: for simple data, a flat type is enough. I reserve this modeling for concepts where the business has rules about which combinations are valid. An order's state, a payment's, or a post's on this blog: `draft` against `published`, where only a published post makes sense with a real date.

## The real cost of doing it this way

Modeling the domain at this precision takes more time upfront than using a loose string and trusting the team's discipline. That extra time gets paid once, when defining the type. The cost of not doing it gets paid every time someone, myself included months later, writes a combination that shouldn't exist. That recurring cost almost always beats the initial investment.

## The sign a type is badly modeled

There's a tell that shows up fast: if the code has to ask "but can this be null here?" every time a value gets used, the type isn't describing the domain. It's describing the shape of the JSON that arrived.

A well-modeled type doesn't need comments explaining which combinations are valid. If that has to be written down, it's because the type allows representing something that shouldn't exist.
