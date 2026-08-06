---
title: 'Add your demo to the showcase'
slug: showcase
description: The whole path from `npm create wcb@latest` to a card on the homepage — build a component, put its demo page online, and add one entry to the showcase data file.
---

The [docs homepage](/) features a showcase of demo cards, one per live demo of
a component built with wcb. Anyone can add a new entry to link to their own
demo pages.

This guide walks you through the whole path: scaffolding a component, putting
its demo page online, and sending the entry. If your component already runs on
a public page, start at [step 3](#3-add-your-entry).

## What a card needs

A card points at a demo page, and yours qualifies when:

- **The page is public**, reachable over `https://`, and stays up. A project
  site, a GitHub Pages deployment, or one page on your own domain all count.
- **The component on it is built with wcb** — it extends `WebComponent`, or
  uses [just the parts](/just-parts/) (`html`, `createElement`) directly.
- **It has a custom element tag name**, which becomes the card's title. One
  card is one element.
- **The page links back to [webcomponent.io](https://webcomponent.io)** — a
  visible link is enough, such as "A
  [web-component-base](https://webcomponent.io) component" in the footer, which
  is what `npm create wcb@latest` already puts there.

The component does not have to be published to npm, and the demo page does not
have to be elaborate. Entries whose demo stops loading get removed, so hold off
on listing a page you plan to take down or is not yet available publicly.

## Before you start

You will need the following:

- [Node.js](https://nodejs.org) (current LTS), which includes npm
- [pnpm](https://pnpm.io/installation), which the docs site requires — it
  refuses to install under any other package manager
- A GitHub account, for the pull request

## 1. Build a component

Skip to step 2 if you already have one.

```sh
npm create wcb@latest my-element
cd my-element
npm install
npm run dev
```

Vite prints a local URL. `index.html` at the project root is the demo page and
already renders `<my-element>`; the component behind it is `src/my-element.ts`.
Edit that file and the page updates as you save.

[Getting Started](/getting-started/) describes what else the scaffold sets up,
and [Usage](/usage/) covers writing the component itself.

## 2. Put the demo page online

```sh
npm run build
```

That builds `index.html` and its assets into `dist/`. (`npm run build:lib` is
the other one — it packages the component for npm, and produces no page.)

Deploy `dist/` to any static host: [Netlify](https://docs.netlify.com/site-deploys/create-deploys/),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site),
Cloudflare Pages, or a directory on your own server.

Serving from a subpath — `https://you.github.io/my-element/` rather than a
domain root — needs that prefix at build time, or the page loads with no
styles and no script:

```sh
npm run build -- --base=/my-element/
```

Open the deployed URL and confirm the component renders, and that the page
links back to [webcomponent.io](https://webcomponent.io) — the scaffold's
footer carries one. That URL is what the card links to.

## 3. Add your entry

[Fork `ayo-run/wcb`](https://github.com/ayo-run/wcb/fork) on GitHub, clone your
fork, and make a branch for the change. One file holds every card:

```js title="docs/src/showcase.mjs"
export const showcase = {
  'mastodon-content': {
    href: 'https://mastodon-content.webcomponent.io',
    description:
      'Progressively enhances a Mastodon status: rewrites hashtag links and marks hashtag bars',
  },
  'status-indicator': {
    href: 'https://status-indicator.webcomponent.io',
    description: 'Colored circles that can pulse',
  },
}
```

Add your component as one more key, in alphabetical position:

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
  },
```

That is the whole change. The key is your tag name and becomes the card's
title, rendered as `<my-element>`; the `href` gets an external-link marker and
opens in a new tab. The homepage and its three translations all render from
this object, so there is no page to edit.

### The fields

| Field          | Required | What it is                                                                                                                               |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| _the key_      | yes      | The custom element's tag name as it appears in HTML, quoted because of the hyphen. It is the card's title, and no two entries share one. |
| `href`         | yes      | The demo page, as an absolute `https://` URL.                                                                                            |
| `description`  | yes      | One line of English on what the component does — the card's body. Roughly 15 words.                                                      |
| `translations` | no       | The same line in other locales, keyed by locale prefix (`ja`, `zh-cn`, `tl`). A locale you leave out shows the English line.             |

Add a translation for any language you write:

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
    translations: {
      ja: 'コンポーネントの説明を一行で',
    },
  },
```

## 4. Preview the site

From the root of your clone:

```sh
pnpm install
pnpm docs
```

Astro serves the site at `http://localhost:4321`. The showcase is at the bottom
of the homepage, and `/ja/`, `/zh-cn/` and `/tl/` show your card with whichever
description applies.

```sh
pnpm test
```

The suite fails if an entry is missing a field, its `href` is not an `https://`
URL, or the keys have fallen out of alphabetical order.

## 5. Open the pull request

Commit the one changed file and open a pull request against
[`ayo-run/wcb`](https://github.com/ayo-run/wcb):

```sh
git commit -am "docs: add <my-element> to the showcase"
```

The title is all the description the change needs. A reviewer checks three
things: the demo page loads, the component on it is built with wcb, and the
page links back to webcomponent.io. Once the pull request is merged, your card
appears the next time the site is built.

The repository is also mirrored on [SourceHut](https://git.sr.ht/~ayoayco/wcb)
if you would rather work from there.
