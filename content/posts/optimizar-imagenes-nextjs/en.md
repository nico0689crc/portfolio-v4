---
slug: optimizing-images-in-nextjs-without-losing-quality
title: "How I optimize images in Next.js without it showing"
excerpt: "Next.js's Image component solves half the problem on its own. The other half is deciding format, sizes, and when to prioritize, and those decisions are still mine."
focusKeyphrase: optimizing images in Next.js
seoTitle: "Optimizing images in Next.js without losing quality"
seoDescription: "How optimizing images in Next.js actually works: when to use priority, what to declare in sizes, and why AVIF is not always the right answer."
ogTitle: "The fastest image is the one you never had to download"
ogDescription: "How I optimize images in Next.js without visual quality taking a hit."
coverAlt: "Comparison of one image at different sizes and compression formats"
status: published
publishedAt: 2027-02-01
tags: nextjs, rendimiento
---

Images are, on most sites I audit, the number one reason a page loads slowly. And optimizing images in Next.js looks like a solved problem: the `Image` component does it automatically. The common mistake is thinking that using it is the end of the job, when it's where the decisions start.

## What the component solves on its own

It generates multiple sizes of the same image and serves the one matching the device. It converts to modern formats like WebP or AVIF when the browser supports them. And it avoids layout shift by reserving the space before the image loads. All of that is free just by using [`<Image>`](https://nextjs.org/docs/app/api-reference/components/image) instead of `<img>`.

## Optimizing images in Next.js: what is still my decision

**Which image gets loading priority.** The `priority` prop tells Next.js to preload that image instead of waiting for the browser to discover it. I use it on exactly one image per page: whichever appears first without scrolling, like the hero. Using it on more than one defeats the purpose. If everything is priority, nothing is, and they compete for the same initial bandwidth.

**What sizes I declare in `sizes`.** This prop tells the browser how wide the image will render at each breakpoint, so it downloads the right size. On this portfolio, the blog cover uses `sizes="(max-width: 768px) 100vw, 50vw"`. Full width on mobile, half on desktop, because that's where it lives in a two-column grid. Without this prop calculated correctly, the browser can download the desktop version on a phone.

**When AVIF isn't the answer.** AVIF compresses better than WebP in most cases, but takes longer to encode. And on finely detailed images it can introduce artifacts WebP doesn't have. For real photographs, AVIF almost always wins. For interface screenshots with text and sharp edges — like the ones I use in this portfolio's case studies — I eyeball the result before assuming the newer format is automatically better.

## The mistake I've seen most often (and made myself)

Uploading the source image at its original camera resolution — sometimes 4000 pixels wide — trusting that Next.js "will optimize it anyway". It's true it will resize it, but decoding an image that size on every build costs real time. On large catalogues it shows. I resize the source to just above the maximum width I'll display, and no more, before uploading it.

## A concrete case: this blog's default cover

The fallback cover this blog shows on posts without their own image is an inline SVG, not a file optimized by Next.js. That was on purpose. `next/image` doesn't optimize SVG unless a specific setting is enabled, and with the schedule loaded months ahead most cards were going to show that cover. Inline means zero network request, which beats any possible optimization on a file.

There is a second reason. An inline SVG scales with the theme: it reads the same tokens the rest of the page uses, so it never looks like a flat sticker pasted over a dark background. A raster fallback would have needed two files and a media query to do the same thing.

That decision didn't come from the `Image` component. It came from asking myself, for that specific case, whether the fastest image wouldn't simply be the one you don't have to download.

## The question I ask before any new image

**Does this image need to be a photo, or could something lighter communicate the same thing?** An icon, a background colour, an SVG. The most effective optimization is almost always the one that avoids the heavy image in the first place, not the one that compresses it better afterwards.

The rest of the performance decisions on this site are in [data fetching in Next.js](/en/blog/data-fetching-in-nextjs-where-to-request-data).
