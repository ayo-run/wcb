import type { APIContext } from 'astro'
import { getSections, pageUrl, toMarkdown } from '../lib/llms'

export const prerender = true

/**
 * `/llms-full.txt` — the whole English corpus as plain Markdown, in sidebar
 * order. The docs are small enough that an assistant can read all of wcb in
 * one request instead of crawling page by page.
 *
 * @param context the Astro endpoint context
 * @returns the plain-text corpus
 */
export async function GET(context: APIContext): Promise<Response> {
  const site = context.site!
  const { index, sections } = await getSections()

  const parts = [
    '# web-component-base (wcb)',
    '',
    '> A zero-dependency base class for building reactive custom elements. This file is the complete English documentation from https://webcomponent.io, concatenated as plain Markdown.',
    '',
  ]

  if (index)
    parts.push(toMarkdown(index.body ?? '', { demote: true, site }), '')

  for (const section of sections) {
    parts.push(`# ${section.label}`, '')
    for (const page of section.pages) {
      parts.push(
        `## ${page.data.title}`,
        '',
        `Source: ${pageUrl(page, site)}`,
        ''
      )
      if (page.data.description) parts.push(page.data.description, '')
      parts.push(toMarkdown(page.body ?? '', { demote: true, site }), '')
    }
  }

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
