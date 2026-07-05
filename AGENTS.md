# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What this is

`web-component-base` (WCB) is a zero-dependency, ~1KB base class (`WebComponent extends HTMLElement`) for building reactive custom elements. Authors subclass it and define only a `template` and `static props`; any change to an observed attribute automatically re-renders the component.

## Commands

- `pnpm test` — run the vitest suite once (coverage is always on via `vitest.config.mjs`).
- `pnpm test:watch` — vitest in watch mode.
- Run a single file / test: `pnpm vitest --run test/WebComponent.test.mjs` or filter by name with `-t "has a readonly template prop"`.
- `pnpm lint` — ESLint (flat config in `eslint.config.mjs`, includes `eslint-plugin-jsdoc`).
- `pnpm format` — Prettier over the repo.
- `pnpm build` — `tsc` emits `.d.ts` types, then `copy:source` uses esbuild to minify/bundle `src/*.js` + `src/utils/*` into `dist/` as ESM. **`dist/` is what gets published; `src/` is shipped as the readable source.**
- `pnpm size-limit` — enforces the byte budgets declared in `package.json` `size-limit` (e.g. `WebComponent.js` ≤ 1.2 KB). Keep additions tiny; this gate is a core project value.
- `pnpm docs` — run the Astro docs site (`docs/` workspace) locally.
- `pnpm demo` — run the Vite examples showcase (`demo/` workspace) locally; `pnpm demo:build` builds it.
- `pnpm test:e2e` — run the browser e2e specs (`test/e2e/`) in Chromium via Vitest browser mode; `pnpm test:all` runs unit + e2e.

pnpm is mandatory (a `preinstall` `only-allow pnpm` guard enforces it). This is a pnpm workspace with two sub-packages: `docs/` (Astro docs site) and `demo/` (Vite examples showcase, which consumes the root `web-component-base` package as a `workspace:*` dependency). The runnable example sources live in `demo/examples/` and import the package by name (`web-component-base`), not via relative `src/` paths.

The demo shares one app shell: `demo/shell.css` (design tokens + component styles, linked by the landing page and every example) and `demo/shell.js` (defines `<app-header>` — itself a `WebComponent` — and `prepend`s it to each example page; `prepend` never reparents the example's own elements, so their lifecycle is untouched). Every example page links both. Keep new examples consistent by adding `<link rel="stylesheet" href="../../shell.css" />` and `<script type="module" src="../../shell.js"></script>`.

## Architecture

Everything is in `src/` (entry point `src/index.js` re-exports `WebComponent` and `html`):

- **`src/WebComponent.js`** — the base class and the whole reactivity engine. The flow:
  - `static props` (a camelCase → default-value map) is the single source of truth. `observedAttributes` is derived from it by kebab-casing each key.
  - The constructor deep-clones `static props`, records each prop's `typeof` in a private `#typeMap`, reflects defaults to attributes, and wraps the props object in a **Proxy** (`#handler`). Writing `this.props.someProp = x` serializes the value and calls `setAttribute` (kebab-case), which triggers `attributeChangedCallback` → `render()`. That attribute-write-driven cycle *is* the reactivity model — there is no separate scheduler.
  - The Proxy enforces type stability against `#typeMap` and throws `TypeError` on a type change.
  - Lifecycle hooks authors may override: `onInit()` (connected), `afterViewInit()` (after first render), `onDestroy()` (disconnected), `onChanges({property, previousValue, currentValue})` (attribute changed). Note `onChanges` currently receives the **kebab-case** `property`.
  - `template` is a read-only getter (assigning to it throws). `render()` branches on its type: a **string** template is assigned to `innerHTML` directly; an **object** template (a vnode tree from `html`) is diffed against the previous tree with `JSON.stringify` and, on change, rebuilt via `createElement` + `replaceChildren`. `render()` can be called manually or overridden entirely (e.g. to delegate to `lit-html`).
  - `static styles` are applied as a constructable `CSSStyleSheet` via `adoptedStyleSheets`, which **only works with a shadow root** — set `static shadowRootInit` to opt into shadow DOM.

- **`src/html.js`** — the `html` tagged-template function. It is a bundled/minified copy of [`htm`](https://github.com/developit/htm) bound to a hyperscript `h(type, props, children)` that produces plain `{type, props, children}` vnodes. License lives in `vendors/htm/`.

- **`src/utils/`** — the serialization layer that bridges typed JS values and string attributes: `serialize`/`deserialize` (JSON round-trip for number/boolean/object, passthrough for strings), `get-camel-case`/`get-kebab-case` (attribute ⇄ prop name conversion), and `create-element` (turns a vnode tree into real DOM nodes, resolving props to DOM properties/attributes and applying `style` objects). `src/utils/index.js` re-exports all of them.

## Testing notes

- Environment is **happy-dom** (set in `vitest.config.mjs`), so real custom-element registration works. Any component under test must be registered with `customElements.define(...)` before instantiation, or the browser throws.
- Tests live both in `test/` and colocated next to source as `*.test.mjs` (e.g. `src/utils/serialize.test.mjs`). Coverage is restricted to `src`.
- happy-dom does not perfectly match browser semantics (notably custom-element upgrade ordering); be skeptical of behaviors that depend on real-browser timing.

## Known correctness work in flight

The README's top-of-file note flags a set of state-corruption fixes as the current priority — constructor attribute writes, empty-string/removed-attribute handling silently skipping `render()`/`onChanges`, the props Proxy's first-write type lock, and unsafe `structuredClone` of `static props` defaults. Keep these in mind when touching `WebComponent.js`; several current behaviors described above are the *target of* upcoming changes.

## Docs

The public documentation site is an Astro + Starlight app in `docs/` (published to webcomponent.io). Guide content is Markdown/MDX under `docs/src/content/docs/guides/`; it doubles as the behavioral spec for the library.
