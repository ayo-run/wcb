/**
 * @license MIT <https://opensource.org/licenses/MIT>
 *
 * Type-checks the `create/` scaffold the way a user gets it: runs the real
 * scaffolder into a temp directory, links this repo in as
 * `web-component-base`, and runs `tsc` with the template's own
 * `tsconfig.json`.
 *
 * The link resolves through the root `package.json` `exports` map, so this
 * exercises the same module resolution a scaffolded project does — which is
 * what catches a template that ships no `tsconfig.json`, or one whose
 * `moduleResolution` can't read an `exports` map. Both leave the
 * `web-component-base` import unresolvable and every `this.props` access an
 * error, while `vite build` still exits 0.
 *
 * Run via `pnpm test:template` (part of `pnpm test:all`). Needs `dist/` built.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const scaffolder = path.join(repoRoot, 'create', 'index.js')
const tsc = path.join(repoRoot, 'node_modules', '.bin', 'tsc')
const PROJECT = 'template-check'

if (!fs.existsSync(path.join(repoRoot, 'dist', 'index.d.ts'))) {
  console.error('check-template: dist/index.d.ts missing — run `pnpm build`')
  process.exit(1)
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wcb-template-'))
const root = path.join(workDir, PROJECT)

try {
  execFileSync(process.execPath, [scaffolder, PROJECT], {
    cwd: workDir,
    stdio: 'pipe',
  })

  // Stand in for `npm install` of the peer dependency: the scaffold resolves
  // `web-component-base` to this repo, exports map and all.
  fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true })
  fs.symlinkSync(
    repoRoot,
    path.join(root, 'node_modules', 'web-component-base'),
    'dir'
  )

  // The template emits declarations during `build:lib`; here we only want the
  // diagnostics, and `emitDeclarationOnly` may not be combined with `noEmit`.
  execFileSync(
    tsc,
    ['-p', 'tsconfig.json', '--emitDeclarationOnly', 'false', '--noEmit'],
    {
      cwd: root,
      stdio: 'inherit',
    }
  )

  console.log('check-template: scaffold type-checks clean')
} catch {
  console.error(
    `\ncheck-template: the scaffolded template does not type-check.\n` +
      `A user running \`npm create wcb@latest\` sees these errors on their\n` +
      `first \`npm run build:lib\`. Check create/template/tsconfig.json.`
  )
  process.exit(1)
} finally {
  fs.rmSync(workDir, { recursive: true, force: true })
}
