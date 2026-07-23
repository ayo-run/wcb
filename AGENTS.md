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
- `pnpm size-limit` — enforces the per-file byte budgets declared in `package.json` `size-limit` (each `dist/` file has its own, e.g. `WebComponent.js` ≤ 2.05 KB, `html.js` ≤ 0.6 KB, each util ≤ 0.5–0.8 KB). Keep additions tiny; this gate is a core project value. `size-change-log.md` is the running record of how each change moved the base-class bundle and why.
- `pnpm test:types` — builds, then type-checks the TS type tests (`test/types/typed-props.test-d.ts`) and the `demo/examples/typed-props/` example. `this.props` is typed by passing the props shape as a class type argument: `class X extends WebComponent<typeof props>`.
- `pnpm docs` — run the Astro docs site (`docs/` workspace) locally.
- `pnpm demo` — run the Vite examples showcase (`demo/` workspace) locally; `pnpm demo:build` builds it.
- `pnpm -F storybook dev` — run the Storybook testing ground (`storybook/`) locally; `pnpm -F storybook build` builds it. Both run `cem analyze` first to regenerate `custom-elements.json`. The CEM config imports the plugin from the **published subpath** (`web-component-base/cem-plugin` → `dist/`), so run `pnpm build` at the root first.
- `pnpm test:e2e` — run the browser e2e specs (`test/e2e/`) via Vitest browser mode (Playwright). Defaults to Chromium; `pnpm test:e2e:firefox` / `:webkit` / `:all` target the other engines (the `E2E_BROWSERS` env var, comma-separated, selects instances). `pnpm test:all` runs unit + types + e2e across all engines.
- `pnpm create wcb` (the `create/` workspace package) scaffolds a new component project from `create/template/`. `create/` is a separate publishable package, not part of the `web-component-base` bundle.

pnpm is mandatory (a `preinstall` `only-allow pnpm` guard enforces it). This is a pnpm workspace with three sub-packages: `docs/` (Astro docs site), `demo/` (Vite examples showcase, which consumes the root `web-component-base` package as a `workspace:*` dependency), and `storybook/` (Storybook testing ground — it writes no components of its own, it builds stories over the `demo/examples/` components so the CEM plugin is exercised against real ones). The runnable example sources live in `demo/examples/` and import the package by name (`web-component-base`), not via relative `src/` paths.

