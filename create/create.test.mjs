// @vitest-environment node
// (the default happy-dom environment replaces the global URL with its DOM
// shim, which `fileURLToPath` rejects; this suite needs no DOM anyway)

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const bin = fileURLToPath(new URL('./index.js', import.meta.url))

describe('create-wcb', () => {
  let workDir

  beforeEach(() => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-wcb-'))
  })

  afterEach(() => {
    fs.rmSync(workDir, { recursive: true, force: true })
  })

  const run = (args, options = {}) =>
    execFileSync(process.execPath, [bin, ...args], {
      cwd: workDir,
      encoding: 'utf8',
      ...options,
    })

  const readJson = (...segments) =>
    JSON.parse(fs.readFileSync(path.join(workDir, ...segments), 'utf8'))

  const read = (...segments) =>
    fs.readFileSync(path.join(workDir, ...segments), 'utf8')

  it('scaffolds a project with the CEM story set up', () => {
    run(['my-button'])

    const root = path.join(workDir, 'my-button')
    for (const file of [
      'index.html',
      'src/my-button.ts',
      'custom-elements-manifest.config.mjs',
      'vite-lib.config.ts',
      'tsconfig.json',
      'pnpm-workspace.yaml',
      'README.md',
    ])
      expect(fs.existsSync(path.join(root, file)), file).toBe(true)

    const packageJson = readJson('my-button', 'package.json')
    expect(packageJson.name).toBe('my-button')
    // Seeded in the scaffold and kept in sync by `cem analyze` — the analyzer
    // maintains `customElements`, wcbJetBrainsPlugin maintains `web-types`.
    expect(packageJson.customElements).toBe('.wcb/custom-elements.json')
    expect(packageJson['web-types']).toBe('.wcb/web-types.json')
    expect(packageJson.scripts.analyze).toBe('cem analyze')
    expect(packageJson.scripts['build:lib']).toContain('vite-lib.config.ts')
    // the generated files ship via `files` (prepack runs analyze first)
    expect(packageJson.files).toContain('.wcb/custom-elements.json')
    expect(packageJson.files).toContain('.wcb/web-types.json')
    expect(packageJson.peerDependencies['web-component-base']).toBeDefined()
    expect(
      packageJson.devDependencies['@custom-elements-manifest/analyzer']
    ).toBeDefined()
  })

  it('stamps the component identity from the project name', () => {
    const output = run(['my-button'])
    expect(output).toContain('<my-button>')

    const component = read('my-button', 'src', 'my-button.ts')
    expect(component).toContain('export class MyButton')
    expect(component).toContain("customElements.define('my-button', MyButton)")

    expect(read('my-button', 'index.html')).toContain('<my-button')
    expect(read('my-button', 'vite-lib.config.ts')).toContain(
      'src/my-button.ts'
    )

    const packageJson = readJson('my-button', 'package.json')
    expect(packageJson.module).toBe('./dist/my-button.js')
    expect(packageJson.types).toBe('./dist/my-button.d.ts')

    // no template identity survives the stamp
    for (const file of [
      'package.json',
      'index.html',
      'README.md',
      'vite-lib.config.ts',
      path.join('src', 'my-button.ts'),
    ]) {
      expect(read('my-button', file)).not.toContain('wcb-button')
      expect(read('my-button', file)).not.toContain('WcbButton')
    }
  })

  it('suffixes hyphen-less names so the tag is valid', () => {
    run(['button'])

    expect(readJson('button', 'package.json').name).toBe('button')
    const component = read('button', 'src', 'button-element.ts')
    expect(component).toContain(
      "customElements.define('button-element', ButtonElement)"
    )
  })

  it('renames _gitignore to .gitignore', () => {
    run(['my-button'])

    const root = path.join(workDir, 'my-button')
    expect(fs.existsSync(path.join(root, '.gitignore'))).toBe(true)
    expect(fs.existsSync(path.join(root, '_gitignore'))).toBe(false)
    expect(read('my-button', '.gitignore')).toContain('.wcb/')
  })

  it('sanitizes the directory name into a valid package name', () => {
    run(['My Button'])
    expect(readJson('My Button', 'package.json').name).toBe('my-button')
  })

  it('scaffolds into the current directory with "."', () => {
    run(['.'])
    expect(fs.existsSync(path.join(workDir, 'index.html'))).toBe(true)
    // package name derives from the temp directory's basename
    expect(readJson('package.json').name).toMatch(/^create-wcb-/)
  })

  it('falls back to the default directory when the prompt is empty', () => {
    run([], { input: '\n' })
    expect(fs.existsSync(path.join(workDir, 'wcb-button', 'index.html'))).toBe(
      true
    )
    expect(readJson('wcb-button', 'package.json').name).toBe('wcb-button')
  })

  it('refuses a non-empty target directory', () => {
    fs.mkdirSync(path.join(workDir, 'taken'))
    fs.writeFileSync(path.join(workDir, 'taken', 'keep.txt'), 'important')

    expect(() => run(['taken'], { stdio: 'pipe' })).toThrow(/not empty/)
    expect(read('taken', 'keep.txt')).toBe('important')
  })
})
