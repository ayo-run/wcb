// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/guides/': '/guides/why',
  },
  integrations: [
    starlight({
      title: 'WCB (alpha)',
      social: [
        {
          icon: 'npm',
          label: 'NPM',
          href: 'https://www.npmjs.com/package/web-component-base',
        },
        {
          icon: 'sourcehut',
          label: 'SourceHut',
          href: 'https://sr.ht/~ayoayco/wcb/',
        },
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/ayo-run/wcb/',
        },
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            'getting-started',
            'why',
            'exports',
            'usage',
            'examples',
            'template-vs-render',
            'prop-access',
            'shadow-dom',
            'styling',
            'just-parts',
            'life-cycle-hooks',
            'cem-plugin',
            'library-size',
          ],
        },
        // {
        //   label: 'Reference',
        //   autogenerate: { directory: 'reference' },
        // },
      ],
      components: {
        Footer: './src/components/Attribution.astro',
      },
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'mask-icon',
            href: 'mask-icon.svg',
            color: '#000000',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            href: 'apple-touch-icon.png',
          },
        },
      ],
    }),
  ],
})
