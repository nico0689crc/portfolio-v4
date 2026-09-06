---
slug: how-i-review-ai-generated-code-before-accepting-it
title: "How I review AI-generated code before accepting it"
excerpt: "AI-generated code looks reasonable ninety percent of the time. That ninety percent is exactly the problem: a superficial review doesn't tell correct code apart from code that only looks correct."
focusKeyphrase: reviewing AI-generated code
seoTitle: "How to review AI-generated code before accepting it into a project"
seoDescription: "The checklist I apply before accepting AI-generated code into a real project, beyond whether it compiles and passes the tests."
ogTitle: "Code compiling doesn't mean it's the correct code"
ogDescription: "The process I follow to review AI-generated code before it enters a real project."
coverAlt: "Code in an editor with manual review annotations on specific lines"
status: published
publishedAt: 2027-06-14
tags: ia, nextjs
---

I wrote in [another article](/en/blog/how-i-use-ai-in-my-workflow-without-losing-judgement) about where I use AI and where I don't. This is the specific thing I do with the code it does generate, before it enters a real project — the concrete checklist, not the general criteria.

## Why "it compiles and passes the tests" isn't enough

Code that compiles and passes tests that already existed only proves it didn't break what was already being checked. It doesn't prove it solves the case I need, that it handles the error that's going to happen in production, or that it didn't introduce a vulnerability no existing test was looking for. The review has to go beyond "didn't visibly break anything".

## The first thing: reading it as if written by someone I've never seen work

I don't read generated code with the confidence I'd read a colleague's whose judgement I already know. I read it with the specific distrust of not knowing whether this particular piece of code has a subtle bug, because I have no track record for that "person" telling me whether they usually get this type of problem right.

## The concrete checklist

**Does it handle cases where the data doesn't arrive as expected?** AI tends to write for the happy path — the data exists, has the right format, the network responds on time. I specifically check what happens if the data is null, if the network fails, if the response arrives in an unexpected format. Something's almost always missing there.

**Is the security validation complete, or does it only cover the obvious case?** In code touching authentication or permissions, I specifically check the edges: what happens with a user with no session? With a role that lacks that permission? With an ID that doesn't exist? AI usually writes the validation for the central case and leaves the edges uncovered, which is exactly where most real vulnerabilities live.

**Is it using the correct version of the library, or one that no longer exists?** Models train on data from a specific point in time, and APIs change. I check against the library's current documentation, not against what the generated code assumes, especially on projects with dependencies that update often.

**Does the error handling do something useful, or does it just catch the exception and move on?** An empty `try/catch` that swallows the error without logging or propagating it is worse than no error handling — it hides the problem instead of solving it, and when something fails in production, there's no trace of what happened.

**Can I explain every line without looking at the code again?** This is the final test, and the strictest one. If I finish reading the code and can't reconstruct from memory why each part is there, I don't accept it yet. Accepting something I can't explain is accepting a black box I'm someday going to have to debug without understanding how it works.

## A concrete example of something I rejected

While generating a function to verify a Mercado Pago webhook's status, the generated code correctly checked the request's signature, but didn't account for the same notification arriving twice — something Mercado Pago does explicitly by design, to guarantee the event gets received even if the first delivery fails. The generated code, without that check, would have processed the same payment twice. It wasn't an error visible in a simple test — it only showed up if the notification actually got duplicated, which is exactly the real scenario that code had to handle.

## Why this process doesn't make AI less useful

Reviewing at this level of detail doesn't remove the value of generating code fast. The real time savings isn't in skipping the review — it's in not having to write the basic structure from scratch. Rigorous review is still needed, exactly as it would be for code written by a talented junior developer who lacks the project's full context. The difference from a junior is that AI never learns from the previous review's context, so the same type of mistake can repeat next time, and it has to be reviewed with the same rigor every time.
