---
title: 'wcb vs Lit vs FAST: size and feature comparison'
slug: comparison
description: Measured bundle sizes and a feature-by-feature table for web-component-base, Lit, Elena and FAST, with the method to reproduce the numbers.
---

The releases since v5 gave the `WebComponent` base class a stricter compliance with custom elements specifications, quality of life improvements, and overall robustness by combining JS components authoring expectations and stable HTML behaviors. We now have in-place re-rendering, HTML boolean semantics and overrideable attribute converters, among other improvements.

This page puts these benefits and their cost in context: how much does WCB weigh in size compared to similar web-component libraries, what does each library buy you over writing custom elements from scratch, and when is WCB the right choice.

## Measured size: the same component in each library

Numbers below are **measured** from the same minimal counter component (one reactive `count` prop, a click handler, a re-render on change) written in each library, bundled with `esbuild --bundle --minify --format=esm`, and compressed with gzip (level 9) and brotli (quality 11). This is the real "cost of your first component": library runtime + component code, everything the browser downloads.

See it live: [Library comparison demo ↗](https://demo.webcomponent.io/examples/library-comparison/) — every counter running side by side, the source of each, and the `measure.mjs` script that produces the table below.

| Library                   | Version | Minified | Gzip    | Brotli     |
| ------------------------- | ------- | -------- | ------- | ---------- |
| **web-component-base**    | 6.2.0   | 6.6 kB   | 2.9 kB  | **2.6 kB** |
| `@elenajs/core`           | 1.0.1   | 9.1 kB   | 3.7 kB  | 3.4 kB     |
| `lit`                     | 3.3.3   | 15.3 kB  | 5.9 kB  | 5.3 kB     |
| `@microsoft/fast-element` | 3.0.1   | 44.8 kB  | 13.6 kB | 12.2 kB    |
| vanilla `HTMLElement`     | -       | 0.6 kB   | 0.3 kB  | 0.2 kB     |

For scale: even after all of the v5.2–v6.2 work, the WCB counter is **~23% smaller than Elena, ~52% smaller than Lit, and ~79% smaller than FAST**.

## Feature comparison

What each library gives you beyond extending directly from `HTMLElement`, the boilerplate you no longer write by hand:

| Capability                       | WCB 6.2                                                                            | Lit 3.3                                                     | Elena 1.0                                                                            | FAST 3.0                                           |
| -------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Declarative templates            | ✅ `html` tagged templates (htm) or plain strings                                  | ✅ `lit-html` tagged templates                              | ✅ `html` tagged templates                                                           | ✅ typed templates with binding expressions        |
| Reactive props ⇄ attributes      | ✅ `static props`, overrideable converters                                         | ✅ `static properties` with converters                      | ✅ `static props`, opt-in reflection                                                 | ✅ `@attr` / observables                           |
| Update strategy                  | In-place patch (index-based, non-keyed)                                            | Part-based: only touched bindings update, keyed `repeat`    | Batched re-renders                                                                   | Fine-grained observable bindings, keyed `repeat`   |
| Preserves DOM state on re-render | ✅                                                                                 | ✅                                                          | ✅                                                                                   | ✅                                                 |
| Update batching / scheduling     | ⚠️ renders per prop write                                                          | ✅ async batched, `updateComplete`                          | ✅ batched, `updateComplete`                                                         | ✅ queued/batched                                  |
| Keyed list reconciliation        | ⚠️ positional                                                                      | ✅ `repeat` directive                                       | ⚠️ positional morph                                                                  | ✅ `repeat` with recycling controls                |
| Light DOM by default             | ✅ (shadow DOM opt-in via `static shadowRootInit`)                                 | ❌ shadow DOM by default                                    | ✅ (shadow opt-in)                                                                   | ❌ shadow DOM by default                           |
| Scoped styles                    | ⚠️ `static styles` needs shadow opt-in via `static shadowRootInit`                 | ✅ shadow-scoped CSS (shadow DOM is the default)            | ✅ light DOM via generated `@scope` CSS files (CLI); `static styles` needs shadow opt-in | ✅ shadow-scoped + design tokens (shadow default)  |
| SSR / hydration story            | ⚠️ typed prop state from attributes — any server, no server-side JS; client re-renders | ⚠️ `@lit-labs/ssr` + hydration (labs = prerelease)      | ⚠️ experimental alpha; client re-renders                                             | ⚠️ experimental SSR                                |
| Works with zero build tooling    | ✅ import from CDN, no compiler                                                    | ✅ (buildless possible, decorators need tooling)            | ✅                                                                                   | ⚠️ practical with tooling                          |
| Editor/IDE tooling               | ✅ typed props + [CEM analyzer plugin](/cem-plugin/)                               | ✅ extensive (analyzer, TS decorators, IDE plugins)         | ✅ CEM-focused                                                                       | ✅ TS-first                                        |
| Lifecycle hooks                  | `onInit`, `afterViewInit`, `onChanges`, `onDestroy`                                | full reactive update lifecycle                              | `willUpdate`, `firstUpdated`, `updated`                                              | full lifecycle + behaviors                         |
| Backing / ecosystem              | solo maintainer, intentionally small surface in one package                                                   | OpenJS Foundation (donated by Google 2025), large ecosystem | new (2026), solo-authored                                                            | Microsoft, powers Fluent UI                        |

:::note[Why 11ty WebC isn't here]
WebC is a compile-time tool: it resolves components during an Eleventy build and ships plain HTML with no client runtime. Every row above is about what a library does _in the browser at runtime_, so a side-by-side comparison would be measuring two different things. If your components are static at build time, WebC solves a different problem.
:::

For what these numbers and capabilities add up to (and when they don't) see [Why would anyone use WCB?](/why/).

## SSR / hydration story comparisons

Three of the four SSR cells quote that package's **own stability designation**. `@lit-labs/ssr` is
the most mature; though it has carried Lit Labs' pre-release notice ("may receive breaking changes or
stop being supported") since 2021, it sits at major version 4, ships actively, and drives a
maintained Eleventy integration. `@elenajs/ssr` is an alpha and says so, and FAST calls its own SSR
experimental.

WCB has no SSR package at all, so its ⚠️ means something different from the other three. The state
half already works: every declared prop initializes from server-written attributes, parsed through
its declared type, from any server that can print HTML. The DOM half does not — the first client
render replaces the server markup rather than adopting it, so the server HTML is paint-only.
`@elenajs/core` behaves the same way as WCB here: a dynamic component's first client render replaces
the server markup rather than adopting it.

---

_All libraries measured 2026-08-09 — WCB at v6.2.0 — with esbuild, Node zlib (gzip −9, brotli q11), at the pinned versions above. Methodology: identical counter component per library, bundled per library, compressed. Re-run them yourself — the counters and the [`measure.mjs`](https://demo.webcomponent.io/examples/library-comparison/) script live in the demo workspace (`demo/examples/library-comparison/`). The benchmark is trivially reproducible with the versions pinned above._
