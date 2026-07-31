---
title: 'wcb vs Lit vs FAST: paghahambing ng sukat at features'
slug: 'tl/comparison'
description: Sinukat na bundle sizes at talahanayan ng features para sa web-component-base, Lit, Elena at FAST, kasama ang paraan para ulitin ang sukat.
---

Ang mga release simula sa v5 ay nagbigay sa `WebComponent` base class ng mas mahigpit na pagsunod sa custom elements specifications, mga pagpapahusay sa quality of life, at pangkalahatang robustness sa pamamagitan ng pagsasama ng mga inaasahan sa JS component authoring at matatag na HTML behaviors. Mayroon na tayong in-place re-rendering, HTML boolean semantics, at overrideable attribute converters, kasama ang iba pang mga pagpapahusay.

Ang page na ito ay naglalagay sa konteksto ng mga benepisyong ito at ang kanilang gastos: gaano kabigat ang WCB kumpara sa katulad na mga web-component library, ano ang binibili sa iyo ng bawat library kumpara sa pagsulat ng custom elements mula sa umpisa, at kailan ang tamang pagpili ang WCB.

## Sinukat na sukat: ang parehong component sa bawat library

Ang mga numero sa ibaba ay **sinukat** mula sa parehong minimal na counter component (isang reactive `count` prop, isang click handler, isang re-render sa bawat pagbabago) na isinulat sa bawat library, na naka-bundle gamit ang `esbuild --bundle --minify --format=esm`, at naka-compress gamit ang gzip (level 9) at brotli (quality 11). Ito ang tunay na "gastos ng iyong unang component": library runtime + component code, lahat ng dina-download ng browser.

Tingnan ito nang live: [Library comparison demo ↗](https://demo.webcomponent.io/examples/library-comparison/) — bawat counter na tumatakbo nang magkatabi, ang source ng bawat isa, at ang `measure.mjs` script na gumagawa ng table sa ibaba.

| Library                   | Version | Minified | Gzip    | Brotli     |
| ------------------------- | ------- | -------- | ------- | ---------- |
| **web-component-base**    | 6.1.4   | 6.6 kB   | 2.9 kB  | **2.6 kB** |
| `@elenajs/core`           | 1.0.0   | 9.1 kB   | 3.7 kB  | 3.4 kB     |
| `lit`                     | 3.3.3   | 15.3 kB  | 5.9 kB  | 5.3 kB     |
| `@microsoft/fast-element` | 3.0.1   | 44.8 kB  | 13.6 kB | 12.2 kB    |
| vanilla `HTMLElement`     | -       | 0.6 kB   | 0.3 kB  | 0.2 kB     |

Para sa iskala: kahit pagkatapos ng lahat ng gawain mula v5.2–v6.1, ang WCB counter ay **humigit-kumulang 23% na mas maliit kaysa sa Elena, 52% na mas maliit kaysa sa Lit, at 79% na mas maliit kaysa sa FAST**.

## Paghahambing ng mga feature

Ano ang ibinibigay sa iyo ng bawat library kaysa sa direktang pagpalawig mula sa `HTMLElement`, ang boilerplate na hindi mo na kailangang isulat nang manu-mano:

| Kakayahan                        | WCB 6.1                                                            | Lit 3.3                                                  | Elena 1.0                               | FAST 3.0                                         |
| --------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Declarative templates             | ✅ `html` tagged templates (htm) o plain strings                   | ✅ `lit-html` tagged templates                           | ✅ `html` tagged templates              | ✅ typed templates na may binding expressions    |
| Reactive props ⇄ attributes       | ✅ `static props`, overrideable converters                         | ✅ `static properties` na may converters                 | ✅ `static props`, opt-in reflection    | ✅ `@attr` / observables                         |
| Estratehiya sa pag-update         | In-place patch (index-based, non-keyed)                            | Part-based: ang naapektuhang bindings lang ang na-a-update, keyed `repeat` | Batched re-renders            | Fine-grained observable bindings, keyed `repeat` |
| Nagpapanatili ng DOM state sa re-render | ✅ mula v5.2                                                  | ✅                                                       | ✅                                      | ✅                                               |
| Update batching / scheduling      | ⚠️ nagre-render sa bawat prop write                                 | ✅ async batched, `updateComplete`                       | ✅ batched, `updateComplete`            | ✅ queued/batched                                |
| Keyed list reconciliation         | ⚠️ positional                                                       | ✅ `repeat` directive                                    | ❌                                      | ✅ `repeat` na may recycling controls            |
| Light DOM bilang default          | ✅ (shadow DOM opt-in sa pamamagitan ng `static shadowRootInit`)    | ❌ shadow DOM bilang default                             | ✅ (shadow opt-in)                      | ❌ shadow DOM bilang default                     |
| Scoped styles                     | ✅ `static styles` + constructable stylesheets (kailangan ng shadow root) | ✅ shadow-scoped CSS                               | ✅ scoped nang walang shadow DOM        | ✅ shadow-scoped + design tokens                 |
| SSR / kwento ng hydration         | ✅ attribute-driven na state na nagre-render mula sa kahit anong server | ✅ `@lit-labs/ssr` + hydration                     | ✅ server-rendered markup + hydration utilities | ⚠️ experimental na SSR                    |
| Gumagana nang walang build tooling | ✅ import mula sa CDN, walang compiler                             | ✅ (posible ang buildless, ang decorators ay kailangan ng tooling) | ✅                              | ⚠️ praktikal na may tooling                      |
| Editor/IDE tooling                | ✅ typed props + [CEM analyzer plugin](/tl/cem-plugin/)                | ✅ malawak (analyzer, TS decorators, IDE plugins)        | ✅ CEM-focused                          | ✅ TS-first                                      |
| Lifecycle hooks                   | `onInit`, `afterViewInit`, `onChanges`, `onDestroy`                 | kumpletong reactive update lifecycle                     | `willUpdate`, `firstUpdated`, `updated` | kumpletong lifecycle + behaviors                 |
| Suporta / ecosystem               | iisang maintainer, maliit na surface                                | OpenJS Foundation (idinonate ng Google noong 2025), malaking ecosystem | bago (2026), iisang may-akda | Microsoft, pinapatakbo ang Fluent UI             |

:::note[Bakit wala rito ang 11ty WebC]
Ang WebC ay isang compile-time tool: nire-resolve nito ang mga component habang naka-build ang Eleventy at naglalabas ng plain HTML na walang client runtime. Ang bawat row sa itaas ay tungkol sa ginagawa ng isang library _sa browser habang tumatakbo_, kaya ang isang side-by-side na paghahambing ay parang sinusukat ang dalawang magkaibang bagay. Kung static ang iyong mga component sa build time, ibang problema ang sinasagot ng WebC.
:::

Para sa kung ano ang kabuluhan ng mga numero at kakayahang ito (at kung kailan hindi), tingnan ang [Bakit gagamitin ninuman ang WCB?](/tl/why/).

---

_Muling sinukat ang WCB noong 2026-07-24 gamit ang v6.1.4; ang ibang mga library ay sinukat noong 2026-07-19, gamit ang esbuild, Node zlib (gzip −9, brotli q11), sa mga naka-pin na version sa itaas. Metodolohiya: parehong counter component sa bawat library, naka-bundle bawat library, naka-compress. Patakbuhin mo ulit ito sa sarili mo — ang mga counter at ang [`measure.mjs`](https://demo.webcomponent.io/examples/library-comparison/) script ay nasa demo workspace (`demo/examples/library-comparison/`). Ang benchmark na ito ay madaling ma-reproduce gamit ang mga version na naka-pin sa itaas._
