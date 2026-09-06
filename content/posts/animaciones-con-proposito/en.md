---
slug: purposeful-animation-not-decoration
title: "Purposeful animation: when a transition improves UX and when it just distracts"
excerpt: "An animation that communicates nothing is expensive decoration: it costs performance and attention, and gives the user nothing back in return. The criteria I use before adding any motion to an interface."
focusKeyphrase: interface animation
seoTitle: "Interface animation: when to use it, when not to"
seoDescription: "The criteria for deciding whether an interface animation improves the experience or just distracts, with six real examples from a redesign case."
ogTitle: "If you can't explain what an animation communicates, it's decoration"
ogDescription: "The criteria I use to decide when a transition helps and when it just distracts, with real examples."
coverAlt: "Interface element mid-transition showing a clear state change"
status: published
publishedAt: 2027-03-29
tags: diseno-ui, react
---

There's a question I ask myself before adding any interface animation. It rules out most of the ones that occur to me: **what information does this movement communicate that wouldn't be communicated without it?** If the answer is "nothing, it just looks nice", I don't add it. Looking nice isn't a reason. It's a side effect good animations happen to have, not their purpose.

## The three things an interface animation can genuinely communicate

**Spatial relationship.** If a modal appears with a transition originating from the button that opened it, that animation tells the user where that content came from. It also shows how to get back: that's navigation information, not decoration. Without that motion, the modal appears from nowhere and the user has to mentally reconstruct that relationship.

**State change.** A button that transforms into a loading spinner, and the spinner that transforms into a confirmation checkmark, communicates real progress. The user knows something is happening and knows when it's done, without having to guess whether their click worked.

**Attention hierarchy.** An animation can direct the eye toward what changed: a value that updates, a new item in a list. That way, the user doesn't have to scan the whole screen looking for what's different.

If an animation does none of the three, it's decoration. Decoration isn't automatically bad, but it competes for the same attention and performance budget as animations that actually communicate something. It almost never wins that comparison when looked at honestly.

## The six I documented in the Mexx redesign

I documented six animations when redesigning [Mexx](/en/projects/mexx-ux-redesign). Each one has a reason to exist that isn't "it looks elegant".

The **hero slider** communicates that there's more navigable content than what's visible at first glance. The **auth modal** uses a scale transition originating from the button that triggered it, to preserve the spatial relationship. The **cost breakdown** expands instead of appearing all at once, because it reveals new information progressively. The user sees that more detail is available, not that the screen changed without warning. The **save indicator** is directly a state change —saving, saved— that confirms to the user their action took effect. **Loading states** communicate progress where there used to be a frozen screen with no information. **Checkout transitions** keep the user oriented as they move through a multi-step process, showing where each step comes from and where it's going.

None of the six is there by a motion library's default. Each solves a specific communication problem that existed without it.

## When an animation actively hurts the experience

**When it delays a frequent action.** A 400-millisecond transition on something the user does twenty times per session turns into accumulated friction, even though each individual instance feels "elegant".

**When it ignores reduced-motion preference.** Someone who configured their system to reduce animations — for motion sickness, vestibular sensitivity, or simply preference — has to receive an interface without those transitions. Ignoring [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) isn't a minor technical detail. It's failing to respect a genuine accessibility need.

**When it competes with reading the content.** An element that keeps moving while the user tries to read the text it contains is an animation that actively worsens that screen's main task.

## The criteria, summed up

Before writing any animation, I complete the sentence: "this animation tells the user that...". If I can't finish it with real information, the animation doesn't go in. If I finish it with something real — "...that this came from there", "...that their action is being processed", "...that this changed" — the animation stays, and only then do I worry about it also looking good.
