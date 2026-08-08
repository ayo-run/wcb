import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { create } from '@custom-elements-manifest/analyzer/src/create.js'
import {
  distPaths,
  wcbStaticProps,
  wcbVsCodePlugin,
  wcbJetBrainsPlugin,
  wcbPluginSet,
} from '../src/cem-plugin.js'
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

/**
 * Runs the real analyzer over `source` with `wcbStaticProps` + `wcbVsCodePlugin`
 * installed, writing custom-data into a fresh temp dir, and returns the parsed
 * files — the same path `cem analyze` takes, including serialization.
 * @param {string} source component source to analyze
 * @param {object} [options] options forwarded to `wcbVsCodePlugin`
 * @returns {{html: any, css: any, dir: string}} the parsed files and their dir
 */
function generateCustomData(source, options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wcb-cd-'))
  create({
    modules: [
      ts.createSourceFile(
        'cozy-button.ts',
        source,
        ts.ScriptTarget.ES2015,
        true
      ),
    ],
    plugins: [wcbStaticProps(), wcbVsCodePlugin({ ...options, outdir: dir })],
    context: { dev: false, thirdPartyCEMs: [] },
  })
  const read = (file) => {
    const filePath = path.join(dir, file)
    return fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : undefined
  }
  return {
    html: read('html-custom-data.json'),
    css: read('css-custom-data.json'),
    dir,
  }
}

describe('cem-plugin: wcbVsCodePlugin', () => {
  it('emits a tag with attributes from static props', () => {
    const { html } = generateCustomData(COZY_BUTTON)
    expect(html.version).toBe(1.1)
    const tag = html.tags.find((t) => t.name === 'cozy-button')
    expect(tag).toBeTruthy()
    expect(tag.attributes.map((a) => a.name)).toEqual(
      expect.arrayContaining(['variant', 'disabled', 'max-count'])
    )
  })

  it('omits references entirely when a component has none (no [null])', () => {
    const { html } = generateCustomData(COZY_BUTTON)
    const tag = html.tags.find((t) => t.name === 'cozy-button')
    expect('references' in tag).toBe(false)
    // guard the exact regression: no null anywhere in the serialized output
    expect(JSON.stringify(html)).not.toContain('null')
  })

  it('includes only well-formed @reference tags', () => {
    const source = `
      import { WebComponent, html } from 'web-component-base'
      /**
       * @reference MDN - https://developer.mozilla.org/
       * @reference this one is malformed and has no url
       */
      export class CozyButton extends WebComponent {
        static props = { variant: 'primary' }
        get template() { return html\`<button></button>\` }
      }
      customElements.define('cozy-button', CozyButton)
    `
    const { html } = generateCustomData(source)
    const tag = html.tags.find((t) => t.name === 'cozy-button')
    expect(tag.references).toEqual([
      { name: 'MDN', url: 'https://developer.mozilla.org/' },
    ])
  })

  it('writes a css custom-data file with parts as pseudo-elements', () => {
    const source = `
      import { WebComponent, html } from 'web-component-base'
      /**
       * @cssproperty [--accent=blue] - the accent color
       * @csspart label - the button label
       */
      export class CozyButton extends WebComponent {
        static props = { variant: 'primary' }
        get template() { return html\`<button></button>\` }
      }
      customElements.define('cozy-button', CozyButton)
    `
    const { css } = generateCustomData(source)
    expect(css.version).toBe(1.1)
    expect(css.properties.map((p) => p.name)).toContain('--accent')
    expect(css.pseudoElements.map((p) => p.name)).toContain('::part(label)')
  })

  it('skips a file when its name is null', () => {
    const { html, css } = generateCustomData(COZY_BUTTON, { cssFileName: null })
    expect(html).toBeTruthy()
    expect(css).toBeUndefined()
  })
})

/**
 * Runs the real analyzer over `source` with `wcbStaticProps` + `wcbJetBrainsPlugin`
 * installed, writing into a fresh temp dir, and returns the parsed
 * `web-types.json` — the same path `cem analyze` takes.
 * @param {string} source component source to analyze
 * @param {object} [options] options forwarded to `wcbJetBrainsPlugin`
 * @returns {any} the parsed web-types file, or undefined
 */
function generateWebTypes(source, options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wcb-wt-'))
  create({
    modules: [
      ts.createSourceFile(
        'cozy-button.ts',
        source,
        ts.ScriptTarget.ES2015,
        true
      ),
    ],
    plugins: [
      wcbStaticProps(),
      // packageJson: false so these unit runs don't rewrite the repo's own
      // package.json (cwd here is the repo root); a dedicated test below
      // covers the field writing in an isolated working directory.
      wcbJetBrainsPlugin({ packageJson: false, ...options, outdir: dir }),
    ],
    context: { dev: false, thirdPartyCEMs: [] },
  })
  const filePath = path.join(dir, options.fileName ?? 'web-types.json')
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : undefined
}

