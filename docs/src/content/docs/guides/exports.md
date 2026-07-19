---
title: Exports
slug: exports
---

You can import everything separately, or in a single file each for the main exports and utilities.

### Main Exports

```js
// all in a single file

import { WebComponent, html } from 'web-component-base'

// in separate files

import { WebComponent } from 'web-component-base/WebComponent.js'

import { html } from 'web-component-base/html.js'
```

### Utilities

```js
// in a single file

import {
  serialize,
  deserialize,
  getCamelCase,
  getKebabCase,
  createElement,
  applyProp,
  patchNode,
  patchChildren,
} from 'web-component-base/utils'

// or separate files

import { serialize } from 'web-component-base/utils/serialize.js'

import { createElement } from 'web-component-base/utils/create-element.js'

// etc...
```
