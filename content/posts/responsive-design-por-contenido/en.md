---
slug: i-stopped-thinking-in-breakpoints-and-started-thinking-in-content
title: "I stopped thinking in breakpoints and started thinking in content"
excerpt: "Designing for 'phone, tablet, desktop' assumes three fixed sizes almost no real device respects. The criteria that changes everything is asking when content starts breaking, not what screen width it happens at."
focusKeyphrase: responsive design
seoTitle: "Responsive design: why thinking in content beats thinking in breakpoints"
seoDescription: "Why the three fixed breakpoints of phone, tablet and desktop don't reflect how a site actually gets used, and the criteria of designing around where content genuinely breaks."
ogTitle: "No real device respects your three breakpoints"
ogDescription: "The shift in criteria I made in responsive design: from fixed screen sizes to the points where content actually breaks."
coverAlt: "Interface layout smoothly adapting across different screen widths"
status: published
publishedAt: 2027-05-03
tags: diseno-ui, react
---

For years I designed thinking in three sizes: phone, tablet, desktop. It's the mental model almost every responsive design tutorial teaches, and it has a problem that shows the moment you test it on real devices: almost no device cleanly respects those three categories.

## The problem with the three-size model

A phone in landscape has more width than a tablet in portrait. A browser window on a laptop can have exactly a tablet's width without being either thing. The "design for these three sizes" model assumes device categories that don't exist in the actual width the interface receives — it receives a number of pixels, not a label saying "this is a phone".

## The change in question

Instead of asking myself "how does this look on a phone?", I started asking "at what specific width does this layout start to break?". The difference is that the second question has an objective, verifiable answer — I shrink the browser window until something overlaps, gets cut off, or two elements that need room stop having it — while the first depends on which specific device I chose to test, which is an arbitrary sample of all the possible widths.

The breakpoints I use come from that real breaking point, not from a "600px is tablet" convention. If a three-column layout starts to feel cramped at 850px, that's my breakpoint, regardless of whether it matches any reference device.

## How this changes the design process

**I design with real content, not a fixed-width mockup.** A short title and a long one can break a layout at completely different widths. Designing with "Sample title" instead of the actual title that screen will have hides exactly the case that's going to break in production.

**I test by shrinking gradually, not jumping between three sizes.** I drag the browser window's edge slowly from full width down to narrow, watching for the exact point where something stops looking right. Jumping straight to 375px — a reference iPhone's width — skips over every intermediate width where the layout also has to work, because that's exactly where a resized browser window on a laptop lives.

**Content decides the layout, not the other way around.** If a card needs to show a title, an image, and three pieces of metadata, the layout adapts so those three elements stay legible at any width, instead of forcing the content into a fixed-column grid that was designed first.

## A concrete example on this very portfolio

The blog grid uses `md:grid-cols-2` — two columns past a certain width, one before that. That breaking point didn't come from "tablet starts at such-and-such width". It came from testing at what point a card with a cover, a title, and an excerpt became too narrow to read comfortably in two columns, and that specific width is the breakpoint, regardless of whether it matches any catalogue device.

## The limit of this approach

Thinking in content doesn't remove the need for some consistent set of breakpoints across the project — without that, every component ends up with its own arbitrary breaking point and the system becomes inconsistent, similar to what I described about [design tokens](/en/blog/design-tokens-figma-to-tailwind) in general. The difference is that those system-wide breakpoints get calibrated by looking at several real components in the project and finding where their natural breaking points align, instead of adopting a generic industry convention without checking it against the project's actual content.
