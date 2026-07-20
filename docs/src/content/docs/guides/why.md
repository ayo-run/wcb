---
title: 'Why would anyone use WCB?'
slug: why
---

The `WebComponent` base class gives a full component development experience at the lightest-weight possible: minimal code to boost productivity.

The following are the main reasons WCB exist.

1. **It is the cheapest runtime reactivity you can buy.** Smallest footprint for a full authoring experience — declarative templates, typed prop⇄attribute sync, lifecycle hooks, and state-preserving re-renders. Every alternative with comparable ergonomics costs 1.4×–5× more. If your budget is "a component on a mostly-static page", WCB fits where Lit and FAST are the heaviest thing on the wire.
2. **Zero tooling, genuinely.** No compiler, no decorators, no build step: one `import` from a CDN in a `<script type="module">` works on current browsers. The whole mental model is `static props` + `template` + four hooks, and the shipped source is readable in one sitting — the entire library is smaller than most libraries' _documentation_ on their update scheduling.
3. **Attribute-first reactivity is HTML-native.** Because props serialize to attributes, initial state can be rendered by _any_ server in plain HTML — no JS-framework SSR integration needed — and components stay inspectable/debuggable in devtools as ordinary attributes.
4. **Light DOM by default.** Global stylesheets, forms, and third-party CSS just work; and the shadow DOM is one static field away when you want encapsulation.
5. **The size gate is a governed value.** Every byte added must justify itself in the [size change log](https://github.com/ayo-run/wcb/blob/main/size-change-log.md), enforced by `size-limit` budgets in CI. Smart diffing is the largest single addition in the project's history and it cost 0.42 kB.

**When WCB is the wrong choice** — pick honestly:

- **Reorderable lists of stateful items**: patching is positional, not keyed; preserved focus/animation follows the position, not the item. Lit's `repeat` or FAST handle this correctly.
- **High-frequency updates on large trees**: WCB re-renders synchronously per prop write and diffs the whole vnode tree; Lit/FAST update only the affected bindings on a batched schedule.
- **SSR with client hydration**: Lit has a real hydration story; Elena is built around progressive enhancement. WCB renders client-side after connect.
- **Big-team, long-horizon design systems**: Google (Lit) and Microsoft (FAST) have big backing and ecosystems; while Elena is purpose-built for design systems.

For the measured numbers and the capability-by-capability breakdown behind these claims, see [WCB & similar libraries](/comparison/).
