/**
 * Type-level test: the declarations we publish actually compile.
 *
 * Every other gate looks at `src/`. Nothing looked at `dist/*.d.ts`, so a
 * declaration could be emitted broken and every check would still pass —
 * which is how a dangling `TypeScriptInstance` namespace reached a release
 * candidate. This file imports each published entry point so tsc has to read
 * its declaration, and `test/types/tsconfig.json` leaves `skipLibCheck` off so
 * those declarations are checked rather than trusted.
 *
 * Checked by `pnpm test:types` (tsc only — nothing here runs).
 */
import { WebComponent, html } from '../../dist/index.js'
import { wcbStaticProps, distPaths } from '../../dist/cem-plugin.js'
import {
  createElement,
  patchChildren,
  getKebabCase,
} from '../../dist/utils/index.js'
// The root re-exports these as types, so `import type { TemplateNode } from
// 'web-component-base'` resolves — that is the import a subclass author will
// reach for. They stay reachable from their defining subpaths too; both
// spellings are pinned here so neither surface can drop out unnoticed.
import type { TemplateNode, Changes, VNode } from '../../dist/index.js'
import type { VNode as VNodeFromSubpath } from '../../dist/html.js'
import type {
  TemplateNode as TemplateNodeFromSubpath,
  Changes as ChangesFromSubpath,
} from '../../dist/WebComponent.js'

// cem-plugin: the subpath whose declaration referenced an unresolved namespace
const plugins = [
  wcbStaticProps(),
  distPaths({ rootDir: 'src', outDir: 'dist' }),
]
export const cemConfig = { globs: ['src/*.js'], plugins }

// html: emitted as `any` until moduleResolution was set, so this asserted nothing
const tree: VNode | VNode[] = html`<p>hi</p>`

// the utils subpath, whose signatures narrowed in this release
const node: Element | DocumentFragment | Text = createElement(tree)
patchChildren(document.body, undefined, tree)
const attr: string = getKebabCase('someProp')

// the types a subclass author is expected to name
class Sample extends WebComponent<{ label: string }> {
  static props = { label: '' }
  get template(): TemplateNode {
    return html`<span>${this.props.label}</span>`
  }
  onChanges(changes: Changes) {
    void changes.property
    void changes.currentValue
  }
}

// the root aliases are the subpath types, not lookalikes declared twice
declare const rootTemplateNode: TemplateNode
declare const rootChanges: Changes
declare const rootVNode: VNode
const templateNode: TemplateNodeFromSubpath = rootTemplateNode
const changes: ChangesFromSubpath = rootChanges
const vnode: VNodeFromSubpath = rootVNode

export { tree, node, attr, Sample, templateNode, changes, vnode }