describe('cem-plugin: wcbJetBrainsPlugin', () => {
  it('emits a schema-valid web-types shell', () => {
    const wt = generateWebTypes(COZY_BUTTON, { name: 'cozy', version: '2.0.0' })
    expect(wt.$schema).toBe('http://json.schemastore.org/web-types')
    expect(wt.name).toBe('cozy')
    expect(wt.version).toBe('2.0.0')
    expect(wt['description-markup']).toBe('markdown')
    expect(Array.isArray(wt.contributions.html.elements)).toBe(true)
  })

  it('contributes one element per custom element with its attributes', () => {
    const wt = generateWebTypes(COZY_BUTTON)
    const el = wt.contributions.html.elements.find(
      (e) => e.name === 'cozy-button'
    )
    expect(el).toBeTruthy()
    expect(el.attributes.map((a) => a.name)).toEqual(
      expect.arrayContaining(['variant', 'disabled', 'max-count'])
    )
  })

  it('maps boolean attributes to no-value and carries string defaults', () => {
    const wt = generateWebTypes(COZY_BUTTON)
    const el = wt.contributions.html.elements.find(
      (e) => e.name === 'cozy-button'
    )
    const disabled = el.attributes.find((a) => a.name === 'disabled')
    const variant = el.attributes.find((a) => a.name === 'variant')
    expect(disabled.value).toEqual({ kind: 'no-value', type: 'boolean' })
    expect(variant.value).toEqual({
      kind: 'plain',
      type: 'string',
      default: 'primary',
    })
    expect(variant.default).toBe('primary') // unquoted from the manifest literal
  })

  it('mirrors props as js.properties (camelCase names)', () => {
    const wt = generateWebTypes(COZY_BUTTON)
    const el = wt.contributions.html.elements.find(
      (e) => e.name === 'cozy-button'
    )
    expect(el.js.properties.map((p) => p.name)).toEqual(
      expect.arrayContaining(['variant', 'disabled', 'maxCount'])
    )
  })

  it('skips generation when fileName is null', () => {
    expect(generateWebTypes(COZY_BUTTON, { fileName: null })).toBeUndefined()
  })

  // Runs from an isolated working directory: the plugin writes the `web-types`
  // field into the package.json of `process.cwd()`, so the test chdirs into a
  // temp package to avoid touching the repo's own package.json.
  it('points the package.json web-types field at the generated file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wcb-pkg-'))
    const cwd = process.cwd()
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'iso', version: '1.0.0' }) + '\n'
    )
    try {
      process.chdir(dir)
      create({
        modules: [
          ts.createSourceFile(
            'cozy-button.ts',
            COZY_BUTTON,
            ts.ScriptTarget.ES2015,
            true
          ),
        ],
        plugins: [wcbStaticProps(), wcbJetBrainsPlugin({ outdir: '.wcb' })],
        context: { dev: false, thirdPartyCEMs: [] },
      })
      const pkg = JSON.parse(
        fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
      )
      expect(pkg['web-types']).toBe('.wcb/web-types.json')
    } finally {
      process.chdir(cwd)
    }
  })

  it('leaves package.json untouched when packageJson is false', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wcb-pkg-'))
    const cwd = process.cwd()
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'iso', version: '1.0.0' }) + '\n'
    )
    try {
      process.chdir(dir)
      create({
        modules: [
          ts.createSourceFile(
            'c.ts',
            COZY_BUTTON,
            ts.ScriptTarget.ES2015,
            true
          ),
        ],
        plugins: [wcbJetBrainsPlugin({ outdir: '.wcb', packageJson: false })],
        context: { dev: false, thirdPartyCEMs: [] },
      })
      const pkg = JSON.parse(
        fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
      )
      expect('web-types' in pkg).toBe(false)
    } finally {
      process.chdir(cwd)
    }
  })
})

describe('cem-plugin: wcbPluginSet', () => {
  it('returns every plugin in analyzer order', () => {
    expect(wcbPluginSet().map((p) => p.name)).toEqual([
      'wcb-static-props',
      'wcb-dist-paths',
      'wcb-vs-code-plugin',
      'wcb-jet-brains-plugin',
    ])
  })

  it('spreads into a config and forwards per-plugin options', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wcb-full-'))
    create({
      modules: [
        ts.createSourceFile(
          'cozy-button.ts',
          COZY_BUTTON,
          ts.ScriptTarget.ES2015,
          true
        ),
      ],
      plugins: [
        ...wcbPluginSet({
          vsCode: { outdir: dir, cssFileName: null },
          jetBrains: {
            outdir: dir,
            name: 'cozy',
            version: '9.0.0',
            packageJson: false,
          },
          distPaths: { outDir: 'build' },
        }),
      ],
      context: { dev: false, thirdPartyCEMs: [] },
    })
    const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    // vsCode honored cssFileName: null
    expect(fs.existsSync(path.join(dir, 'html-custom-data.json'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'css-custom-data.json'))).toBe(false)
    // jetBrains honored name/version overrides
    expect(read('web-types.json').name).toBe('cozy')
    expect(read('web-types.json').version).toBe('9.0.0')
  })
})
