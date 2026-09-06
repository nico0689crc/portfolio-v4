---
slug: typing-the-domain-saves-more-bugs-than-any-test
title: "Properly typing the business domain saves more bugs than any test"
excerpt: "TypeScript is almost always used to catch syntax mistakes. Its biggest value lies elsewhere: making an invalid business state simply impossible to represent in the code."
focusKeyphrase: typing the domain with TypeScript
seoTitle: "TypeScript: typing the business domain instead of only catching typos"
seoDescription: "Why TypeScript's biggest value isn't catching typos but making an invalid business state impossible to represent, with concrete examples."
ogTitle: "The best bug is the one that can't even be written"
ogDescription: "Why typing the business domain with TypeScript prevents more bugs than any test suite."
coverAlt: "TypeScript type diagram modeling valid states of a business domain"
status: published
publishedAt: 2027-08-02
tags: react, nextjs
---

The most common way to explain TypeScript's value is "it catches errors before they reach production" — typically illustrated with a typo in a property name. That's real, but it's the least interesting part of what a good type system can do. The biggest value is modeling the business domain so that an invalid state can't even be written.

## The difference between catching an error and preventing it from existing

A test catches an error after the code already allows writing it — it runs, fails, warns. A well-designed type makes that code simply not compile, which is a stronger guarantee: it doesn't depend on someone having written the right test for that specific case, nor on that test actually running before it reaches production.

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

A test that checks "a pending order shouldn't have a tracking number" only protects that specific case, and only if someone thought to write it. The type protects that case and every future case nobody has anticipated yet, because the constraint lives in the data structure, not in a check that runs afterwards.

This doesn't replace tests — I still need tests to verify behaviour, not just data structure. But it removes an entire category of bugs from the tests' responsibility, because those specific bugs can no longer exist in the code to begin with.

## Where I apply this with the most care

**At the system's boundaries.** Data coming from an external API or a form arrives with no real type, like `any` disguised as `unknown`. There I explicitly validate and transform it into the well-modeled internal type, instead of trusting the external data already arrives in the correct shape.

**In states the business genuinely distinguishes.** Not everything needs a discriminated union — for simple data, a flat type is enough. I reserve this level of modeling for concepts where the business genuinely has rules about which combinations are valid, like an order's state, a payment's, or a post's on this very blog (`draft` vs `published`, where only a published post makes sense with a real publication date).

## The real cost of doing it this way

Modeling the domain at this level of precision takes more time upfront than using a loose string and trusting the team's discipline not to write invalid combinations. That extra time gets paid once, when defining the type. The cost of not doing it gets paid every time someone — myself included, months later — accidentally writes a combination that shouldn't exist, and that recurring cost almost always ends up bigger than the initial investment.
