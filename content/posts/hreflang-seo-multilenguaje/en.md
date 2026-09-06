---
slug: hreflang-what-breaks-bilingual-seo-the-most
title: "Hreflang: what breaks a bilingual site's SEO the most"
excerpt: "A badly declared hreflang isn't a minor configuration error. It's the most common way for Google to discard an entire language from indexing, without anyone noticing why."
focusKeyphrase: hreflang SEO
seoTitle: "Hreflang: how to avoid the most common multilingual SEO mistake"
seoDescription: "What hreflang is, why declaring a language that doesn't exist makes Google discard the whole cluster, and the criteria I use so every URL only declares what genuinely exists."
ogTitle: "A hreflang pointing to a page that doesn't exist can bring down both versions"
ogDescription: "The most common multilingual SEO mistake, and why the fix is simpler than it looks."
coverAlt: "Two versions of a page in different languages correctly connected by hreflang"
status: published
publishedAt: 2027-05-17
tags: seo, nextjs
---

Of every technical SEO mistake I've fixed on multilingual sites, badly declared hreflang is the one with the most disproportionate effect relative to how simple the mistake looks. One tag with the wrong URL can make Google drop from indexing not just that page, but the entire language cluster connected to it.

## What hreflang is, without the jargon

It's the tag that tells a search engine "this page has an equivalent version in another language, and it's at this URL". It's how Google shows a user in Spain your Spanish version, and one in Germany your English version, instead of showing both the same URL regardless of language.

## Why the mistake is so common

The most frequent mistake is declaring `hreflang="en"` pointing to a URL that doesn't actually exist yet in English — for example, a blog post only published in Spanish. It sounds harmless: "once I translate it, the tag will already be there". The problem is that in the meantime, that tag tells Google "there's an English version here", and when Google goes to verify it and finds a 404, the signal it receives isn't "doesn't exist yet" — it's "this hreflang declaration isn't trustworthy".

And once a hreflang declaration isn't trustworthy on one page, Google tends to distrust the whole cluster, not just that specific tag. The cost isn't proportional to the size of the mistake.

## The criteria I apply: only declare what exists

The rule I follow, no exceptions: a language gets declared in hreflang only once that specific translation is already published, with `status = published`, not when it's "coming soon" or "exists as a draft". On this site, the content system generates each post's hreflang by querying which translations are actually published at that moment — if the English version is still a draft, the Spanish note's hreflang doesn't mention English at all.

This means a post just published in one language doesn't announce the other until the other genuinely exists. It's less ambitious than declaring both from day one, and it's the only version that doesn't lie to Google.

## The second mistake, less common but just as damaging

Declaring reciprocal hreflang inconsistently: the Spanish version correctly points to the English version, but the English version doesn't point back to the Spanish one, or points to a different URL than the real one. Google treats the hreflang relationship as bidirectional — if A says B is its pair, B has to say A is its pair back. If they don't match, the whole signal gets discarded.

The way to avoid this isn't reviewing every page by hand, it's generating both directions from the same data source, so it's structurally impossible for them to fall out of sync. If hreflang gets built by reading which slugs are published in each language for the same internal key, both sides always match because they come from the same place.

## Why `x-default` matters too

Besides per-language hreflang, you need to declare which version shows to someone whose language doesn't match any of the declared ones. Without `x-default`, that visitor gets unspecified behaviour that varies between search engines. With it, the decision is explicit and consistent.

## The check I do after publishing

I don't trust the implementation is correct just because the code looks right. I check, in Search Console's tools, that no hreflang errors are reported for recently published pages — it's the only way to confirm what Google is actually reading matches what the code generates, instead of assuming they match because they should.
