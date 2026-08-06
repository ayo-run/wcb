# wcb documentation site

The public documentation for [`web-component-base`](https://npmx.dev/package/web-component-base), published to [webcomponent.io](https://webcomponent.io). Astro + [Starlight](https://starlight.astro.build).

The guides here double as the behavioural spec for the library: when the base class changes what it observably does, the matching guide changes in the same unit of work.

## Running it

From the repo root:

```sh
pnpm docs          # dev server
pnpm -F docs build # production build into docs/dist/
```

`pnpm build` at the root builds the _library_, not this site.

## Where things live

```
docs/
├── astro.config.mjs      # site URL, locales, sidebar, redirects
├── public/               # served as-is: favicons, robots.txt
└── src/
    ├── components/       # Starlight component overrides + SizeChart
    ├── lib/              # helpers for the generated endpoints
    ├── pages/            # llms.txt and llms-full.txt (Starlight owns every other route)
    ├── showcase.mjs      # the homepage showcase cards, one entry per live demo
    ├── content/
    │   ├── docs/         # every page — guides/, api/, and one folder per locale
    │   └── i18n/         # UI string overrides for locales Starlight ships no translation for
    └── content.config.ts
```

A page's route comes from its `slug` frontmatter, not its path. Adding a page to the sidebar is a separate step — the `sidebar` array in `astro.config.mjs`.

## Conventions

**Every page needs a `description`.** Starlight has no fallback: a page without one ships with no `<meta name="description">` and no `og:description` at all, which is what search results and link previews read. One line, specific about what the page covers. `test/docs-descriptions.test.mjs` enforces this.

**Translated pages carry their locale in every link.** Starlight does not rewrite links per locale, so a bare `/prop-access/` on a `/ja/` page drops the reader back into English for the rest of the visit. Both the `slug` (`slug: 'ja/prop-access'`) and every internal link (`](/ja/prop-access/)`) need the prefix, and cross-page anchors have to use the _translated_ heading's slug. `test/docs-i18n-links.test.mjs` enforces the first two; anchors are only caught by building.

**`/llms.txt` and `/llms-full.txt` are generated, never hand-edited.** They are built from the docs collection in sidebar order, so a new guide appears in both as soon as it is added to the sidebar — and a guide left out of the sidebar reaches neither. `test/docs-llms-txt.test.mjs` fails on a page the sidebar does not list. Both cover English only.

**The homepage showcase is data, not markup.** The cards come from `src/showcase.mjs`, which `ShowcaseGrid.astro` loops in every locale and `lib/llms.ts` expands into the corpus. Adding a demo is one entry in that object and no page edit — the contributor-facing version of this is `guides/showcase.md`, and `test/docs-showcase.test.mjs` guards the entry shape and that no homepage writes a card by hand.

**Figures come from `size-change-log.md`.** The headline size in `guides/library-size.md` tracks the latest row's min + brotli figure. The two must never disagree — see the root `AGENTS.md`.

## Deploying

`pnpm release:docs` (from the repo root) force-syncs `main` onto the `docs-release` branch of the `gh` remote. Netlify builds the site from that branch, so production only redeploys when this is run — not on every push to `main`. The script warns if local `main` differs from `gh/main`, since that commit is what ships. It pushes a single ref and never checks anything out, so a dirty working tree or another checked-out branch is fine.

`pnpm -F docs deploy` publishes an already-built `docs/dist/` straight to Netlify (needs `NETLIFY_SITE_ID`), bypassing the branch entirely — useful for a one-off, not the normal path.

There are no CI runners on this Forgejo instance, so nothing builds this site automatically.
