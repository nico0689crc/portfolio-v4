---
slug: seo-and-ux-are-not-opposing-goals
title: "SEO and UX aren't opposing goals (even though instinct says otherwise)"
excerpt: "The belief that optimizing for search engines makes the experience worse comes from an era when that was true. Today most of the signals Google asks for are the same signals a real user needs."
focusKeyphrase: SEO and UX
seoTitle: "SEO and UX: optimizing does not hurt the experience"
seoDescription: "Why SEO and UX now ask for the same things: speed, semantic structure and clear hierarchy, with concrete implementation examples."
ogTitle: "Every time I improve a page's SEO, its UX improves too"
ogDescription: "Why SEO and user experience stopped being goals in tension, with concrete examples."
coverAlt: "Interface with overlapping SEO and accessibility signals aligning"
status: published
publishedAt: 2027-02-08
tags: seo, diseno-ui, rendimiento
---

You still hear that optimizing for SEO means sacrificing experience: stuffing keywords, writing for an algorithm instead of a person. That tension was real, but it dates from more than a decade ago. Today SEO and UX ask for almost exactly the same things.

## Why the tension used to be real

In old SEO, the algorithm rewarded signals that had nothing to do with a page's quality. Keyword density, link count regardless of which links, meta keywords nobody read. Optimizing for that made the experience worse: text that repeats a phrase fourteen times reads worse than text written to explain something.

That SEO doesn't exist anymore. Google got better at predicting whether a page answers what someone is searching for, and stopped being fooled by surface tricks.

## The signals where SEO and UX ask for the same thing

**Load speed.** Google measures the [Core Web Vitals](https://web.dev/articles/vitals): how fast content appears, how fast it responds to an interaction, and how stable the layout stays while loading. None of those three things benefit only the ranking. A real user abandons a slow page before it finishes loading, whether Google is measuring it or not.

**Semantic structure.** Hierarchical headings in logical order, alt text on images, HTML that describes what each thing is and not just how it looks. They're the same signals a screen reader needs, as I wrote in [why accessibility isn't a phase 2](/en/blog/accessibility-is-not-a-phase-2). Google and a screen reader are trying to understand the same thing: what each part of the page is, and in what order it matters.

**Clear, specific metadata.** A title and description that precisely explain what's on the page, instead of a generic one repeated everywhere. That helps ranking. It also helps the person deciding, in a list of results, whether to click your page or a competitor's.

**Content that answers the real question behind the search.** This is the biggest change in modern SEO. Mentioning a keyword isn't enough anymore: you have to answer what that search means. In practice that's the same work as writing genuinely useful content.

## Where tension can still show up

It isn't a perfect alignment 100% of the time. Alt text that's too long can be better for SEO and worse for a screen reader, which has to listen to the whole description before moving on. The fix isn't picking one: it's writing the alt short and precise, which serves both.

Another example: loading all of a page's content at once helps a search engine index everything. But it's worse for the user if the page has hundreds of items and the scroll becomes endless. The correct solution, paginated content with clear links, serves both goals.

## The concrete case of this site

This portfolio's technical SEO, a sitemap with real dates, [correct hreflang](/en/blog/hreflang-what-breaks-bilingual-seo-the-most) and page-specific metadata, doesn't compete with the visitor's experience. It coexists with it because both depend on the same foundation: well-structured content, loaded fast and described precisely.

When I fixed this site's sitemap to declare real dates instead of the build time, I wasn't doing it only for ranking. An "updated" date that lies about when the content changed is false information. It's bad for SEO and bad for anyone relying on that date.

## The question that replaces the dilemma

Instead of asking myself "is this for SEO or for the user?", I ask "does this precisely describe what's here?". Almost always, the answer that serves the user is the same one that serves the search engine, because both are trying to understand the same thing from different angles.

The exception is worth naming. When the two genuinely pull apart, the user wins, because a page that ranks well and disappoints whoever lands on it loses the ranking anyway. Search engines measure that too, just more slowly than they measure a title tag.
