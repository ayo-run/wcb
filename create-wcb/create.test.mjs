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

  it('scaffolds a project with the CEM story set up', () => {
    run(['my-app'])

    const root = path.join(workDir, 'my-app')
    for (const file of [
      'index.html',
      'src/hello-world.js',
      'custom-elements-manifest.config.mjs',
      'README.md',
    ])
      expect(fs.existsSync(path.join(root, file)), file).toBe(true)

    const packageJson = readJson('my-app', 'package.json')
    expect(packageJson.name).toBe('my-app')
    expect(packageJson.customElements).toBe('custom-elements.json')
    expect(packageJson.scripts.analyze).toBe('cem analyze')
    expect(packageJson.dependencies['web-component-base']).toBeDefined()
    expect(
      packageJson.devDependencies['@custom-elements-manifest/analyzer']
    ).toBeDefined()
  })

  it('renames _gitignore to .gitignore', () => {
    run(['my-app'])

    const root = path.join(workDir, 'my-app')
    expect(fs.existsSync(path.join(root, '.gitignore'))).toBe(true)
    expect(fs.existsSync(path.join(root, '_gitignore'))).toBe(false)
    expect(fs.readFileSync(path.join(root, '.gitignore'), 'utf8')).toContain(
      'custom-elements.json'
    )
  })

  it('sanitizes the directory name into a valid package name', () => {
    run(['My App'])
    expect(readJson('My App', 'package.json').name).toBe('my-app')
  })

  it('scaffolds into the current directory with "."', () => {
    run(['.'])
    expect(fs.existsSync(path.join(workDir, 'index.html'))).toBe(true)
    // package name derives from the temp directory's basename
    expect(readJson('package.json').name).toMatch(/^create-wcb-/)
  })

  it('falls back to the default directory when the prompt is empty', () => {
    run([], { input: '\n' })
    expect(fs.existsSync(path.join(workDir, 'wcb-app', 'index.html'))).toBe(
      true
    )
    expect(readJson('wcb-app', 'package.json').name).toBe('wcb-app')
  })

  it('refuses a non-empty target directory', () => {
    fs.mkdirSync(path.join(workDir, 'taken'))
    fs.writeFileSync(path.join(workDir, 'taken', 'keep.txt'), 'important')

    expect(() => run(['taken'], { stdio: 'pipe' })).toThrow(/not empty/)
    expect(
      fs.readFileSync(path.join(workDir, 'taken', 'keep.txt'), 'utf8')
    ).toBe('important')
  })
})
