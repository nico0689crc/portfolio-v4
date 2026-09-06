---
slug: optimizing-images-in-nextjs-without-losing-quality
title: "How I optimize images in Next.js without it showing"
excerpt: "Next.js's Image component solves half the problem on its own. The other half is deciding format, sizes, and when to prioritize, and those decisions are still mine."
focusKeyphrase: optimizing images in Next.js
seoTitle: "Optimizing images in Next.js: a practical guide without losing visual quality"
seoDescription: "How I use Next.js's Image component, when to prioritize an image, what sizes to declare, and why AVIF isn't always the right answer."
ogTitle: "The fastest image is the one you never had to download"
ogDescription: "How I optimize images in Next.js without visual quality taking a hit."
coverAlt: "Comparison of one image at different sizes and compression formats"
status: published
publishedAt: 2027-04-05
tags: nextjs, rendimiento
---

Images are, on most sites I audit, the number one reason a page loads slowly. And it's a deceptive problem because it's technically "already solved" — Next.js ships an `Image` component that optimizes automatically. The common mistake is thinking using it is the end of the job, when it's actually where the decisions start.

## What the component solves on its own

It automatically generates multiple sizes of the same image and serves the one matching the device, converts to modern formats like WebP or AVIF when the browser supports them, and avoids layout shift by reserving the space before the image loads. That's real, and it's free just by using `<Image>` instead of `<img>`.

## What's still my decision

**Which image gets loading priority.** The `priority` prop tells Next.js to preload that specific image instead of waiting for the browser to discover it in the normal flow. I use it on exactly one image per page: whichever appears first on screen without scrolling, like the hero. Using it on more than one image defeats the purpose — if everything is priority, nothing is, and they compete for the same initial bandwidth.

**What sizes I declare in `sizes`.** This prop tells the browser how wide the image will render at different breakpoints, so it downloads the right size instead of a bigger one "just in case". On this portfolio, the blog cover uses `sizes="(max-width: 768px) 100vw, 50vw"` — full width on mobile, half on desktop, because that's where it lives in a two-column grid. Without this prop calculated correctly, the browser can end up downloading the desktop version on a phone, spending data nobody needed to spend.

**When AVIF isn't the answer.** AVIF compresses better than WebP in most cases, but takes longer to encode and, on some finely detailed images, can introduce artifacts WebP doesn't have. For real photographs, AVIF almost always wins. For interface screenshots with text and sharp edges — like the ones I use in this portfolio's case studies — I eyeball the result before assuming the newer format is automatically better.

## The mistake I've seen most often (and made myself)

Uploading the source image at its original camera resolution — sometimes 4000 pixels wide — trusting that Next.js "will optimize it anyway". It's true it will resize it, but decoding and processing an image that size on every build costs real build time, and on large catalogues it shows. I resize the source to a reasonably wide margin above the maximum I'll actually need to display — not more — before uploading it to the project.

## A concrete case: this blog's default cover

When I designed the fallback cover this very blog shows on posts that don't have their own image yet, I made it an inline SVG instead of a file optimized by Next.js, on purpose. `next/image` doesn't optimize SVG unless a specific setting is enabled, and with the blog's schedule loaded months ahead, most cards were going to show that image — inline means zero network request for it, which is faster than any possible optimization on a file.

That decision didn't come from the `Image` component. It came from asking myself, for that specific case, whether the fastest image wouldn't simply be the one you don't have to download.

## The question I ask before any new image

**Does this image need to be a photo, or could something lighter communicate the same thing?** An icon, a background colour, an SVG. The most effective optimization is almost always the one that avoids needing the heavy image in the first place, not the one that compresses it better afterwards.
