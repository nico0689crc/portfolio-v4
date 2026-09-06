---
slug: i-stopped-thinking-in-breakpoints-and-started-thinking-in-content
title: "I stopped thinking in breakpoints and started thinking in content"
excerpt: "Designing for 'phone, tablet, desktop' assumes three fixed sizes almost no real device respects. The criteria that changes everything is asking when content starts breaking, not what screen width it happens at."
focusKeyphrase: responsive design
seoTitle: "Responsive design: think in content, not breakpoints"
seoDescription: "Why responsive design built on three fixed breakpoints misses how sites get used, and the criteria of designing around where content breaks."
ogTitle: "No real device respects your three breakpoints"
ogDescription: "The shift in criteria I made in responsive design: from fixed screen sizes to the points where content actually breaks."
coverAlt: "Interface layout smoothly adapting across different screen widths"
status: published
publishedAt: 2027-05-03
tags: diseno-ui, react
---

For years I designed thinking in three sizes: phone, tablet, desktop. It's the mental model almost every responsive design tutorial teaches, and it has a problem that shows the moment you test it on real devices: almost no device cleanly respects those three categories.

## The problem with the three-size model

A phone in landscape has more width than a tablet in portrait. A browser window on a laptop can have exactly a tablet's width without being either thing. The three-size model assumes device categories that don't exist. The interface receives a number of pixels, not a label.

## The change in question for responsive design

Instead of asking "how does this look on a phone?", I started asking "at what width does this layout start to break?". The second question has an objective answer: I shrink the window until something overlaps, gets cut off, or loses the room it needs. The first depends on which device I chose to test, an arbitrary sample.

The breakpoints I use come from that real breaking point, not from a "600px is tablet" convention. If a three-column layout feels cramped at 850px, that's my breakpoint. It's the idea [Ethan Marcotte set out in the original article](https://alistapart.com/article/responsive-web-design/) that gave all this its name.

## How this changes the design process

**I design with real content, not a fixed-width mockup.** A short title and a long one can break a layout at completely different widths. Designing with "Sample title" instead of the actual title that screen will have hides exactly the case that's going to break in production.

**I test by shrinking gradually, not jumping between three sizes.** I drag the window's edge slowly from full width down to narrow, watching for the exact point where something stops looking right. Jumping straight to 375px skips every intermediate width where the layout also has to work. That's where a resized browser window on a laptop lives.

**Content decides the layout, not the other way around.** If a card needs to show a title, an image and three pieces of metadata, the layout adapts so they stay legible at any width. Not the other way around: forcing content into a fixed-column grid designed first.

## A concrete example on this very portfolio

The blog grid uses `md:grid-cols-2` — two columns past a certain width, one before that. That breaking point didn't come from "tablet starts at such-and-such width". It came from testing at what point a card with a cover, a title and an excerpt became too narrow to read in two columns. That width is the breakpoint, whether or not it matches a catalogue device.

## What container queries change

Recently this stopped being just a way of thinking. Container queries let a component react to its container's width rather than the window's, which is exactly what this approach had been asking for all along.

A card in a narrow sidebar and the same card at full width are two different contexts, even when the window is identical. With media queries that needed variants or extra classes. With container queries, the component adapts on its own. That closes the gap this whole approach was built around: the window was never the thing the content actually lived inside.

## The limit of this approach

Thinking in content doesn't remove the need for a consistent set of breakpoints. Without that, every component ends up with its own arbitrary breaking point and the system becomes inconsistent, just like with [design tokens](/en/blog/design-tokens-figma-to-tailwind). The difference is how they get calibrated: by looking at several real components and finding where their natural breaking points align, instead of adopting a generic convention without checking it.
