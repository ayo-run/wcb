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
- `pnpm -F storybook dev` — run the Storybook testing ground (`storybook/`) locally; `pnpm -F storybook build` builds it. Both run `cem analyze` first to regenerate `custom-elements.json`. The CEM config imports the plugin from the **published subpath** (`web-component-base/cem-plugin` → `dist/`), so run `pnpm build` at the root first.
- `pnpm test:e2e` — run the browser e2e specs (`test/e2e/`) via Vitest browser mode (Playwright). Defaults to Chromium; `pnpm test:e2e:firefox` / `:webkit` / `:all` target the other engines (the `E2E_BROWSERS` env var, comma-separated, selects instances). `pnpm test:all` runs unit + default e2e.

pnpm is mandatory (a `preinstall` `only-allow pnpm` guard enforces it). This is a pnpm workspace with three sub-packages: `docs/` (Astro docs site), `demo/` (Vite examples showcase, which consumes the root `web-component-base` package as a `workspace:*` dependency), and `storybook/` (Storybook testing ground — it writes no components of its own, it builds stories over the `demo/examples/` components so the CEM plugin is exercised against real ones). The runnable example sources live in `demo/examples/` and import the package by name (`web-component-base`), not via relative `src/` paths.

The demo shares one app shell: `demo/shell.css` (design tokens + component styles, linked by the landing page and every example) and `demo/shell.js` (defines `<app-header>` — itself a `WebComponent` — and `prepend`s it to each example page; `prepend` never reparents the example's own elements, so their lifecycle is untouched). Every example page links both. Keep new examples consistent by adding `<link rel="stylesheet" href="../../shell.css" />` and `<script type="module" src="../../shell.js"></script>`.

## Architecture

Everything is in `src/` (entry point `src/index.js` re-exports `WebComponent` and `html`):

- **`src/WebComponent.js`** — the base class and the whole reactivity engine. The flow:
  - `static props` (a camelCase → default-value map) is the single source of truth. `observedAttributes` is derived from it by kebab-casing each key.
  - The constructor deep-clones `static props`, records each prop's `typeof` in a private `#typeMap`, reflects defaults to attributes, and wraps the props object in a **Proxy** (`#handler`). Writing `this.props.someProp = x` serializes the value and calls `setAttribute` (kebab-case), which triggers `attributeChangedCallback` → `render()`. That attribute-write-driven cycle *is* the reactivity model — there is no separate scheduler.
  - The Proxy enforces type stability against `#typeMap` and throws `TypeError` on a type change.
  - Lifecycle hooks authors may override: `onInit()` (connected), `afterViewInit()` (after first render), `onDestroy()` (disconnected), `onChanges({property, previousValue, currentValue})` (attribute changed). Note `onChanges` currently receives the **kebab-case** `property`.
  - `template` is a read-only getter (assigning to it throws). `render()` branches on its type: a **string** template is assigned to `innerHTML` directly; an **object** template (a vnode tree from `html`) is diffed against the previous tree with `JSON.stringify` and, on change, built via `createElement` + `replaceChildren` on the *first* render and **reconciled in place** (`patchChildren`, see `src/utils/patch.mjs`) on every render after that, so focus/caret/uncommitted input values survive. `render()` can be called manually or overridden entirely (e.g. to delegate to `lit-html`).
  - `static styles` are applied as a constructable `CSSStyleSheet` via `adoptedStyleSheets`, which **only works with a shadow root** — set `static shadowRootInit` to opt into shadow DOM.

- **`src/html.js`** — the `html` tagged-template function. It is a bundled/minified copy of [`htm`](https://github.com/developit/htm) bound to a hyperscript `h(type, props, children)` that produces plain `{type, props, children}` vnodes. License lives in `vendors/htm/`.

- **`src/utils/`** — the serialization layer that bridges typed JS values and string attributes: `serialize`/`deserialize` (JSON round-trip for number/boolean/object, passthrough for strings), `get-camel-case`/`get-kebab-case` (attribute ⇄ prop name conversion), `create-element` (turns a vnode tree into real DOM nodes, resolving props to DOM properties/attributes and applying `style` objects — its `applyProp` is the single source of truth for the prop→DOM rule), and `patch` (index-based, non-keyed reconciler used by re-renders; it reuses same-tag elements, applies prop adds/changes/**removals** via `applyProp`, and trims trailing nodes). `src/utils/index.js` re-exports all of them.

## Definition of done for a behavior change

Any change to observable behavior ships as one unit — code alone is an incomplete change. Land all four together:

1. **Tests** — unit specs in `test/` (or colocated `*.test.mjs`) covering the new contract *and* the old behavior it replaces. Add a `test/e2e/` spec whenever the behavior depends on something happy-dom cannot model faithfully — CSS selector matching, computed styles, custom-element upgrade timing.
2. **Demo examples** — a runnable example under `demo/examples/` that demonstrates the behavior, linked from a card in `demo/index.html`. Update any existing example the change affects, including ones that now emit a console warning or model a discouraged pattern.
3. **Documentation** — the guide under `docs/src/content/docs/guides/` that doubles as the behavioral spec. For a breaking change, also update the `README.md` banner with the migration consumers have to perform.
4. **Size budget** — `pnpm size-limit` stays green. If an addition genuinely needs more headroom, raise the budget in `package.json` deliberately and say so in the change description; never let it drift silently.

Verify with `pnpm test:all` (unit + types + e2e across all engines) before calling the change done.

## Testing notes

- Environment is **happy-dom** (set in `vitest.config.mjs`), so real custom-element registration works. Any component under test must be registered with `customElements.define(...)` before instantiation, or the browser throws.
- Tests live both in `test/` and colocated next to source as `*.test.mjs` (e.g. `src/utils/serialize.test.mjs`). Coverage is restricted to `src`.
- happy-dom does not perfectly match browser semantics (notably custom-element upgrade ordering); be skeptical of behaviors that depend on real-browser timing.

## Known correctness work in flight

The README's top-of-file note flags a set of state-corruption fixes as the current priority — constructor attribute writes, empty-string/removed-attribute handling silently skipping `render()`/`onChanges`, the props Proxy's first-write type lock, and unsafe `structuredClone` of `static props` defaults. Keep these in mind when touching `WebComponent.js`; several current behaviors described above are the *target of* upcoming changes.

## Docs

The public documentation site is an Astro + Starlight app in `docs/` (published to webcomponent.io). Guide content is Markdown/MDX under `docs/src/content/docs/guides/`; it doubles as the behavioral spec for the library.
