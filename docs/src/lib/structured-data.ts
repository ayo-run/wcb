import config from 'virtual:starlight/user-config'
import type { StarlightRouteData } from '@astrojs/starlight/route-data'
// resolved by the bundler against this file's path, so it is the *root*
// package.json regardless of where the module ends up or what the cwd is —
// `import.meta.url` is rewritten during bundling and silently resolves to the
// docs workspace's own package.json instead
import pkg from '../../../package.json'

/**
 * JSON-LD for the docs site. Answer engines and knowledge panels read this to
 * decide what a package *is* — name, version, license, where the source lives —
 * rather than inferring it from prose. Nothing here is authored by hand: the
 * package facts come from the root `package.json` at build time, and the page
 * facts from the frontmatter, so neither can drift from the thing it describes.
 */

/** `git+https://github.com/…git` is a package-manager URL, not a browsable one. */
const repository = pkg.repository?.url
  ?.replace(/^git\+/, '')
  .replace(/\.git$/, '')

/** Locale prefixes that mark a page as a translation, from the Starlight config. */
const locales = Object.keys(config.locales ?? {}).filter((l) => l !== 'root')

/**
 * @param id the page's slug
 * @returns the locale prefix the page lives under, or undefined for English
 */
function localeOf(id: string): string | undefined {
  return locales.find((locale) => id === locale || id.startsWith(`${locale}/`))
}

/**
 * @param route the current page's Starlight route data
 * @param url the page's canonical URL
 * @param site the site origin
 * @returns the JSON-LD graph for the page
 */
export function getStructuredData(
  route: StarlightRouteData,
  url: URL,
  site: URL
): object[] {
  const { entry, id, lang } = route
  const locale = localeOf(id)
  const home = new URL(locale ? `${locale}/` : '', site).href
  const isHome = url.href === home

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.href}#website`,
    name: config.title[lang] ?? Object.values(config.title)[0],
    url: site.href,
    inLanguage: lang,
  }

  if (isHome) {
    return [
      website,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        '@id': `${site.href}#package`,
        name: pkg.name,
        alternateName: 'wcb',
        // the package's own description, not the page's — this node describes
        // the library, while the `WebSite` node covers the site
        description: pkg.description,
        url: site.href,
        ...(repository ? { codeRepository: repository } : {}),
        programmingLanguage: 'JavaScript',
        runtimePlatform: 'Web browser',
        license: `https://spdx.org/licenses/${pkg.license}`,
        version: pkg.version,
        applicationCategory: 'DeveloperApplication',
        keywords: [
          'web components',
          'custom elements',
          'lightweight',
          'zero dependency',
          'reactive',
          'no build step',
        ],
        offers: {
          '@type': 'Offer',
          price: 0,
          priceCurrency: 'USD',
        },
      },
    ]
  }

  return [
    website,
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${url.href}#article`,
      headline: entry.data.title,
      ...(entry.data.description
        ? { description: entry.data.description }
        : {}),
      url: url.href,
      inLanguage: lang,
      isPartOf: { '@id': `${site.href}#website` },
      about: { '@id': `${site.href}#package` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: config.title[lang] ?? Object.values(config.title)[0],
            item: home,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: entry.data.title,
          },
        ],
      },
    },
  ]
}
