import { defineConfig } from 'vite'
import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(root, '..', 'src')

// Every example page becomes a build input so `vite build` emits a full
// multi-page app (landing page + one page per example).
function examplePages() {
  const inputs = { main: resolve(root, 'index.html') }
  const examplesDir = resolve(root, 'examples')
  for (const entry of readdirSync(examplesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    for (const file of readdirSync(resolve(examplesDir, entry.name))) {
      if (!file.endsWith('.html')) continue
      const name = `${entry.name}/${file.replace(/\.html$/, '')}`
      inputs[name] = resolve(examplesDir, entry.name, file)
    }
  }
  return inputs
}

// `web-component-base` is a real `workspace:*` dependency; for a build-free dev
// experience (instant HMR against the library source) we resolve it to `src`
// instead of the built `dist`. Order matters — most specific specifier first.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^web-component-base\/utils$/,
        replacement: resolve(srcDir, 'utils/index.js'),
      },
      {
        find: /^web-component-base\/html$/,
        replacement: resolve(srcDir, 'html.js'),
      },
      {
        find: /^web-component-base$/,
        replacement: resolve(srcDir, 'index.js'),
      },
    ],
  },
  server: {
    // allow serving the aliased library source that lives above the demo root
    fs: { allow: [resolve(root, '..')] },
  },
  build: {
    rollupOptions: { input: examplePages() },
  },
})
