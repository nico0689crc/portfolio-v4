---
slug: data-fetching-in-nextjs-where-to-request-data
title: "Data fetching in Next.js: where I request data, and why it matters where"
excerpt: "The same data, requested in the wrong component, can mean three seconds of waiting or zero. The rule I use to decide at what level of the tree each request belongs."
focusKeyphrase: Next.js data fetching
seoTitle: "Data fetching in Next.js: where to request data in the component tree"
seoDescription: "How to decide which component should make each request in Next.js App Router, avoiding loading waterfalls and duplicate requests, with real examples."
ogTitle: "The same data, requested one level up, changes the load time"
ogDescription: "Where I request data in a Next.js component tree, and the waterfall mistake I see repeated the most."
coverAlt: "Component tree with arrows showing the order of data requests"
status: published
publishedAt: 2027-01-25
tags: nextjs, rendimiento, react
---

There's a performance mistake that doesn't show up in the code and only shows up in a browser network tab: data requests that should fire together, firing one after another because each one waits for the previous one to finish.

It's called a request waterfall, and in Next.js App Router it's surprisingly easy to create without noticing.

## How a waterfall forms by accident

```tsx
async function Page() {
  const user = await getUser();          // waits for this
  return <Profile userId={user.id} />;
}

async function Profile({ userId }) {
  const posts = await getPosts(userId);  // only starts now
  return <PostList posts={posts} />;
}
```

`getPosts` can't start until `getUser` finishes, because `Profile` needs the `userId` the first one returns. That's correct — there's a real dependency between the two pieces of data. The problem shows up when that dependency **doesn't exist** and the code still ends up written as a waterfall because that was the most natural way to write it.

## The case with no real dependency

```tsx
async function Page() {
  const user = await getUser();
  const settings = await getSettings();  // doesn't use anything from `user`
  return <Dashboard user={user} settings={settings} />;
}
```

`getSettings` doesn't use anything from `user`. It could have started at the same time. But since it's written with two sequential `await`s, it runs one after the other, adding up their times instead of overlapping.

The correct way:

```tsx
async function Page() {
  const [user, settings] = await Promise.all([getUser(), getSettings()]);
  return <Dashboard user={user} settings={settings} />;
}
```

Now both start at the same instant. If each takes 200ms, the waterfall version takes 400ms and this one takes 200ms. The gap grows with every additional request unnecessarily added to the waterfall.

## The criteria I use to decide at what level to request each piece of data

**If two pieces of data don't depend on each other, request them at the highest possible component, in parallel.** This avoids the waterfall and also stops every child component from having to re-request data its parent already fetched.

**If a piece of data is specific to a single section of the page, request it in that section's component, not way up top.** Requesting it up top "just in case" delays the render of the whole page waiting on data only one part needs. On this very portfolio, `WhyMe` requests its own translations instead of receiving them from the parent component — there's no reason for `Hero` to wait on that data being ready if `Hero` doesn't use it.

**If a piece of data genuinely depends on another, the waterfall is correct and shouldn't be forced into parallel.** Forcing a `Promise.all` between data that genuinely depends on each other doesn't speed anything up, because you still have to wait for the first one before you can request the second — it just adds complexity with no real benefit.

## Cache: the other half of the problem

Requesting the same data in two different components of the same request shouldn't duplicate the database query. On this site, every content-reading function goes through `cached()`, which wraps the query with `unstable_cache` — so if `Header` and `Footer` both request the same site-settings data, the second call returns the cached result instead of hitting the database again.

That's what makes it safe to request data "closer to where it's used" without fear of duplicating the cost: duplicating the request in code isn't duplicating the real work, as long as the cache is set up correctly.

## How I catch it after the fact

I open the browser's network tab and look at the shape of the timing bars. Parallel requests look like a row of bars starting at the same point. A waterfall looks like a staircase: each bar starts where the previous one ends.

If I see a staircase where I expected a row, I check whether there's a real dependency between those two requests. Half the time, there isn't — it was just written in the order it occurred to me to write it, not in the order performance needed.
