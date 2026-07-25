import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { create } from '@custom-elements-manifest/analyzer/src/create.js'
import { distPaths, wcbStaticProps } from '../src/cem-plugin.js'
import { getKebabCase } from '../src/utils/index.js'

// The analyzer resolves its own `typescript`, which may be a different version
// than ours. `SyntaxKind` values shift between releases, so a source file built
// by a different instance is invisible to the analyzer's node checks — build it
// with the exact instance the analyzer uses.
const require = createRequire(import.meta.url)
const ts = require(
  createRequire(
    require.resolve('@custom-elements-manifest/analyzer/src/create.js')
  ).resolve('typescript')
)

/**
 * Runs the real analyzer over a source string with the plugin installed and
 * returns the resulting classDoc — the same path `cem analyze` takes.
 * @param {string} source component source to analyze
 * @param {string} [className] class to return the doc for
 * @returns {any} the classDoc from the generated manifest
 */
function analyze(source, className = 'CozyButton') {
  const manifest = create({
    modules: [
      ts.createSourceFile(
        'my-element.js',
        source,
        ts.ScriptTarget.ES2015,
        true
      ),
    ],
    plugins: [wcbStaticProps()],
    context: { dev: false, thirdPartyCEMs: [] },
  })
  return manifest.modules[0].declarations.find((d) => d.name === className)
}

const COZY_BUTTON = `
import { WebComponent, html } from 'web-component-base'

export class CozyButton extends WebComponent {
  static props = {
    variant: 'primary',
    disabled: false,
    maxCount: 3,
    config: { size: 'md' },
    items: [],
  }
  static shadowRootInit = { mode: 'open' }
  static styles = ':host { display: block }'
  static strictProps = true

  get template() {
    return html\`<button>\${this.props.variant}</button>\`
  }
}
customElements.define('cozy-button', CozyButton)
`

describe('cem-plugin: wcbStaticProps', () => {
  const doc = analyze(COZY_BUTTON)
  const attrNamed = (name) => doc.attributes.find((a) => a.name === name)
  const fieldNamed = (name) => doc.members.find((m) => m.name === name)

  it('emits one attribute per declared prop', () => {
    expect(doc.attributes.map((a) => a.name).sort()).toEqual([
      'config',
      'disabled',
      'items',
      'max-count',
      'variant',
    ])
  })

  it('infers the type from the default literal', () => {
    expect(attrNamed('variant').type).toEqual({ text: 'string' })
    expect(attrNamed('disabled').type).toEqual({ text: 'boolean' })
    expect(attrNamed('max-count').type).toEqual({ text: 'number' })
    expect(attrNamed('config').type).toEqual({ text: 'object' })
    expect(attrNamed('items').type).toEqual({ text: 'object' })
  })

  it('records the default and the camelCase field it maps to', () => {
    expect(attrNamed('variant')).toMatchObject({
      fieldName: 'variant',
      default: "'primary'",
    })
    expect(attrNamed('max-count').fieldName).toBe('maxCount')
  })

  it('names attributes with wcb getKebabCase, matching observedAttributes', () => {
    for (const attribute of doc.attributes)
      expect(attribute.name).toBe(getKebabCase(attribute.fieldName))
  })

  it('emits a matching public field per prop', () => {
    expect(fieldNamed('variant')).toMatchObject({
      kind: 'field',
      privacy: 'public',
      type: { text: 'string' },
      attribute: 'variant',
    })
    expect(fieldNamed('maxCount').attribute).toBe('max-count')
  })

  it('strips wcb internals from the public surface', () => {
    const names = doc.members.map((m) => m.name)
    for (const internal of [
      'props',
      'shadowRootInit',
      'styles',
      'strictProps',
      'observedAttributes',
      'template',
    ])
      expect(names, internal).not.toContain(internal)
  })

  it('keeps the component authors own members', () => {
    const withMethod = analyze(`
      import { WebComponent } from 'web-component-base'
      export class CozyButton extends WebComponent {
        static props = { variant: 'primary' }
        focusFirst() {}
      }
    `)
    expect(withMethod.members.map((m) => m.name)).toContain('focusFirst')
  })

  it('strips internals from a wcb component that declares no props', () => {
    const doc = analyze(`
      import { WebComponent } from 'web-component-base'
      export class CozyButton extends WebComponent {
        static styles = ':host{}'
        get template() { return '' }
      }
    `)
    // the analyzer drops arrays it finds empty, so stripping every member
    // leaves no `members` key at all
    expect((doc.members ?? []).map((m) => m.name)).not.toContain('styles')
    expect(doc.attributes ?? []).toEqual([])
  })

  // The typed-props pattern hoists the defaults into a const so the class can
  // write `extends WebComponent<typeof props>` — a class can't reference its
  // own static in its heritage clause. `static props` is then an identifier,
  // not an object literal.
  it('resolves static props hoisted into a module-level const', () => {
    const doc = analyze(`
      import { WebComponent } from 'web-component-base'
      const buttonProps = { variant: 'primary', maxCount: 2 }
      export class CozyButton extends WebComponent {
        static props = buttonProps
      }
    `)
    expect(doc.attributes.map((a) => a.name).sort()).toEqual([
      'max-count',
      'variant',
    ])
    expect(doc.attributes.find((a) => a.name === 'max-count').type).toEqual({
      text: 'number',
    })
  })

  it('resolves static props declared with `as const`', () => {
    const doc = analyze(`
      import { WebComponent } from 'web-component-base'
      const buttonProps = { disabled: false } as const
      export class CozyButton extends WebComponent {
        static props = buttonProps
      }
    `)
    expect(doc.attributes.map((a) => a.name)).toEqual(['disabled'])
  })

  it('leaves non-wcb classes untouched', () => {
    const doc = analyze(
      `export class Plain extends HTMLElement { static props = 1 }`,
      'Plain'
    )
    expect(doc.attributes).toBeUndefined()
    expect(doc.members.map((m) => m.name)).toContain('props')
  })
})

