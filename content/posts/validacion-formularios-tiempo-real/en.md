---
slug: real-time-validation-can-be-worse-than-validating-on-submit
title: "Why real-time form validation can be worse than validating on submit"
excerpt: "Flagging a field as wrong while the person is still typing feels modern and is usually hostile. The moment validation happens matters as much as the validation itself."
focusKeyphrase: form validation
seoTitle: "Form validation: when real-time helps and when it annoys"
seoDescription: "Why validating a field while the user is still typing can generate more frustration than validating on submit, with the criteria for when each approach is correct."
ogTitle: "A field marked red while you're still typing isn't help, it's harassment"
ogDescription: "The criteria for deciding when to validate a form in real time and when to wait for submission."
coverAlt: "Form field showing validation at the right moment, not too early"
status: published
publishedAt: 2027-07-26
tags: diseno-ui, react
---

Real-time form validation became an almost automatic default — every modern framework makes it easy to implement, and it feels "more modern" than waiting for submission. The problem is that most implementations validate at the wrong moment, and that turns a feature meant to help into one that actively frustrates.

## The most common mistake: flagging the error before it exists

An email field that turns red the moment the person types the first letter — because technically "a" isn't a valid email — is mathematically correct and experientially hostile. The person is still in the process of typing. Marking it as an error at that moment isn't informing, it's interrupting an action that hasn't finished yet.

## The criteria that separates useful validation from annoying validation

**Validate against an error that already happened, not against an incomplete state.** The difference between "this is wrong" and "this isn't finished yet" is what most implementations ignore. A password field requiring eight characters shouldn't turn red at character number three — it hasn't finished being typed, it isn't an error, it's a process in progress.

**The right moment is usually when the person leaves the field (blur), not while typing.** Validating on blur gives the person time to finish their thought before receiving feedback, and that feedback arrives while the context is still fresh — they didn't have to move to another field to discover the previous one was wrong.

**Once a field has already shown an error, that's when real-time validation while correcting makes sense.** This is deliberately asymmetric: I don't interrupt while the person types for the first time, but I do confirm immediately once they're correcting an error I already flagged, so they know right away whether their fix worked, without having to attempt the full submission again.

## A concrete example: this site's contact form

The message field has a minimum and maximum character count. It doesn't get marked as an error while the person is still typing below the minimum — that would literally be telling them "you're wrong" for the simple fact of not having finished yet. It validates on submit attempt, and from there, if they correct the text, real-time validation immediately confirms it now meets the requirement, without them having to press submit again to find out.

## Why this is the same as designing [error states](/en/blog/designing-for-when-something-goes-wrong) with judgement

Form validation is a specific case of the general problem of designing for when something isn't right: the moment and place where information appears matter as much as the information itself. A technically correct error, shown at the wrong moment, generates the same frustration as a badly written error shown at the right moment — the problem isn't only what's said, it's when.

## The limit of this rule

There are cases where immediate validation does make sense, even while typing: a character counter approaching its limit, or a password strength indicator shown as a visual gauge with no "correct/incorrect" judgement. The difference is that those cases inform without accusing — they show progress, not failure — and that distinction, more than the exact timing, is what decides whether real-time validation helps or annoys.
