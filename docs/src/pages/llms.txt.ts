import type { APIContext } from 'astro'
import { getSections, pageUrl } from '../lib/llms'

export const prerender = true

/**
 * `/llms.txt` — an index of the documentation for assistants, in the format
 * described at https://llmstxt.org. Every page contributes its own title and
 * description, so this stays accurate as long as pages carry a description
 * (which `test/docs-descriptions.test.mjs` requires).
 *
 * @param context the Astro endpoint context
 * @returns the plain-text index
 */
export async function GET(context: APIContext): Promise<Response> {
  const site = context.site!
  const { sections } = await getSections()

  const lines = [
    '# web-component-base (wcb)',
    '',
    '> A zero-dependency base class for building reactive custom elements. Subclass `WebComponent`, declare `static props` and a `template`, and any change to an observed attribute re-renders the component. The runtime is ~2 kB brotli-compressed, and it needs no compiler, decorators or build step.',
    '',
    '- Install: `npm i web-component-base` — or scaffold a project with `npm create wcb@latest`',
    '- Import from a CDN with no build step: `import { WebComponent } from "https://esm.sh/web-component-base"`',
    '- Package: https://npmx.dev/package/web-component-base',
    '- Source: https://github.com/ayo-run/wcb',
    '- License: MIT',
    '',
    'Components render into the light DOM by default; shadow DOM is opt-in per component. State lives in attributes, so a component can be server-rendered as plain HTML by any server, with no framework-specific SSR integration.',
    '',
  ]

  for (const section of sections) {
    lines.push(`## ${section.label}`, '')
    for (const page of section.pages) {
      const description = page.data.description ?? ''
      lines.push(
        `- [${page.data.title}](${pageUrl(page, site)})${description ? `: ${description}` : ''}`
      )
    }
    lines.push('')
  }

  lines.push(
    '## Optional',
    '',
    `- [Full documentation](${new URL('llms-full.txt', site).href}): every page above concatenated as plain Markdown, in one request.`,
    '- [Runnable demos](https://demo.webcomponent.io/): each example as a standalone page with its source.',
    ''
  )

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
