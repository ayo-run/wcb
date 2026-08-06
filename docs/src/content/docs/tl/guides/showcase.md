---
title: 'Idagdag ang demo mo sa showcase'
slug: 'tl/showcase'
description: 'Ang buong daan mula `npm create wcb@latest` hanggang sa isang card sa homepage: gumawa ng component, ilagay online ang demo page nito, at magdagdag ng isang entry sa data file ng showcase.'
---

May showcase ng mga demo card ang [docs homepage](/tl/), isa para sa bawat
live demo ng component na gawa sa wcb. Kahit sino ay puwedeng magdagdag ng
bagong entry para i-link ang sarili niyang mga demo page.

Gagabayan ka nito sa buong daan: paggawa ng component mula sa scaffold,
paglalagay ng demo page nito online, at pagpapadala ng entry. Kung tumatakbo na
ang component mo sa isang pampublikong pahina, magsimula sa [hakbang
3](#3-idagdag-ang-entry-mo).

## Ano ang kailangan ng isang card

Ang tinuturo ng isang card ay demo page, at kuwalipikado ang sa iyo kapag:

- **Pampubliko ang pahina**, naaabot sa `https://`, at mananatiling bukas.
  Puwedeng project site, GitHub Pages deployment, o isang pahina sa sarili mong
  domain.
- **Gawa sa wcb ang component doon** — nag-e-extend ito sa `WebComponent`, o
  direktang gumagamit ng [mga bahagi lamang](/tl/just-parts/) (`html`,
  `createElement`).
- **May custom element tag name ito**, na siyang magiging titulo ng card. Isang
  card, isang element.
- **May link pabalik sa [webcomponent.io](https://webcomponent.io) ang
  pahina** — sapat na ang isang nakikitang link, gaya ng "A
  [web-component-base](https://webcomponent.io) component" sa footer, na
  nakalagay na sa ginagawa ng `npm create wcb@latest`.

Hindi kailangang nakapaskil sa npm ang component, at hindi kailangang
maringal ang demo page. Inaalis ang mga entry na hindi na bumubukas ang demo,
kaya huwag munang ilista ang pahinang balak mong isara o hindi pa pampubliko.

## Bago ka magsimula

Kakailanganin mo ang mga ito:

- [Node.js](https://nodejs.org) (kasalukuyang LTS), kasama na ang npm
- [pnpm](https://pnpm.io/installation), na hinihingi ng docs site — tumatanggi
  itong mag-install sa ilalim ng ibang package manager
- Isang GitHub account, para sa pull request

## 1. Gumawa ng component

Laktawan papunta sa hakbang 2 kung mayroon ka na.

```sh
npm create wcb@latest my-element
cd my-element
npm install
npm run dev
```

Nagpi-print ang Vite ng lokal na URL. Ang `index.html` sa ugat ng proyekto ang
demo page, at nagre-render na ito ng `<my-element>`; ang component sa likod nito
ay `src/my-element.ts`. I-edit ang file na iyon at mag-a-update ang pahina
habang nagse-save ka.

Nasa [Pagsisimula](/tl/getting-started/) kung ano pa ang inihahanda ng
scaffold, at nasa [Paggamit](/tl/usage/) ang pagsulat mismo ng component.

## 2. Ilagay online ang demo page

```sh
npm run build
```

Binubuo niyan ang `index.html` at ang mga asset nito papunta sa `dist/`. (Ang
`npm run build:lib` ang kabila — pinapackage nito ang component para sa npm, at
walang pahinang nalilikha.)

I-deploy ang `dist/` sa kahit anong static host:
[Netlify](https://docs.netlify.com/site-deploys/create-deploys/),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site),
Cloudflare Pages, o isang direktoryo sa sarili mong server.

Ang paghahain mula sa subpath — `https://you.github.io/my-element/` sa halip na
sa ugat ng domain — ay nangangailangan ng prefix na iyon habang nagbi-build, o
bubukas ang pahina nang walang estilo at walang script:

```sh
npm run build -- --base=/my-element/
```

Buksan ang na-deploy na URL at tiyaking nagre-render ang component at may
link pabalik ang pahina sa [webcomponent.io](https://webcomponent.io) — nasa
footer na ito ng scaffold. Iyon ang URL na itinuturo ng card.

## 3. Idagdag ang entry mo

[I-fork ang `ayo-run/wcb`](https://github.com/ayo-run/wcb/fork) sa GitHub,
i-clone ang fork mo, at gumawa ng branch para sa pagbabago. Iisang file ang may
hawak ng bawat card:

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

Idagdag ang component mo bilang isa pang key, sa alpabetikong pagkakasunod:

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
  },
```

Iyon na ang buong pagbabago. Ang key ay ang tag name mo at siyang nagiging
titulo ng card, na inirerender bilang `<my-element>`; ang `href` ay binibigyan
ng external-link na marka at bumubukas sa bagong tab. Ang homepage at ang
tatlong salin nito ay pawang mula sa object na ito, kaya walang pahinang
ie-edit.

### Ang mga field

| Field          | Kailangan | Ano ito                                                                                                                          |
| -------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| _ang key_      | oo        | Ang tag name ng custom element gaya ng nakasulat sa HTML, naka-quote dahil may gitling. Ito ang titulo ng card, at walang dalawang entry na magkapareho. |
| `href`         | oo        | Ang demo page, bilang absolute `https://` URL.                                                                                     |
| `description`  | oo        | Isang linyang Ingles tungkol sa ginagawa ng component — ang katawan ng card. Mga 15 salita.                                          |
| `translations` | hindi     | Ang parehong linya sa ibang locale, naka-key sa locale prefix (`ja`, `zh-cn`, `tl`). Ang locale na wala rito ay nagpapakita ng Ingles. |

Magdagdag ng salin para sa alinmang wikang alam mong sulatin:

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
    translations: {
      tl: 'Isang linya tungkol sa ginagawa ng component',
    },
  },
```

## 4. I-preview ang site

Mula sa ugat ng clone mo:

```sh
pnpm install
pnpm docs
```

Inihahain ng Astro ang site sa `http://localhost:4321`. Nasa ibaba ng homepage
ang showcase, at ipinapakita ng `/ja/`, `/zh-cn/` at `/tl/` ang card mo gamit
ang deskripsiyong naaangkop.

```sh
pnpm test
```

Bumabagsak ang suite kapag may entry na kulang ang field, kapag hindi
`https://` na URL ang `href` nito, o kapag lumihis sa alpabetikong pagkakasunod
ang mga key.

## 5. Buksan ang pull request

I-commit ang iisang binagong file at magbukas ng pull request sa
[`ayo-run/wcb`](https://github.com/ayo-run/wcb):

```sh
git commit -am "docs: add <my-element> to the showcase"
```

Sapat nang paliwanag ang titulong iyon. Tatlong bagay ang tinitingnan ng
tagasuri: bumubukas ang demo page, gawa sa wcb ang component doon, at may link
pabalik sa webcomponent.io ang pahina. Kapag na-merge ang pull request, lilitaw
ang card mo sa susunod na build ng site.

Naka-mirror din ang repository sa [SourceHut](https://git.sr.ht/~ayoayco/wcb)
kung doon ka mas gustong magtrabaho.
