---
title: 'Bakit gagamitin ninuman ang WCB?'
slug: 'tl/why'
description: Limang dahilan para piliin ang wcb — pinakamurang runtime reactivity, walang build step, HTML-native na attribute — at kung kailan hindi ito bagay.
---

Ang `WebComponent` base class ay nagbibigay ng kumpletong component development experience sa pinakamagaan na posibleng bigat: ang minimum code para pahusayin ang productivity.

May limang dahilan kung bakit umiiral ang WCB:

1. **Ito ang pinakamurang runtime reactivity na mabibili mo.** Pinakamaliit na footprint para sa kumpletong authoring experience: declarative templates, typed prop⇄attribute sync, lifecycle hooks, at state-preserving re-renders. Mas mahal ng 2x-4.7x sa wire ang Lit at FAST (brotli-compressed). Kung ang budget mo ay "isang component sa isang mostly-static page", angkop ang WCB kung saan ang Lit at FAST ang pinakamabigat na bagay sa wire.
2. **Zero tooling, totohanan.** Walang compiler, walang decorators, walang build step: isang `import` mula sa CDN sa loob ng `<script type="module">` ay gumagana na sa mga kasalukuyang browser. Ang buong mental model ay `static props` + `template` + apat na hooks, at ang naipadalang source ay nababasa sa isang upuan lang. Ang runtime ay 2.6 kB brotli-compressed ([sinukat](/tl/comparison/)).
3. **Ang attribute-first reactivity ay HTML-native.** Dahil ang props ay nagsi-serialize papunta sa attributes, ang initial state ay maaaring i-render ng _kahit anong_ server sa plain HTML (walang kailangang JS-framework SSR integration) at ang mga component ay nananatiling inspectable/debuggable sa devtools bilang ordinaryong attributes.
4. **Light DOM bilang default.** Ang mga global stylesheet, forms, at third-party CSS ay gumagana lang; at ang shadow DOM ay isang static field na lang ang layo kapag gusto mo ng encapsulation.
5. **Ang size gate ay isang pinamamahalaang value.** Bawat byte na idinagdag ay kailangang maging makatwiran sa [size change log](https://github.com/ayo-run/wcb/blob/v6/size-change-log.md), na pinapatupad ng `size-limit` budgets sa CI. Ang smart diffing ang pinakamalaking solong dagdag sa kasaysayan ng project at nagkanta ito ng 0.43 kB.

## Kailan mali ang pagpili sa WCB

Piliin nang tapat:

- **Mga reorderable list ng stateful items**: ang patching ay positional, hindi keyed; ang napanatiling focus/animation ay sumusunod sa posisyon, hindi sa item. Ang `repeat` ng Lit o ang FAST ang tamang humahawak nito.
- **High-frequency updates sa malalaking trees**: nagre-render nang synchronous ang WCB sa bawat prop write at dini-diff ang buong vnode tree; ang Lit/FAST ay ina-update lang ang apektadong bindings sa isang batched schedule.
- **SSR na may client hydration**: ang WCB ay nagre-render sa client pagkatapos ng `connectedCallback`, kaya walang hydration step. Kung kailangan mo ng server-rendered markup na nag-hy-hydrate sa lugar, gamitin ang Lit (`@lit-labs/ssr`).
- **Malaking team, long-horizon na design systems**: ang WCB ay isang library na iisang tao lang ang nag-maintain, may sadyang maliit na surface. Para sa suporta ng malaking organisasyon at ecosystem, piliin ang Lit (OpenJS Foundation) o FAST (Microsoft, pinapatakbo ang Fluent UI).

Para sa mga sinukat na numero at ang detalyadong paghahambing ng kakayahan sa likod ng mga claim na ito, tingnan ang [WCB at katulad na mga library](/tl/comparison/).
