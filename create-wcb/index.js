#!/usr/bin/env node
/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 *
 * Scaffolds a wcb (`web-component-base`) project: a starter component, a Vite
 * dev server, and `custom-elements.json` generation already set up — the CEM
 * analyzer config with wcb's plugin, an `analyze` script, and the
 * `customElements` field in `package.json`.
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
 * template can't ship one under its real name) and stamping the package name.
 * @param {string} root absolute path of the target directory
 * @param {string} packageName the name to write into the scaffolded `package.json`
 * @returns {void}
 */
function scaffold(root, packageName) {
  const templateDir = fileURLToPath(new URL('./template', import.meta.url))
  fs.cpSync(templateDir, root, { recursive: true })
  fs.renameSync(path.join(root, '_gitignore'), path.join(root, '.gitignore'))

  const packageJsonPath = path.join(root, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.name = packageName
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
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

Scaffolds a web-component-base project in [directory] (prompts when omitted;
"." scaffolds into the current directory). The project comes with a starter
component, a Vite dev server, and custom-elements.json generation set up.`)
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

  scaffold(root, packageName)

  const pm = detectPackageManager()
  const run = pm === 'npm' ? 'npm run' : pm
  console.log(`
Scaffolded ${packageName} in ${root}

Next steps:

  cd ${targetDir}
  ${pm} install
  ${run} dev       # start the Vite dev server
  ${run} analyze   # generate custom-elements.json
`)
}

await main()
