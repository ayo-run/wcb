#!/usr/bin/env node
/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 *
 * Scaffolds a wcb (`web-component-base`) component: a publishable custom
 * element with a Vite library build (ESM + UMD + types), a demo page, and
 * `custom-elements.json` generation already set up — the CEM analyzer config
 * with wcb's plugin, an `analyze` script, and the `customElements` field in
 * `package.json`. The component class, tag, and file names are stamped from
 * the project name, so no rename-me TODOs are left behind.
 *
 * Runs via `npm create wcb@latest [directory]` (npm resolves `create wcb` to
 * this package's bin). Zero dependencies: prompts use `node:readline`.
 * @see https://webcomponent.io/cem-plugin/
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const DEFAULT_DIR = 'wcb-button'
/** The component identity used inside the template, rewritten on scaffold. */
const TEMPLATE_TAG = 'wcb-button'
const TEMPLATE_CLASS = 'WcbButton'

/**
 * Sanitizes a directory name into a valid npm package name.
 * @param {string} name the raw project directory name
 * @returns {string} a lowercase, hyphenated package name
 */
function toValidPackageName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]+/, '')
    .replace(/[^a-z0-9-~._]+/g, '-')
}

/**
 * Derives a custom element tag name from the package name. Tag names must
 * start with a lowercase letter and contain a hyphen, so a hyphen-less name
 * gets an `-element` suffix (`button` → `button-element`).
 * @param {string} packageName the sanitized package name
 * @returns {string} a valid custom element tag name
 */
function toTagName(packageName) {
  let tag = packageName
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!tag) return TEMPLATE_TAG
  if (!/^[a-z]/.test(tag)) tag = `wc-${tag}`
  if (!tag.includes('-')) tag = `${tag}-element`
  return tag
}

/**
 * Converts a tag name to its PascalCase class name (`my-button` → `MyButton`).
 * @param {string} tag the custom element tag name
 * @returns {string} the PascalCase class name
 */
function toClassName(tag) {
  return tag
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Lists every file under a directory recursively.
 * @param {string} dir the directory to walk
 * @returns {string[]} absolute file paths
 */
function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walkFiles(full) : [full]
  })
}

/**
 * Detects the package manager that launched this scaffold, so the printed
 * next steps match how the user invoked it (`npm create` / `pnpm create` /
 * `yarn create` / `bun create`).
 * @returns {string} `npm` | `pnpm` | `yarn` | `bun`
 */
function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? ''
  for (const pm of ['pnpm', 'yarn', 'bun'])
    if (userAgent.startsWith(pm)) return pm
  return 'npm'
}

/**
 * Copies the template into the target directory, renaming `_gitignore` to
 * `.gitignore` (npm strips `.gitignore` files from published packages, so the
 * template can't ship one under its real name), then stamps the component
 * identity: the template's `wcb-button` tag, `WcbButton` class, and file
 * names are rewritten to the ones derived from the package name.
 * @param {string} root absolute path of the target directory
 * @param {string} packageName the name to write into the scaffolded `package.json`
 * @returns {{tag: string, className: string}} the stamped component identity
 */
function scaffold(root, packageName) {
  const templateDir = fileURLToPath(new URL('./template', import.meta.url))
  fs.cpSync(templateDir, root, { recursive: true })
  fs.renameSync(path.join(root, '_gitignore'), path.join(root, '.gitignore'))

  const tag = toTagName(packageName)
  const className = toClassName(tag)
  fs.renameSync(
    path.join(root, 'src', `${TEMPLATE_TAG}.ts`),
    path.join(root, 'src', `${tag}.ts`)
  )
  for (const file of walkFiles(root)) {
    const content = fs.readFileSync(file, 'utf8')
    const stamped = content
      .replaceAll(TEMPLATE_CLASS, className)
      .replaceAll(TEMPLATE_TAG, tag)
    if (stamped !== content) fs.writeFileSync(file, stamped)
  }

  const packageJsonPath = path.join(root, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.name = packageName
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  return { tag, className }
}

/**
 * Runs the CLI: resolves the target directory from argv or a prompt,
 * refuses to overwrite existing files, scaffolds, and prints next steps.
 * @returns {Promise<void>}
 */
async function main() {
  const arg = process.argv[2]

  if (arg === '--help' || arg === '-h') {
    console.log(`Usage: npm create wcb@latest [directory]

Scaffolds a publishable web-component-base custom element in [directory]
(prompts when omitted; "." scaffolds into the current directory). The
component class, tag, and file names are derived from the directory name,
and the project comes with a Vite library build, a demo page, and
custom-elements.json generation set up.`)
    return
  }

  let targetDir = arg
  if (!targetDir) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    const answer = await rl.question(`Project directory: (${DEFAULT_DIR}) `)
    rl.close()
    targetDir = answer.trim() || DEFAULT_DIR
  }

  const root = path.resolve(process.cwd(), targetDir)
  const packageName = toValidPackageName(
    targetDir === '.' ? path.basename(root) : targetDir
  )

  if (fs.existsSync(root) && fs.readdirSync(root).length > 0) {
    console.error(
      `error: target directory "${targetDir}" exists and is not empty`
    )
    process.exit(1)
  }

  const { tag } = scaffold(root, packageName)

  const pm = detectPackageManager()
  const run = pm === 'npm' ? 'npm run' : pm
  console.log(`
Scaffolded ${packageName} in ${root} — defines <${tag}>

Next steps:

  cd ${targetDir}
  ${pm} install
  ${run} dev        # demo page on the Vite dev server
  ${run} analyze    # generate .wcb/custom-elements.json
  ${run} build:lib  # library build: ESM + UMD + types in dist/
`)
}

await main()
