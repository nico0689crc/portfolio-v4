---
slug: real-time-validation-can-be-worse-than-validating-on-submit
title: "Why real-time form validation can be worse than validating on submit"
excerpt: "Flagging a field as wrong while the person is still typing feels modern and is usually hostile. The moment validation happens matters as much as the validation itself."
focusKeyphrase: form validation
seoTitle: "Form validation: when real-time helps and when it annoys"
seoDescription: "Why real-time form validation frustrates more than validating on submit, and the criteria for knowing when each approach is the right one."
ogTitle: "A field marked red while you're still typing isn't help, it's harassment"
ogDescription: "The criteria for deciding when to validate a form in real time and when to wait for submission."
coverAlt: "Form field showing validation at the right moment, not too early"
status: published
publishedAt: 2027-05-24
tags: diseno-ui, react
---

Real-time form validation became an automatic default. Every modern framework makes it easy to implement and it feels better than waiting for submission. The problem is that most implementations validate at the wrong moment, which turns help into an annoyance.

## The most common mistake: flagging the error before it exists

An email field that turns red the moment the person types the first letter is mathematically correct and hostile. Technically "a" isn't a valid email, but the person is still typing. Marking it as an error there isn't informing: it's interrupting an unfinished action.

## The form validation criteria I apply

**Validate against an error that already happened, not against an incomplete state.** The difference between "this is wrong" and "this isn't finished yet" is what almost every implementation ignores. A field requiring eight characters shouldn't turn red at character three. It isn't an error: it's a process in progress.

**The right moment is usually when the person leaves the field, not while typing.** Validating on blur gives them time to finish the thought before feedback arrives. And that feedback lands with the context still fresh, without moving to another field to discover the previous one was wrong. It's what [Nielsen Norman recommends](https://www.nngroup.com/articles/errors-forms-design-guidelines/).

**Once a field has shown an error, that's when validating while correcting makes sense.** It's deliberately asymmetric. I don't interrupt while the person types for the first time, but I do confirm immediately once they're fixing an error I already flagged. That way they know right away whether the fix worked, without resubmitting.

## A concrete example: this site's contact form

The message field has a minimum and maximum character count. It doesn't get marked as an error while the person types below the minimum: that would tell them "you're wrong" for not having finished. It validates on submit attempt. From there, if they correct the text, real-time validation confirms instantly that it meets the requirement.

## It's the same problem as error states

Form validation is a specific case of [designing for when something goes wrong](/en/blog/designing-for-when-something-goes-wrong). The moment and place where information appears matter as much as the information itself. A technically correct error, shown at the wrong moment, frustrates as much as a badly written one shown at the right moment. The problem isn't only what's said: it's when.

## The limit of this rule

There are cases where immediate validation does help, even while typing. A character counter approaching its limit, or a password strength gauge with no correct-or-incorrect judgement. Those cases inform without accusing: they show progress, not failure. That distinction, more than the exact timing, decides whether it helps or annoys.

## What I do with server-side errors

Some validations only the server can resolve: whether an email is already registered, whether a coupon is still valid. There's no way to anticipate those while the person types.

What I do control is where the answer appears. The error goes back to the field that caused it, not to a banner above the form, and the field keeps whatever the person had typed. Clearing it "for safety" is the fastest way to make someone leave.

## The check I run before calling a form finished

I fill it in wrongly on purpose, field by field, and watch when each message appears. If any of them shows up before I finished typing that field, it's in the wrong place.

Then I fill it in correctly and check whether any field is still flagged red by a stale state nobody cleared. That's the second most common bug, and the most confusing one: the person has fixed everything and the interface still says something is wrong.
