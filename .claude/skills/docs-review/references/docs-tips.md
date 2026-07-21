# Docs review rubric — distilled from Sarah Rainsberger's "50 docs tips"

Source: [50 docs tips](https://www.rainsberger.ca/docs-tips/) by Sarah
Rainsberger, docs lead for [Astro](https://astro.build), written as a
"50 docs tips in 50 days" series, plus her companion talk
["Stop writing docs. Start helping!"](https://www.rainsberger.ca/blog/stop-writing-start-helping/).

This file distills the series into a review rubric organized by theme. Where a
check comes from a specific tip, it is cited by number and title. Entries marked
*(from title)* are interpreted from the tip's (self-demonstrating) title; the
canonical wording lives on the site. The rubric is faithful to the series'
philosophy but is a distillation, not a mirror.

**The one-line philosophy:** the sole purpose of documentation is to be
helpful. "Minimum Viable Docs" = every statement is true, and readers can find,
read, and understand what the statements mean. Every check below is a
concrete way docs fail one of those conditions.

---

## 1. Helpfulness and truth

- **Every statement must be true — docs are the record of truth** (Tip 14:
  *this post includes advice*). Official docs are the primary resource for how
  a project works; readers come to docs for the truth they can't get anywhere
  else. Flag anything speculative, outdated, or contradicted elsewhere in the
  same docs. Precision extends to small words: "includes" promises a partial
  list; "are" promises a complete one. Check that the word's promise matches
  reality.
- **Helping beats writing.** If a sentence exists to sound complete rather than
  to help the reader do or understand something, it's a candidate for deletion.
  If you want readers to do something to have a successful outcome, just say it
  that way — as a direct instruction, not a description of possibilities.
- **Watch for "should."** "The value should be a string" — is it a requirement,
  a recommendation, or a hope? Replace with the true statement: "The value must
  be a string" / "Set the value to a string". Deleting or replacing "should"
  almost always makes a docs sentence more true.

## 2. Voice and tone

- **Don't sound smart; make your reader feel smart** (Tip 1). Flag prose whose
  main effect is demonstrating the author's expertise — dense jargon, showing
  off internals, name-dropping theory before the reader can do anything with it.
- **Docs is not a conversation — skip the pleasantries** (Tip 3). "Welcome!",
  "Now, let's dive in!", "Happy coding!", "As you may recall…" cost reading time
  and carry no information. Cut them. (A single short greeting on a landing page
  can be fine; a chatty tone *throughout task content* is the problem.)
- **Simplify so the meaningful words stand out** (Tip 39: *smarty pants*).
  Docs must be consumable by readers of every experience and language level.
  Prefer the plain word over the impressive one: "use" over "leverage,"
  "so" over "consequently." No one has ever complained that docs were too easy
  to read.
- **Don't say "please"** (Tip 41: *if you please*, from title). Instructions
  are not requests: "please run the following command" → "Run the following
  command." Politeness words dilute imperatives and read oddly at scale.
- **Trust your reader** (Tip 8: *don't forget*). "Don't forget to…" /
  "Remember to…" assumes the reader is careless. State the step; trust them to
  scroll up if something didn't work the first time.
- **Don't hedge required steps as optional** (Tip 16: *read this tip… if you
  want to*, from title). "If you want, you can add…" — if the step is needed
  for success, instruct it. Reserve "optionally" for things that are truly
  optional, and say what choosing the option gets you.

## 3. Word choice

- **Say exactly what happens — don't "make things happen"** (Tip 2). Vague
  cause-and-effect phrasing ("this makes the component work") hides the actual
  behavior. Name the effect: "this registers the component so the browser
  renders it wherever the tag appears."
- **Say how a thing is used, not just "use"** (Tip 26: *use this*). "Use" often
  obscures the real purpose or action. If someone handed you a hammer and said
  "Use this!", you'd have a reasonable idea what they meant — your API is not a
  hammer. "Use the `render` prop" → "Pass a function to the `render` prop to
  control what each row displays."
- **Ban "appropriate," "as needed," "properly"** (Tip 13: *inadvertently
  inappropriate*). "Configure the appropriate values" is not descriptive — the
  reader came to the docs precisely because they don't know which values are
  appropriate. Replace with the actual criteria or an example.
- **Define even the "obvious" terms** (Tip 32: *defining the obvious*). Don't
  rely on the common meaning of a word to explain what it means in your
  project. Docs serve readers of all experience levels and language levels; a
  term of art ("island", "hydration", "slot") needs a definition or a link at
  first use.
- **Minimize filler and intensifiers.** "Simply," "just," "easily," "obviously,"
  "of course" — these claim the task is easy instead of making it easy, and
  they read as condescending the moment a reader struggles. (Flag as a pattern
  with a count, not one finding per instance.)

## 4. Tense and current state

- **Is, not was** (Tip 23). Document the present state of the project in
  present tense. Readers don't need the history ("previously this option was
  called…", "as of v2 you can now…") to use the current version. Historical
  notes belong in the changelog; "now" ages badly everywhere.
- **New features get assimilated, not appended** (Tip 21: *prepare to be
  assimilated*). Much docs work isn't writing new pages — it's updating
  existing ones. When a feature gains a new option, the existing sections that
  are now incomplete or inconsistent must be updated too. In review: check
  whether the surrounding/related sections still agree with the text under
  review; flag "NEW in vX.Y"-style bolt-on paragraphs that should be merged
  into the main flow.

## 5. Positive patterns — show what to do

- **Show the good version** (Tip 34: *show what to do*). Present things in the
  positive: this is how it works, this is how you do it. Avoid teaching via
  anti-examples — readers skim, copy code blocks, and remember what they saw,
  so a "❌ don't do this" block can inadvertently introduce or reinforce the
  unwanted pattern. If a warning is truly needed, keep the bad example small,
  clearly marked, and always paired with the good version.
- **Don't reference what isn't shown** (Tip 31: *as not shown here*, from
  title). "As shown above," "as mentioned earlier," "see the previous example" —
  verify the referenced thing actually exists, is nearby, and is where the
  text claims. Better: link directly to it or restate the one line that
  matters.

## 6. Structure and the reader's journey

- **Make it a heading** (Tip 4). If readers need to find something, make it a
  heading — headings are what scanning eyes and link anchors can hit. Check:
  are the questions readers bring to this page answered under headings that
  name them? Are headings specific ("Deploy to Netlify") rather than clever or
  vague ("Going live!")? Link to the most specific anchor possible, not to the
  top of a long page.
- **Right words, wrong place** (Tip 37). Writing can be good *and* misplaced.
  Judge content against the page's purpose and the reader's position in their
  journey: conceptual background in the middle of a task sequence, or install
  instructions on a reference page, may need moving, not rewriting. The heavy
  lifting of structure is the author's job, not the reader's.
- **Mise en place — prerequisites up front** (Tip 24). A guide should open by
  listing what the reader needs ready (account created, project configured,
  token in hand), so they aren't "baking fudge in the middle of making the ice
  cream it goes into." Mid-task detours to other tools or pages are a smell:
  move them into a prerequisites list at the top.
- **Don't re-document what's documented elsewhere** (Tip 24 again). Link to the
  canonical instructions (yours or a third party's) instead of restating them.
  Restated copies drift: when the other tool changes its settings menu, your
  guide breaks without you knowing. Prerequisites + links keep the maintenance
  burden where it belongs.
- **A page must stand on its own.** Readers arrive from search engines and
  deep links, not from page one. Check the page works for someone who landed
  here first: terms defined or linked, prerequisites stated, no reliance on
  context from "the previous page."

## 7. Instructions and procedures

- **Twist, then pull** (Tip 18: *twist \*then\* pull*, from title). Write steps
  in the order the reader performs them. "Pull the lever after twisting the
  cap" forces the reader to buffer and reorder; "Twist the cap, then pull the
  lever" doesn't. Within a step, put the condition or location before the
  action: "In `astro.config.mjs`, add…" beats "Add… in `astro.config.mjs`."
- **One action per step; a real sequence per procedure** (Tip 22: *and then*,
  from title). Long "and then… and then…" chains hide steps inside prose.
  Numbered steps, each with one action and its expected outcome, let readers
  keep their place and notice when something went wrong.
- **Say where code goes and what it does** (Tip 20: *add this code*, from
  title). "Add this code:" followed by a block is not an instruction. Name the
  file, the location in it, and what the addition accomplishes — then show the
  code.

## 8. Code samples

- **Title your code blocks** (Tip 7). Add the file name as the code block's
  title so readers know where the code lives (and which of several files a
  multi-block sequence is editing). In Markdown/MDX, that's the fence title
  (```` ```js title="src/components/Card.js" ````) or a lead-in line naming the
  file.
- **Samples are the most-copied part of the page.** They get pasted verbatim,
  so they must be correct, complete enough to run, and show the pattern you
  want reproduced (see Tip 34). Placeholder values should be unmistakably
  placeholders (`YOUR_API_KEY`, not `abc123`).
- **Keep prose and code in sync.** If the paragraph says the option is called
  `retries` and the block shows `retryCount`, one of them is lying (Tip 14).

## 9. Scope — what not to document

- **Don't doc when you can fix** (Tip 15). Don't document workarounds, confusing
  defaults, or error-prone steps — fix them (or file the issue and link it).
  In review: a paragraph explaining how to work around the product is a signal
  to escalate to the maintainers, not to polish the paragraph.
- **What problem does this solve?** (Tip 33: *what's your problem?*, from
  title). Features should be introduced in terms of the reader's problem or
  goal, not as an inventory of what exists. If a section can't say why a reader
  would want the thing, it isn't done.
- **Own the problems your project creates** (Tip 36: *not my problem* —
  "Creates and solves problems. Sometimes, in that order."). Where your
  project's choices create work for the reader (breaking changes, sharp edges,
  integration quirks), the docs should acknowledge and address them rather than
  staying silent because the fix lives in someone else's tool.

## 10. Changelogs and release notes

- **Release notes are docs too** (Tip 19: *be the change you want to see*).
  "Bug fixes and improvements" announces that something changed; readers need
  to know what is *different for them*. Describe each change from the reader's
  perspective — a person who uses the project, not someone who works on it.
  They care about changes required in *their* code, not changes in yours.
  "Refactored the resolver" → "Imports with a trailing slash now resolve to the
  directory's index file. If you relied on X, do Y."

## 11. Reviewing docs contributions

- **NWTWWHB — "not worse than what we had before"** (Tip 49). An inclusive
  standard for community docs: a contribution that makes the docs better —
  truer, clearer, more complete — is mergeable even if it isn't perfect.
  Perfect-or-nothing review standards stall docs and exclude contributors.
  Apply this when reviewing PRs and drafts: separate "must fix before merge"
  (untruths, broken instructions) from "could polish later" (style, structure),
  and say which is which.
- **Be the change** (Tip 19, spirit of): when you know the fix, propose the
  exact wording (suggestion blocks in PRs, "Try instead:" in reviews) rather
  than describing the fix abstractly.

---

## Confirmed tip index

Tips verified against the source (title, and content where captured). The
canonical text for every tip is at
`https://www.rainsberger.ca/docs-tips/`.

| #  | Title | Gist |
|----|-------|------|
| 1  | don't sound smart | Make your reader feel smart instead |
| 2  | make things happen | Say precisely what happens; avoid vague "makes X happen" |
| 3  | skip the pleasantries | Docs is not a conversation |
| 4  | make it a heading | Findable content is a (deep-linkable) heading |
| 7  | title your code blocks | Add file names as code block titles |
| 8  | don't forget | Trust the reader; drop "don't forget to…" |
| 13 | inadvertently inappropriate | Remove the word "appropriate" — it describes nothing |
| 14 | this post includes advice | Docs are the truth; word-level precision matters |
| 15 | don't doc when you can fix | Don't document workarounds — fix them |
| 16 | read this tip… if you want to | *(from title)* Don't hedge needed steps as optional |
| 18 | twist *then* pull | *(from title)* Steps in the order they're performed |
| 19 | be the change you want to see | Release notes from the reader's perspective |
| 20 | add this code | *(from title)* Say where code goes and why |
| 21 | prepare to be assimilated | Update existing sections when features change |
| 22 | and then | *(from title)* Real sequences, not prose chains |
| 23 | is not was | Present tense; document current state |
| 24 | mise en place | Prerequisites up front; don't re-document |
| 26 | use this | Replace vague "use" with the actual action |
| 31 | as not shown here | *(from title)* Don't reference content that isn't there |
| 32 | defining the obvious | Define terms; serve all language levels |
| 33 | what's your problem? | *(from title)* Frame features by the problem they solve |
| 34 | show what to do | Positive examples; don't teach anti-patterns |
| 36 | not my problem | "Creates and solves problems. Sometimes, in that order." |
| 37 | right words, wrong place | Placement along the reader journey matters |
| 39 | smarty pants | Simplify so meaningful words stand out |
| 41 | if you please | *(from title)* Drop "please" from instructions |
| 49 | NWTWWHB | "Not worse than what we had before" is an inclusive merge bar |

The remaining tips in the series continue the same themes; when network access
allows, fetch `https://www.rainsberger.ca/docs-tips/` for the full canonical
list before citing a tip number not in this table.
