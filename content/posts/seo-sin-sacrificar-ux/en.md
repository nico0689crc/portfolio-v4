---
slug: seo-and-ux-are-not-opposing-goals
title: "SEO and UX aren't opposing goals (even though instinct says otherwise)"
excerpt: "The belief that optimizing for search engines makes the experience worse comes from an era when that was true. Today most of the signals Google asks for are the same signals a real user needs."
focusKeyphrase: SEO and UX
seoTitle: "SEO and UX: why optimizing for search engines doesn't hurt the experience"
seoDescription: "Why the technical signals modern SEO asks for — speed, semantic structure, clear hierarchy — are the same ones a real user needs, with concrete implementation examples."
ogTitle: "Every time I improve a page's SEO, its UX improves too"
ogDescription: "Why SEO and user experience stopped being goals in tension, with concrete examples."
coverAlt: "Interface with overlapping SEO and accessibility signals aligning"
status: published
publishedAt: 2027-02-08
tags: seo, diseno-ui, rendimiento
---

You still hear the idea that optimizing for SEO means sacrificing user experience — stuffing keywords, trading design for technical structure, writing for an algorithm instead of a person. That tension was real, but it's a tension from more than a decade ago. The SEO that matters today asks for almost exactly what a real user needs.

## Why the tension used to be real

In old SEO, the algorithm rewarded signals that had nothing to do with a page's actual quality: keyword density, link count regardless of quality, meta keywords nobody read. Optimizing for that literally made the experience worse — text written to repeat a phrase fourteen times reads worse than text written to explain something.

That SEO doesn't exist anymore, largely because Google got better at predicting whether a page genuinely answers what someone is searching for, and stopped being fooled by surface tricks.

## The signals that matter today, and who else they serve

**Load speed.** Google measures Core Web Vitals — metrics for how fast content appears, how fast it responds to an interaction, how stable the layout stays while loading. None of those three things benefit only the ranking. A real user abandons a slow page before it finishes loading, whether Google is measuring it or not.

**Semantic structure.** Hierarchical headings (`h1`, `h2`, `h3` in logical order), alt text on images, HTML that describes what each thing is and not just how it looks. These are exactly the same signals a screen reader needs, which I wrote about in detail in [why accessibility isn't a phase 2](/en/blog/accessibility-is-not-a-phase-2). Google and a screen reader are trying to understand the same thing: what each part of the page is, and in what order it matters.

**Clear, specific metadata.** A title and description that precisely explain what's on the page, instead of a generic one repeated everywhere. That helps ranking, and it also helps the person deciding, in a list of results, whether to click your page or a competitor's.

**Content that answers the real question behind the search.** This is the biggest change in modern SEO: mentioning a keyword isn't enough anymore, you actually have to answer what that search means. That, in practice, is exactly the same work as writing content that's useful to a real user.

## Where tension can still show up

It isn't a perfect alignment 100% of the time. A real example: alt text that's too long and descriptive can be better for SEO and worse for a screen reader, which has to listen to the whole description before continuing to navigate. The fix isn't picking one over the other — it's writing the alt text short and precise, which is what actually serves both, instead of padding it out thinking only about the search engine.

Another example: loading all of a page's content at once, with no pagination, helps a search engine index everything. But it can be worse for the user if that page has hundreds of items and the scroll becomes endless. There, the correct technical solution — paginated content with clear links, instead of everything at once or everything cut off with no indication — serves both goals without either one beating the other.

## The concrete case of this site

This portfolio's technical SEO — a sitemap with real dates, correct hreflang between languages, page-specific metadata — doesn't compete with the visitor's experience. It coexists with it because both things depend on the same foundation: well-structured content, loaded fast, and described precisely.

When I fixed this site's sitemap to declare real dates instead of the build time, I wasn't doing it only for ranking. I did it because an "updated" date that lies about when the content actually changed is false information, full stop — it's bad for SEO and bad for anyone relying on that date for anything.

## The question that replaces the dilemma

Instead of asking myself "is this for SEO or for the user?", I ask "does this precisely describe what's here?". Almost always, the answer that serves the user is the same one that serves the search engine, because both are trying to understand the same thing from different angles.