/**
 * Runs the real analyzer over one or more named source files with the given
 * plugins installed and returns the module paths from the generated manifest —
 * `packageLinkPhase` (where `distPaths` runs) fires as part of this.
 * @param {string[]} fileNames source paths to stamp on the scanned modules
 * @param {object[]} plugins analyzer plugins to install
 * @returns {string[]} the resulting `module.path` for each module
 */
function modulePaths(fileNames, plugins) {
  const manifest = create({
    modules: fileNames.map((fileName) =>
      ts.createSourceFile(fileName, '', ts.ScriptTarget.ES2015, true)
    ),
    plugins,
    context: { dev: false, thirdPartyCEMs: [] },
  })
  return manifest.modules.map((m) => m.path)
}

/**
 * Analyzes one source file with `wcbStaticProps` + `distPaths` installed and
 * returns the resulting module doc — `packageLinkPhase` included.
 * @param {string} fileName the source path stamped on the scanned module
 * @param {string} source component source to analyze
 * @returns {any} the module doc from the generated manifest
 */
function analyzedModule(fileName, source) {
  const manifest = create({
    modules: [
      ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2015, true),
    ],
    plugins: [wcbStaticProps(), distPaths()],
    context: { dev: false, thirdPartyCEMs: [] },
  })
  return manifest.modules[0]
}

describe('cem-plugin: distPaths', () => {
  it('rewrites src/*.ts paths to dist/*.js by default', () => {
    expect(modulePaths(['src/wcb-button.ts'], [distPaths()])).toEqual([
      'dist/wcb-button.js',
    ])
  })

  it('maps .mts/.cts to their emitted JS extensions', () => {
    expect(
      modulePaths(['src/a.mts', 'src/b.cts', 'src/c.ts'], [distPaths()])
    ).toEqual(['dist/a.mjs', 'dist/b.cjs', 'dist/c.js'])
  })

  it('swaps the directory but keeps plain .js sources as-is', () => {
    expect(modulePaths(['src/nested/widget.js'], [distPaths()])).toEqual([
      'dist/nested/widget.js',
    ])
  })

  it('honors rootDir / outDir overrides for non-standard layouts', () => {
    expect(
      modulePaths(
        ['lib/x.ts'],
        [distPaths({ rootDir: 'lib', outDir: 'dist/esm' })]
      )
    ).toEqual(['dist/esm/x.js'])
  })

  it('leaves paths outside rootDir untouched (dir), still remaps extension', () => {
    expect(modulePaths(['other/x.ts'], [distPaths()])).toEqual(['other/x.js'])
  })

  it('runs alongside wcbStaticProps without interfering', () => {
    const manifest = create({
      modules: [
        ts.createSourceFile(
          'src/cozy-button.ts',
          COZY_BUTTON,
          ts.ScriptTarget.ES2015,
          true
        ),
      ],
      plugins: [wcbStaticProps(), distPaths()],
      context: { dev: false, thirdPartyCEMs: [] },
    })
    const mod = manifest.modules[0]
    expect(mod.path).toBe('dist/cozy-button.js')
    const doc = mod.declarations.find((d) => d.name === 'CozyButton')
    expect(doc.attributes.map((a) => a.name)).toContain('max-count')
  })

  describe('references back to the rewritten modules', () => {
    const mod = analyzedModule('src/cozy-button.ts', COZY_BUTTON)

    it('rewrites the module every export declaration points at', () => {
      // A reference left on `src/cozy-button.ts` resolves to no module in the
      // manifest — and to a file the package does not publish.
      expect(mod.exports.length).toBeGreaterThan(0)
      for (const exported of mod.exports)
        expect(exported.declaration.module).toBe('dist/cozy-button.js')
    })

    it('keeps every internal reference pointing at a module in the manifest', () => {
      const paths = [mod.path]
      for (const exported of mod.exports)
        expect(paths).toContain(exported.declaration.module)
    })

    it('leaves references into another package alone', () => {
      const doc = mod.declarations.find((d) => d.name === 'CozyButton')
      // `WebComponent` lives in web-component-base, whose layout this plugin
      // knows nothing about — rewriting it would invent a path.
      expect(doc.superclass).toMatchObject({
        name: 'WebComponent',
        package: 'web-component-base',
      })
      expect(doc.superclass.module).toBeUndefined()
    })

    it('rewrites a same-package reference but not a cross-package one', () => {
      const manifest = create({
        modules: [
          ts.createSourceFile('src/x.ts', '', ts.ScriptTarget.ES2015, true),
        ],
        plugins: [
          // Seeds before distPaths: plugins run a phase in array order.
          {
            name: 'seed-refs',
            packageLinkPhase({ customElementsManifest }) {
              customElementsManifest.modules[0].declarations = [
                {
                  kind: 'class',
                  name: 'X',
                  superclass: { name: 'Base', module: 'src/base.ts' },
                  mixins: [
                    { name: 'Ext', module: 'src/mix.ts' },
                    {
                      name: 'Vendor',
                      module: 'src/v.ts',
                      package: 'vendor-ui',
                    },
                  ],
                },
              ]
            },
          },
          distPaths(),
        ],
        context: { dev: false, thirdPartyCEMs: [] },
      })
      const [doc] = manifest.modules[0].declarations
      expect(doc.superclass.module).toBe('dist/base.js')
      expect(doc.mixins[0].module).toBe('dist/mix.js')
      expect(doc.mixins[1].module).toBe('src/v.ts')
    })
  })
})
