import { getCollection, type CollectionEntry } from 'astro:content'
import config from 'virtual:starlight/user-config'
import { showcase } from '../showcase.mjs'

/**
 * Shared plumbing for the `/llms.txt` and `/llms-full.txt` endpoints.
 *
 * Both serve the English docs only. The translations are for people; an
 * assistant asked about wcb should get one authoritative corpus rather than
 * four overlapping ones, and the whole English corpus is small enough to fit
 * in a context window, which is the entire point.
 */

export type Section = {
  label: string
  pages: CollectionEntry<'docs'>[]
}

/** Locale prefixes that mark an entry as a translation, from the Starlight config. */
const locales = Object.keys(config.locales ?? {}).filter((l) => l !== 'root')

/**
 * @param entry a docs collection entry
 * @returns whether the entry is one of the English (root locale) pages
 */
function isEnglish(entry: CollectionEntry<'docs'>): boolean {
  return !locales.some((locale) => entry.id.startsWith(`${locale}/`))
}

/**
 * Pages in the order the sidebar lists them, so the corpus reads in the order
 * the docs were written to be read. Deriving the order from the sidebar keeps
 * this from drifting when a guide is added or moved.
 *
 * @returns the landing page, then one section per sidebar group
 */
export async function getSections(): Promise<{
  index?: CollectionEntry<'docs'>
  sections: Section[]
}> {
  const english = (await getCollection('docs')).filter(isEnglish)
  const byId = new Map(english.map((entry) => [entry.id, entry]))

  const sections = config.sidebar?.flatMap((group) => {
    if (!('items' in group)) return []
    const pages = group.items.flatMap((item) => {
      const entry = 'slug' in item ? byId.get(item.slug) : undefined
      return entry ? [entry] : []
    })
    return pages.length ? [{ label: group.label, pages }] : []
  })

  return { index: byId.get('index'), sections: sections ?? [] }
}

/**
 * @param entry a docs collection entry
 * @param site the site origin from the Astro config
 * @returns the page's canonical URL, matching the one in its `<head>`
 */
export function pageUrl(entry: CollectionEntry<'docs'>, site: URL): string {
  const path = entry.id === 'index' ? '' : `${entry.id}/`
  return new URL(path, site).href
}

/**
 * Turns an MDX page body into plain Markdown an assistant can read without
 * tripping over JSX. Content inside fenced code blocks is never touched —
 * example code contains `import` lines of its own, and rewriting those would
 * corrupt the very snippets the corpus exists to provide.
 *
 * @param body the raw page body, frontmatter already stripped
 * @param options.demote shift every heading down one level, so a page's own
 *   sections nest under the heading the corpus gives the page rather than
 *   competing with it
 * @param options.site resolve root-absolute links against this origin — read
 *   outside the site, `/prop-access/` points nowhere
 * @returns the body as plain Markdown
 */
export function toMarkdown(
  body: string,
  options: { demote?: boolean; site?: URL } = {}
): string {
  const { demote = false, site } = options
  const lines = body.split('\n')
  const output: string[] = []
  let fence: string | null = null
  let inCardGrid = false

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)
    if (fenceMatch) {
      const marker = fenceMatch[1]!
      if (fence === null) fence = marker
      else if (marker.startsWith(fence)) fence = null
      output.push(line)
      continue
    }
    if (fence !== null) {
      output.push(line)
      continue
    }

    // component imports — the JSX the page uses, not example code. Both the
    // Starlight components and the site's own `.astro` ones.
    if (
      /^import .* from '@astrojs\/starlight\/components';?$/.test(
        line.trim()
      ) ||
      /^import \w+ from '[^']*\.astro';?$/.test(line.trim())
    )
      continue

    // the homepage showcase renders from `showcase.mjs`, not from the page, so
    // the corpus expands the same data rather than parsing markup that is no
    // longer there: one linked heading per demo, its title fenced in backticks
    // so a Markdown reader does not take the tag name for HTML. The trailing
    // "your own demo" card is navigation to a guide the corpus already carries
    // in full, so it stays out.
    if (/^\s*<ShowcaseGrid\s*\/>\s*$/.test(line)) {
      for (const [tag, demo] of Object.entries(showcase))
        output.push(
          `#### [\`<${tag}>\`](${demo.href})`,
          '',
          demo.description,
          ''
        )
      continue
    }

    if (/^\s*<\/?CardGrid[^>]*>\s*$/.test(line)) {
      inCardGrid = !line.includes('</')
      continue
    }

    // `<Aside>` and Markdown's `:::note` are the same Starlight feature, so the
    // directive form keeps MDX and Markdown pages consistent in the corpus
    const aside = line.match(/^\s*<Aside([^>]*)>\s*$/)
    if (aside) {
      const attrs = aside[1] ?? ''
      const type = attrs.match(/type="([^"]*)"/)?.[1] ?? 'note'
      const title = attrs.match(/title="([^"]*)"/)?.[1]
      output.push(title ? `:::${type}[${title}]` : `:::${type}`)
      continue
    }
    if (/^\s*<\/Aside>\s*$/.test(line)) {
      output.push(':::')
      continue
    }

    const card = line.match(/^\s*<Card[^>]*title="([^"]*)"[^>]*>\s*$/)
    if (card) {
      output.push(`#### ${card[1]}`)
      continue
    }
    if (/^\s*<\/Card>\s*$/.test(line)) {
      output.push('')
      continue
    }

    // card bodies are tab-indented, which would read as a code block once the
    // wrapping JSX is gone
    let text = inCardGrid ? line.replace(/^[\t ]+/, '') : line
    if (demote) text = text.replace(/^(#{1,5}) /, '#$1 ')
    if (site)
      text = text.replace(
        /\]\((\/[^/)][^)]*)\)/g,
        (_, href: string) => `](${new URL(href, site).href})`
      )
    output.push(text)
  }

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
