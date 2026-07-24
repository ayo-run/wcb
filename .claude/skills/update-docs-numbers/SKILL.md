---
name: update-docs-numbers
description: Re-measure the library-size benchmark and update every size/version number in the docs and demo to the latest results. Use whenever the user asks to refresh, update, or re-measure the comparison numbers, the size figures in the docs, or the "why/comparison" guides — e.g. after bumping a pinned library version in demo/package.json, after a base-class size change lands in size-change-log.md, or before a release. Trigger on phrasings like "update the docs numbers", "re-run the size comparison", "the comparison table is stale", "refresh the library sizes".
---

# Update docs numbers

The size and version numbers quoted across the docs and demo are **measured**,
not hand-written, and they drift the moment a pinned library version bumps or a
base-class size change lands. This skill regenerates the numbers from their two
sources of truth and propagates them to every place that quotes them, so the
docs, the demo, and the benchmark never disagree.

Do the whole sweep in one pass — a partial update (e.g. the guide table but not
the demo table) is worse than none, because it hides the drift.

## The two sources of truth — don't conflate them

There are **two independent numbers**, measured different ways. Mixing them up
is the classic mistake:

1. **The comparison table** — "cost of your first component": each library's
   runtime **plus** a minimal counter, bundled and compressed. Produced by
   `demo/examples/library-comparison/measure.mjs`. The WCB row here is ~**2.6 kB
   brotli**. This drives the guide's comparison table, the percentages, and the
   demo page.
2. **The base-class size** — just `WebComponent` on its own, min + brotli via
   `size-limit`. This is ~**1.98 kB** and lives in `size-change-log.md` (latest
   row) and is the headline in `library-size.md`. It is **not** the 2.6 kB
   counter number.

`library-size.md` uses source 2. Everything else uses source 1. Never copy 2.6
into the base-class line or 1.98 into the comparison table.

## Step 1 — regenerate source 1 (the benchmark)

The benchmark bundles WCB from the published `dist/`, so build first:

```sh
pnpm build                                    # from repo root — refreshes dist/
cd demo/examples/library-comparison
node measure.mjs --json                        # raw bytes — use for percentages
node measure.mjs --md                          # Markdown table — what the guide embeds
```

- `--json` gives exact byte counts. **Compute all percentages/ratios from these
  raw bytes, not from the rounded kB**, or the rounding won't match (e.g. WCB
  vs Elena reads ~21% from bytes but ~24% from rounded 2.6/3.4 kB).
- `--md` gives the table body the guide uses; the kB values also feed the demo.
- The library versions in the output come from the pinned deps in
  `demo/package.json` (and WCB's own `package.json`). If the user's goal was to
  pick up a new library release, bump that pin, re-run `pnpm --filter demo install`,
  then re-measure.

## Step 2 — regenerate source 2 (the base-class size)

```sh
pnpm size-limit        # from repo root; the WebComponent.js row is min+brotli
```

The authoritative figure for prose is the **latest row of `size-change-log.md`**
(its min+brotli column). Per AGENTS.md, `library-size.md` must match that row
exactly. If a size change just landed but no log row was added, that is a
separate omission — flag it; don't invent a number.

## Step 3 — compute the derived figures from raw brotli bytes

From the `--json` brotli byte counts (`wcb`, `elena`, `lit`, `fast`):

- **"N% smaller than X"** = `round((X_brotli - wcb_brotli) / X_brotli * 100)`.
- **"Lit and FAST cost 2x–Nx more"** = `lit_brotli / wcb_brotli` … `fast_brotli / wcb_brotli`,
  rounded to one decimal (low end floored to `2x`-style, high end e.g. `4.7x`).
- **Feature-comparison version labels** use `major.minor` of each measured
  version (e.g. `6.1.4` → "WCB 6.1", `3.3.3` → "Lit 3.3").

## Step 4 — propagate to every location

Update all of these. The checklist is the point — each holds a copy that drifts.

**`docs/src/content/docs/guides/comparison.md`**
- The **measured size table** — every library's Version / Minified / Gzip /
  Brotli (from `--md`).
- The **"~X% smaller than Elena, …"** sentence under it (Step 3).
- The **feature-comparison table header** version labels (`WCB 6.1`, `Lit 3.3`,
  `Elena 1.0`, `FAST 3.0`) — `major.minor` of the measured versions.
- The **footer methodology line** — dates and the WCB version measured. Set the
  WCB date to today (`date +%Y-%m-%d`); only change the "others measured" date if
  the external pins actually changed this run.

**`docs/src/content/docs/guides/why.md`**
- The **"Lit and FAST cost 2x–Nx more"** ratio (Step 3).
- The **"runtime is 2.6 kB brotli-compressed"** figure — this is the WCB
  **counter** brotli from source 1, and it appears **twice** (reasons 1 and 2).

**`docs/src/content/docs/guides/library-size.md`**
- The **base-class "N kB (min + brotli)"** headline — source 2, matching the
  latest `size-change-log.md` row.

**`demo/examples/library-comparison/index.html`**
- The five **counter-card `<span class="size">`** brotli values.
- The **Output `<table class="sizes">`** rows — WCB version + every
  Minified/Gzip/Brotli cell (must equal the guide's table).
- The **"about X% under Elena, Y% under Lit, Z% under FAST"** sentence.

`measure.mjs` and the counter sources under `counters/` are the generators — do
**not** hand-edit their numbers.

## Step 5 — verify no stale copy survives

Sweep for leftover old values so no copy is missed:

```sh
cd /home/dev/Projects/wcb
# old WCB counter/base numbers, old versions — replace the search terms with
# whatever the PREVIOUS values were:
grep -rn "6\.6 kB\|6\.7 kB\|<old-version>\|<old-percent>%" docs/src demo/examples/library-comparison
```

Confirm the guide's size table and the demo's Output table are cell-for-cell
identical, and that the WCB counter brotli (source 1) and the base-class figure
(source 2) each appear only where they belong. Note anything you changed and the
before→after for the headline numbers in your summary to the user.
