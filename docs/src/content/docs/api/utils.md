---
title: Utilities
slug: api/utils
description: Case conversion, attribute serialization, element creation and the vnode reconciler.
---

The helpers `WebComponent` uses internally, exported so you can use them
directly. Import from the `utils` entry point or each module separately:

```js
import { serialize, getKebabCase } from 'web-component-base/utils'
// or
import { serialize } from 'web-component-base/utils/serialize.js'
```

See it live: [Just the parts demo ↗](https://demo.webcomponent.io/examples/just-parts/) builds a component from these helpers without extending the base class.

## Case conversion

### `getCamelCase(kebab)`

Converts a kebab-case attribute name to its camelCase prop key.

| Parameter   | Type     |                          |
| ----------- | -------- | ------------------------ |
| `kebab`     | `string` | the attribute name       |
| **returns** | `string` | the prop key             |

```js
getCamelCase('max-count') // 'maxCount'
```

### `getKebabCase(str)`

Converts a camelCase prop key to its kebab-case attribute name. This is the
mapping `observedAttributes` uses.

| Parameter   | Type     |                          |
| ----------- | -------- | ------------------------ |
| `str`       | `string` | the prop key             |
| **returns** | `string` | the attribute name       |

```js
getKebabCase('maxCount') // 'max-count'
```

Consecutive capitals are treated as one word, so `parseHTML` becomes
`parse-html`.

## Attribute serialization

### `serialize(value)`

Converts a value to its attribute string form.

| Parameter   | Type     |                                        |
| ----------- | -------- | -------------------------------------- |
| `value`     | `any`    | the value to serialize                 |
| **returns** | `string` | the attribute value                    |

Numbers, booleans and objects go through `JSON.stringify`; strings and
everything else pass through unchanged.

### `deserialize(value, type)`

Parses an attribute string back into a value of the given declared type, the
inverse of `serialize()`.

| Parameter   | Type     |                                                     |
| ----------- | -------- | --------------------------------------------------- |
| `value`     | `string` | the attribute value                                 |
| `type`      | `string` | `'boolean'`, `'number'`, `'object'`, `'undefined'` or `'string'` |
| **returns** | `any`    | the parsed value                                    |

`'boolean'` always returns `true`: strict HTML boolean-attribute semantics,
where any present value is true. Absence is handled by the caller and never
reaches here. `'number'`, `'object'` and `'undefined'` use `JSON.parse` and
throw on malformed input; strings pass through.

## Elements

### `createElement(tree)`

Builds real DOM from a vnode tree.

| Parameter   | Type     |                                                      |
| ----------- | -------- | ---------------------------------------------------- |
| `tree`      | `any`    | a vnode, an array of vnodes, or a text value          |
| **returns** | `Node`   | an element, a `DocumentFragment`, or a text node      |

An array becomes a `DocumentFragment`; a value with no `type` becomes a text
node. Props are applied with `applyProp()` and children are created
recursively.

### `applyProp(el, prop, value)`

Applies a single vnode prop to an element, using the rule described in
[html](/api/html/#how-props-are-applied).

| Parameter | Type      |                                    |
| --------- | --------- | ---------------------------------- |
| `el`      | `Element` | the element to apply the prop to    |
| `prop`    | `string`  | the prop name as written in the vnode |
| `value`   | `any`     | the prop value                     |

Shared with the reconciler, so a patched element gets props by exactly the same
rule as a freshly created one.

## Reconciler

These power the in-place re-render described in
[Template vs Render](/template-vs-render/). Matching is **index-based and
non-keyed**.

### `patchChildren(parent, oldChildren, newChildren)`

Reconciles a parent node's children from one vnode list to another, patching
matches in place and trimming leftovers.

| Parameter     | Type   |                                                |
| ------------- | ------ | ---------------------------------------------- |
| `parent`      | `Node` | the parent node to patch into                  |
| `oldChildren` | `any`  | the previous vnode children, or previous tree  |
| `newChildren` | `any`  | the new vnode children, or new tree            |

### `patchNode(parent, dom, oldVnode, newVnode)`

Reconciles a single node position. Reuses `dom` when the vnode type matches,
otherwise replaces it.

| Parameter  | Type              |                                          |
| ---------- | ----------------- | ---------------------------------------- |
| `parent`   | `Node`            | the parent node being patched            |
| `dom`      | `Node \| null`    | the existing node at this index, if any   |
| `oldVnode` | `any`             | the vnode that produced `dom`, if known   |
| `newVnode` | `any`             | the vnode to render                      |
