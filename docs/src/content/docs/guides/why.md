---
title: 'Why would anyone use WCB?'
slug: why
---

The `WebComponent` base class gives a full component development experience at the lightest weight possible: the minimum code to boost productivity.

WCB exists for five reasons:

1. **It is the cheapest runtime reactivity you can buy.** Smallest footprint for a full authoring experience: declarative templates, typed prop⇄attribute sync, lifecycle hooks, and state-preserving re-renders. Lit and FAST cost 2x-4.7x more on the wire (brotli-compressed). If your budget is "a component on a mostly-static page", WCB fits where Lit and FAST are the heaviest thing on the wire.
2. **Zero tooling, genuinely.** No compiler, no decorators, no build step: one `import` from a CDN in a `<script type="module">` works on current browsers. The whole mental model is `static props` + `template` + four hooks, and the shipped source is readable in one sitting. The runtime is 2.6 kB brotli-compressed ([measured](/comparison/)).
3. **Attribute-first reactivity is HTML-native.** Because props serialize to attributes, initial state can be rendered by _any_ server in plain HTML (no JS-framework SSR integration needed) and components stay inspectable/debuggable in devtools as ordinary attributes.
4. **Light DOM by default.** Global stylesheets, forms, and third-party CSS just work; and the shadow DOM is one static field away when you want encapsulation.
5. **The size gate is a governed value.** Every byte added must justify itself in the [size change log](https://github.com/ayo-run/wcb/blob/main/size-change-log.md), enforced by `size-limit` budgets in CI. Smart diffing is the largest single addition in the project's history and it cost 0.42 kB.

## When WCB is the wrong choice

Pick honestly:

- **Reorderable lists of stateful items**: patching is positional, not keyed; preserved focus/animation follows the position, not the item. Lit's `repeat` or FAST handle this correctly.
- **High-frequency updates on large trees**: WCB re-renders synchronously per prop write and diffs the whole vnode tree; Lit/FAST update only the affected bindings on a batched schedule.
- **SSR with client hydration**: WCB renders on the client after `connectedCallback`, so there's no hydration step. If you need server-rendered markup that hydrates in place, use Lit (`@lit-labs/ssr`).
- **Big-team, long-horizon design systems**: WCB is a solo-maintained library with a deliberately small surface. For large-org backing and ecosystem, choose Lit (Google) or FAST (Microsoft, powers Fluent UI).

For the measured numbers and the capability-by-capability breakdown behind these claims, see [WCB & similar libraries](/comparison/).
