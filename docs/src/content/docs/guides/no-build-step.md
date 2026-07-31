---
title: 'Web components with no build step'
slug: no-build-step
description: Write and ship a reactive custom element from a single script tag — no bundler, no compiler, no decorators, no node_modules.
draft: true
---

wcb is designed to work with nothing between you and the browser. There is no
compiler step, no decorators needing transform, and no JSX. A component is a
class in a `.js` file that the browser can load directly.

## The whole thing, in one file

```html
<!doctype html>
<meta charset="utf-8" />
<title>Counter</title>

<my-counter></my-counter>

<script type="module">
  import { WebComponent, html } from 'https://esm.sh/web-component-base'

  class Counter extends WebComponent {
    static props = { count: 0 }
    get template() {
      return html`
        <button onClick=${() => ++this.props.count}>${this.props.count}</button>
      `
    }
  }

  customElements.define('my-counter', Counter)
</script>
```

Save it, open it in a browser. That is the entire workflow — no `npm install`,
no `node_modules`, no dev server, no config file.

## Why it works

The published package is ESM with no runtime dependencies, so a CDN can serve
it as a single module. The features that usually force tooling are absent by
design:

- **No decorators.** `static props` is a plain class field.
- **No compiler.** `template` is a getter returning either a string or a tagged
  template; both are ordinary JavaScript.
- **No JSX.** The `html` tag is a function, not syntax.

Anything that would need a transform would need a build step, so it is not in
the library.

## Pinning a version

`https://esm.sh/web-component-base` resolves to the latest release, which is
right for a sketch and wrong for anything you leave running. Pin it:

```js
import { WebComponent } from 'https://esm.sh/web-component-base@6'
```

## Importing only what you use

The package's [exports](/exports/) are split, so a buildless page can take one
piece instead of the whole base class:

```js
import { html } from 'https://esm.sh/web-component-base/html.js'
import { createElement } from 'https://esm.sh/web-component-base/utils'
```

That is the same approach as [Using Just Some Parts](/just-parts/) — useful
when you want the templating without extending anything.

## Keeping the file local

If you would rather not depend on a CDN at runtime, download the module once and
serve it yourself:

```sh
curl -o web-component-base.js https://esm.sh/web-component-base@6
```

```js
import { WebComponent } from './web-component-base.js'
```

An import map keeps the bare specifier working, so the same source moves to a
bundler later without edits:

```html
<script type="importmap">
  {
    "imports": { "web-component-base": "./web-component-base.js" }
  }
</script>
<script type="module">
  import { WebComponent } from 'web-component-base'
</script>
```

## When you do want tooling

Nothing here stops you adopting a bundler later — the source does not change.
[`npm create wcb@latest`](/getting-started/) scaffolds the tooled version:
TypeScript, a Vite dev server, a library build emitting ESM and UMD with types,
and a custom elements manifest. Start buildless, move when you have a reason.
