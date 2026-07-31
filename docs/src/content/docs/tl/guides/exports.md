---
title: Mga Export
slug: 'tl/exports'
---

Maaari mong i-import ang lahat nang hiwa-hiwalay, o sa iisang file para sa main exports at utilities.

### Mga Pangunahing Export

```js
// all in a single file

import { WebComponent, html } from 'web-component-base'

// in separate files

import { WebComponent } from 'web-component-base/WebComponent.js'

import { html } from 'web-component-base/html.js'
```

### Mga Utility

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
