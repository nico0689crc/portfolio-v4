---
slug: microcopy-is-a-product-decision
title: "A button's text is a product decision, not a last-minute detail"
excerpt: "\"Submit\" and \"Confirm order\" aren't synonyms, even though they trigger the same function. Microcopy written at the end of a project shows, and it usually costs conversion."
focusKeyphrase: microcopy
seoTitle: "Microcopy in UX/UI: why interface text is a product decision"
seoDescription: "Why the microcopy in buttons, errors and empty states can't be the last thing written in a project, with concrete examples and their real impact."
ogTitle: "\"Something went wrong\" isn't an error message, it's a shrug"
ogDescription: "Why interface text decides as much as visual design, and why it usually gets written last."
coverAlt: "Interface button with multiple tested text variants"
status: published
publishedAt: 2026-11-02
tags: diseno-ui, producto
---

There's a quick test for whether a team treats microcopy as a product decision or as last-minute filler: check who writes the error messages. If the answer is "whoever was coding that screen, five minutes before deploying to production", you already know the result: "Something went wrong. Please try again."

That message doesn't say what went wrong, doesn't say what to do, and takes no responsibility. It's the text equivalent of a shrug.

## Why microcopy is product design, not copywriting

Interface text doesn't describe the interface. It **is** the interface, at the exact moment someone needs to decide something. A button that says "Submit" and one that says "Confirm order" trigger the same function in the code and produce different experiences. One sounds reversible, the other sounds final. In a checkout, that difference changes whether someone hesitates for a second before tapping it. [Nielsen Norman's UX writing guidance](https://www.nngroup.com/articles/ux-writing-study-guide/) has been making that point for years.

And unlike a colour or an animation, text can't be "approximated". A button says exactly one thing. If that thing is poorly chosen, there's no margin of interpretation to save it.

## The three places where it shows the most

**Empty states.** "No results" is information. "You haven't created any projects yet — create your first one to get started" is an invitation. A well-written empty state turns the most depressing moment of an interface — the blank screen — into the first nudge toward using the product.

**Error messages.** A good error message answers two questions: what happened and what do I do now. "That email is already registered" answers the first and leaves the person alone with the second. "That email already has an account — want to log in instead of creating a new one?" answers both and offers the way out.

**Confirmations of an irreversible action.** "Are you sure?" gives nobody new information to decide with. "This will delete the 34 members you've loaded and can't be undone" does. The difference between the two sentences is the difference between a confirmation people click without reading and one that genuinely makes them pause for two seconds.

## Why writing it last costs you

When microcopy is written at the end, it inherits the space the visual design left free, not the space the message needs. A button designed for three words has no room for the sentence that explains the action. The text gets shortened until it loses clarity, not because that was the best version, but because it was the only one that fit.

Writing copy alongside the design avoids that problem. If a message needs more room to be clear, the layout adjusts to the message, not the other way around.

## An example of how this changes a real decision

In the Mexx redesign, one of the findings was that digital products reached checkout with unexplained physical shipping costs attached. Part of the fix wasn't only technical, breaking down the cost earlier. It was textual: the label "Digital product — no shipping" on the product card, before the person even reached the cart.

That label is two words and a hyphen. And it's part of why the cost-transparency task's drop-off rate dropped in the later usability test. The text wasn't decoration on top of the solution. It was part of the solution.

## How I fold it into the process

I write the copy for each screen at the same moment I design the flow, not in a final pass before delivery. For messages that genuinely matter — errors, irreversible confirmations, empty states — I write two or three versions and choose by answering one question: **does this sentence tell the person what happened and what they can do?** If it doesn't answer both, it isn't finished, no matter how polished it looks.

It's the same logic I apply to the rest of the interface: nothing counts as finished until it can be used without guessing. That's why copy lands at the same time as the [error states](/en/blog/designing-for-when-something-goes-wrong), not in a separate pass.
