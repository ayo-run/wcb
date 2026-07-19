import { WebComponent } from 'web-component-base'

/**
 * The shared chrome for every example page — itself built with
 * `web-component-base` (dogfooding). It renders into light DOM, so the shared
 * `shell.css` styles it like everything else.
 */
class AppHeader extends WebComponent {
  static props = { heading: '' }

  get template() {
    return `
      <a class="brand" href="/">web-component-base</a>
      <span class="crumb">${this.props.heading}</span>
      <span class="spacer"></span>
      <a class="back" href="/">← All examples</a>
    `
  }
}

customElements.define('app-header', AppHeader)

// ---------------------------------------------------------------------------
// Theme toggle
//
// The initial theme is applied by a tiny inline <head> script (so there is no
// flash of the wrong theme). Here we build the toggle control, keep it in sync,
// and follow the OS while the user hasn't made an explicit choice.
// ---------------------------------------------------------------------------

const THEME_KEY = 'wcb-theme'
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const effectiveTheme = () =>
  document.documentElement.dataset.theme ||
  (prefersDark.matches ? 'dark' : 'light')

const SUN_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`
const MOON_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`

const themeToggle = document.createElement('button')
themeToggle.type = 'button'
themeToggle.className = 'theme-toggle'

/**
 *
 */
function syncToggle() {
  const dark = effectiveTheme() === 'dark'
  themeToggle.innerHTML = dark ? SUN_ICON : MOON_ICON
  const label = `Switch to ${dark ? 'light' : 'dark'} theme`
  themeToggle.setAttribute('aria-label', label)
  themeToggle.title = label
}

themeToggle.addEventListener('click', () => {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    /* private mode / storage disabled — the choice just won't persist */
  }
  syncToggle()
})

// Follow OS changes only while the user hasn't chosen explicitly.
prefersDark.addEventListener('change', () => {
  let stored = null
  try {
    stored = localStorage.getItem(THEME_KEY)
  } catch {
    /* ignore */
  }
  if (!stored) {
    document.documentElement.dataset.theme = prefersDark.matches
      ? 'dark'
      : 'light'
  }
  syncToggle()
})

syncToggle()

// ---------------------------------------------------------------------------
// Source preview
//
// Every example page shows the source of its own implementation. Vite inlines
// each file's raw text at build time via `?raw` glob imports; we look them up
// by the example's folder (taken from the URL) so this works identically in dev
// and in the hashed production build (unlike reading rewritten <script src>s).
// ---------------------------------------------------------------------------

const RAW_JS = import.meta.glob('./examples/**/*.{js,mjs,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const RAW_HTML = import.meta.glob('./examples/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const basename = (path) => path.split('/').pop()

// Shiki highlighter, created once and lazily. Uses the JavaScript regex engine
// so no WASM is fetched at runtime, and only the langs/themes we actually need.
let highlighterPromise
/**
 *
 */
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
        await Promise.all([
          import('shiki/core'),
          import('shiki/engine/javascript'),
        ])
      const [js, ts, htmlLang, css, dark, light] = await Promise.all([
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/themes/github-dark.mjs'),
        import('shiki/themes/github-light.mjs'),
      ])
      return createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        langs: [js.default, ts.default, htmlLang.default, css.default],
        themes: [dark.default, light.default],
      })
    })()
  }
  return highlighterPromise
}

const langFor = (name) => {
  if (name.endsWith('.html')) return 'html'
  if (name.endsWith('.ts')) return 'typescript'
  return 'javascript'
}

// Single-file pens have no separate JS module — show their HTML instead, minus
// the injected shell tags so only the actual example remains.
/**
 *
 * @param html
 */
function stripShell(html) {
  return html
    .split('\n')
    .filter((line) => !line.includes('shell.css') && !line.includes('shell.js'))
    .join('\n')
    .trim()
}

// ts-check strip comments
/**
 *
 * @param js
 */
function stripTsCheck(js) {
  return js
    .split('\n')
    .filter((line) => !line.includes('ts-check'))
    .join('\n')
    .trim()
}

/**
 *
 * @param folder
 */
function sourcesForFolder(folder) {
  const prefix = `./examples/${folder}/`
  const jsKeys = Object.keys(RAW_JS)
    .filter((k) => k.startsWith(prefix))
    .sort()
  if (jsKeys.length) {
    return jsKeys.map((k) => ({
      name: basename(k),
      code: stripTsCheck(RAW_JS[k]),
    }))
  }
  return Object.keys(RAW_HTML)
    .filter((k) => k.startsWith(prefix))
    .sort()
    .map((k) => ({ name: basename(k), code: stripShell(RAW_HTML[k]) }))
}

/**
 *
 */
async function renderSourcePreview() {
  const match = location.pathname.match(/\/examples\/([^/]+)\//)
  if (!match) return
  const files = sourcesForFolder(match[1])
  if (!files.length) return

  const section = document.createElement('section')
  section.className = 'source'

  const title = document.createElement('h2')
  title.className = 'source-title'
  title.textContent = 'Implementation'
  section.appendChild(title)

  const blocks = files.map((file) => {
    const details = document.createElement('details')
    details.className = 'source-file'
    details.open = true

    const summary = document.createElement('summary')
    summary.textContent = file.name

    // Plain <pre><code> first; upgraded to highlighted markup once Shiki loads.
    const pre = document.createElement('pre')
    pre.className = 'source-plain'
    const code = document.createElement('code')
    code.textContent = file.code.replace(/\s+$/, '')
    pre.appendChild(code)

    details.append(summary, pre)
    section.appendChild(details)
    return { file, details, pre }
  })

  // Appended at the end of <body>, after the live demo — never reparents it.
  document.body.appendChild(section)

  // Progressive enhancement: swap in Shiki-highlighted markup. Dual themes emit
  // `--shiki` / `--shiki-dark` custom props so shell.css can flip with the OS
  // color scheme. Any failure just leaves the readable plain block in place.
  let highlighter
  try {
    highlighter = await getHighlighter()
  } catch {
    return
  }

  // Expose the theme backgrounds so the whole block (filename bar + code) can
  // share Shiki's background color instead of the shell card color.
  section.style.setProperty(
    '--code-bg',
    highlighter.getTheme('github-light').bg
  )
  section.style.setProperty(
    '--code-bg-dark',
    highlighter.getTheme('github-dark').bg
  )
  for (const { file, pre } of blocks) {
    try {
      const html = highlighter.codeToHtml(file.code.replace(/\s+$/, ''), {
        lang: langFor(file.name),
        themes: { light: 'github-light', dark: 'github-dark' },
      })
      pre.outerHTML = html
    } catch {
      /* keep the plain fallback for this file */
    }
  }
}

// ---------------------------------------------------------------------------
// Mount
//
// Example pages get the full nav (with the toggle on the right) plus a source
// preview; the landing page just gets the toggle in its header. `prepend` /
// `appendChild` only add siblings — the example's own elements are untouched.
// ---------------------------------------------------------------------------

if (/\/examples\/[^/]+\//.test(location.pathname)) {
  const header = document.createElement('app-header')
  header.setAttribute('heading', document.title)
  document.body.prepend(header)
  header.appendChild(themeToggle)
  renderSourcePreview()
} else {
  const homeHeader = document.querySelector('.home-header')
  if (homeHeader) homeHeader.appendChild(themeToggle)
  else document.body.prepend(themeToggle)
}