The demo shares one app shell: `demo/shell.css` (design tokens + component styles, linked by the landing page and every example) and `demo/shell.js` (defines `<app-header>` — itself a `WebComponent` — and `prepend`s it to each example page; `prepend` never reparents the example's own elements, so their lifecycle is untouched). Every example page links both. Keep new examples consistent by adding `<link rel="stylesheet" href="../../shell.css" />` and `<script type="module" src="../../shell.js"></script>`.

## Architecture

Everything is in `src/` (entry point `src/index.js` re-exports `WebComponent` and `html`):

- **`src/WebComponent.js`** — the base class and the whole reactivity engine. The flow:
  - `static props` (a camelCase → default-value map) is the single source of truth. `observedAttributes` is derived from it by kebab-casing each key.
  - The constructor only clones defaults and sets up the host — it does **not** touch attributes (the spec forbids attribute mutation in the constructor). `cloneDefaults` deep-copies each default with `structuredClone`, falling back to by-reference for non-cloneable values (functions, class instances) instead of throwing `DataCloneError`, and warns once per class about defaults that can't reflect to an attribute (function/symbol) or a discouraged `true` boolean default. Each prop's `typeof` is recorded in a private `#typeMap`.
  - Defaults are reflected onto attributes in `connectedCallback` (`#reflectDefaults`), skipping any attribute already set by markup/SSR so authored values win. The props object is wrapped in a **Proxy** (`#handler`): writing `this.props.someProp = x` runs `toAttribute` and calls `setAttribute`/`removeAttribute` (kebab-case), which triggers `attributeChangedCallback` → `render()`. That attribute-write-driven cycle *is* the reactivity model — there is no separate scheduler. `#reflecting` tracks the attribute currently being written (per name, not a shared flag) so the reflection's own `attributeChangedCallback` doesn't parse the value back.
  - The Proxy guards prop types against `#typeMap`. A type violation is **logged via `console.error` and skipped** by default, so a stray write can't halt `render()`/`onChanges`; set `static strictProps = true` to throw `TypeError` instead. Undeclared props are untyped.
  - `attributeChangedCallback` handles a *removed* attribute (`currentValue === null`) by resetting to the declared default — or `false` for a boolean prop. A removed or empty-string attribute still runs `render()`/`onChanges` (`''` stays `''`). Attribute-driven side effects are buffered until after `connectedCallback` runs `onInit`, so `onInit` always precedes the first render even when the platform fires attribute callbacks before connect.
  - **Boolean props follow HTML**: presence means `true`, absence means `false`. `true` reflects as a bare attribute, `false` removes it, so `toggleAttribute()` and `[attr]` selectors work; any present value (even `flag="false"`) is `true`, and wcb warns when it sees a boolean attribute written as `"true"`/`"false"`. `toAttribute(name, value)` / `fromAttribute(name, value)` are overridable per-prop converters (call `super` for the props you don't handle); `toAttribute` returning `null` removes the attribute.
  - Lifecycle hooks authors may override: `onInit()` (connected), `afterViewInit()` (after first render), `onDestroy()` (disconnected), `onChanges({property, attribute, previousValue, currentValue})` (attribute changed) — `property` is **camelCase** (matching `props` access) and `attribute` is the kebab-case name.
  - `template` is a read-only getter (assigning to it throws). `render()` branches on its type: a **string** template is written to `#host.innerHTML`; an **object** template (a vnode tree from `html`) is diffed against the previous tree with `JSON.stringify` and, on change, built via `createElement` + `replaceChildren` on the *first* render and **reconciled in place** (`patchChildren`, see `src/utils/patch.mjs`) on every render after that, so focus/caret/uncommitted input values survive. An empty string (and `` html`` `` , which yields `undefined`) empties the rendered subtree. `render()` can be called manually or overridden entirely (e.g. to delegate to `lit-html`).
  - `static styles` (a string, `CSSStyleSheet`, or an array of them adopted in declaration order — so a shared tokens sheet can precede component styles) are applied as constructable stylesheets via `adoptedStyleSheets`, which **only works with a shadow root** — set `static shadowRootInit` to opt into shadow DOM.

- **`src/html.js`** — the `html` tagged-template function. It imports [`htm`](https://github.com/developit/htm) (the `htm/mini` build, a `devDependency`) and binds it to a hyperscript `h(type, props, children)` that produces plain `{type, props, children}` vnodes. `htm` is bundled into `dist/` at build time by esbuild's `--bundle`, so the published package stays zero-runtime-dependency. License lives in `vendors/htm/`.

- **`src/cem-plugin.js`** — a **dev-time-only** Custom Elements Manifest analyzer plugin that teaches `@custom-elements-manifest/analyzer` about wcb's `static props` convention (mapping props to CEM attributes/members and hiding wcb internals). It runs in Node during `cem analyze`, is never imported by `WebComponent`, and is published as the `web-component-base/cem-plugin` subpath (`dist/`) — which is why Storybook/CEM consumers must `pnpm build` the root first.

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

## State-model invariants (easy to regress)

The v6 state-correctness work has **landed** — the behaviors described above are the *current* contract, not aspirational targets. When touching `WebComponent.js`, preserve these invariants:

- The constructor never mutates attributes; default reflection happens in `connectedCallback` (`#reflectDefaults`), and authored attributes are never overwritten.
- A removed or empty-string attribute still runs `render()`/`onChanges` — removal resets to the declared default (or `false` for booleans), `''` stays `''`.
- Prop-type violations **log-and-skip** unless `static strictProps = true`; a bad write never halts rendering.
- Defaults are cloned with a `structuredClone` fallback, so non-cloneable defaults (functions, class instances) don't throw.
- `onInit` always precedes the first render (attribute-driven side effects are buffered until connect).
- Boolean props follow HTML presence/absence semantics in both directions.

## Docs

The public documentation site is an Astro + Starlight app in `docs/` (published to webcomponent.io). Guide content is Markdown/MDX under `docs/src/content/docs/guides/`; it doubles as the behavioral spec for the library.
