---
name: docs-review
description: Review documentation and give structured, actionable feedback grounded in the "50 docs tips" best practices from Sarah Rainsberger, Astro's docs lead. Use this whenever the user asks to review, critique, assess, or improve documentation of any kind — a README, tutorial, guide, API reference, changelog, release notes, docs site page, or Markdown/MDX file — whether they provide a file path, paste the text, or give a URL to a web page. Trigger even for casual phrasings like "look at these docs", "any feedback on this page?", "is this README good?", or "how can this guide be better?".
---

# Docs Review

Review a piece of documentation and deliver feedback its author can act on
immediately. The review standard comes from Sarah Rainsberger's
["50 docs tips"](https://www.rainsberger.ca/docs-tips/) series, distilled into
`references/docs-tips.md`. The guiding idea of that series: the sole purpose of
docs is to be helpful. Every finding you report should trace back to a way the
document could help its reader more.

## Step 1: Get the document

- **Local file path** → `Read` it. If given a directory, list it and review the
  entry-point docs first (README, index, getting-started), then ask which others
  matter or sweep them if the user asked for everything.
- **URL** → `WebFetch` with a prompt asking for the page's full content,
  including headings hierarchy, code blocks (with their titles/filenames, if
  shown), link text, and admonitions/asides — these details are exactly what the
  review needs, and a summary would hide them. If `WebFetch` is unavailable or
  blocked, try `curl -sL <url>` and read the HTML. If the URL is unreachable
  from the environment, say so plainly and ask the user to paste the content —
  do not review a page you could not read.
- **Pasted text** → review it as-is.

## Step 2: Establish context before judging

Identify, and state in the review:

1. **Document type**: tutorial (learning-oriented), how-to guide
   (task-oriented), reference (information-oriented), concept/explanation,
   README, changelog/release notes, or landing page.
2. **Assumed audience**: beginner or experienced? Users of the project or
   contributors to it?
3. **Place in the reader's journey**: what has the reader likely already read or
   done when they land here?

This matters because several checks depend on purpose: content that is perfect
in a tutorial can be wrong in a reference page ("right words, wrong place"), and
release notes have their own rules. Judge the document against *its* job, not
against a generic ideal.

Also look for a project style guide (CONTRIBUTING, STYLEGUIDE, writing-guide
files) when reviewing docs inside a repo. Where the project's stated conventions
conflict with the rubric, the project wins — note the conflict rather than
flagging compliant text.

## Step 3: Review against the rubric

Read `references/docs-tips.md` in full, then go through the document with its
checklist categories:

1. Helpfulness and truth
2. Voice and tone
3. Word choice
4. Tense and current state
5. Positive patterns (show what to do)
6. Structure and the reader's journey
7. Instructions and procedures
8. Code samples
9. Scope (what not to document)
10. Changelogs and release notes (when applicable)

Collect concrete findings: quote the actual text, note where it is (heading,
section, or line), and identify which principle it violates. If the same issue
repeats (e.g. "simply" appears 14 times, or no code block has a title), report
it once as a pattern with a count and a couple of examples — don't list every
instance.

## Step 4: Write the review

Use this structure:

```markdown
# Docs review: <title or path>

**Type:** <doc type> · **Audience:** <assumed audience>

## Summary
<2–4 sentences: what the document does well and the single biggest opportunity.>

## What's working
<3–5 bullets. Real strengths, specifically observed — not padding.>

## Findings

### High impact — hurts the reader's success
### Medium — causes friction or confusion
### Polish — small wins

<Each finding:>
- **Where:** <section / heading / line>
  **What:** "<short quote of the current text>"
  **Why it matters:** <one sentence, citing the tip — e.g. (Tip 23: is not was)>
  **Try instead:** "<concrete rewritten text, ready to paste>"

## Quick wins
<Top 3–5 changes with the best effort-to-impact ratio.>
```

Rules of conduct for the review itself — the rubric applies to your feedback
too:

- **Show what to do** (Tip 34): never flag something without showing a fixed
  version. A criticism without a rewrite makes the author do your job.
- **Prioritize by reader impact**, not by how easy something is to spot. A
  broken prerequisite chain outranks ten filler words.
- **Be selective.** A review with 8 well-chosen findings gets acted on; one
  with 40 gets closed. Fold minor repeats into patterns, and let genuinely fine
  text be fine.
- **NWTWWHB** (Tip 49): when reviewing a contribution or a draft, the bar is
  "not worse than what we had before" — improvements need not be perfect to be
  worth merging. Frame feedback so the author can land the improvement now and
  polish later.
- **Don't review taste.** If the project consistently uses a voice or
  convention you wouldn't choose, consistency wins; flag only real barriers to
  the reader.

## Edge cases

- **Very long documents** (roughly 1,500+ lines): review the structure first —
  headings map, ordering, findability — then deep-review the highest-traffic
  sections (intro, install, first task). State explicitly which sections got a
  deep read and which were sampled.
- **Multiple files**: give each file a short review plus one shared section for
  patterns that repeat across the set.
- **"Fix it" requests**: if the user asked you to improve the docs rather than
  just review them, still produce the findings list first (so the reasoning is
  visible), then apply the edits for everything you flagged.
- **Non-docs text** (marketing copy, blog posts): the rubric mostly still
  applies, but say you're adapting a docs rubric and skip docs-specific checks
  (code block titles, changelog rules) that don't fit.
