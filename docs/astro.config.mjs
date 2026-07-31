// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  site: 'https://webcomponent.io',
  redirects: {
    '/guides/': '/getting-started',
    '/api/': '/api/web-component',
  },
  integrations: [
    starlight({
      title: 'WCB',
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        ja: {
          label: '日本語',
          lang: 'ja',
        },
        'zh-cn': {
          label: '简体中文',
          lang: 'zh-CN',
        },
        tl: {
          label: 'Tagalog',
          lang: 'tl',
        },
      },
      social: [
        {
          icon: 'npm',
          label: 'NPM',
          href: 'https://npmx.dev/package/web-component-base',
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
          translations: {
            ja: 'ガイド',
            'zh-cn': '指南',
            tl: 'Mga Gabay',
          },
          items: [
            // Each item here is one entry in the navigation menu. A page with
            // `draft: true` must not be listed: it has no route in a
            // production build, and Starlight fails the build on a sidebar
            // entry whose slug does not resolve.
            'getting-started',
            'why',
            'comparison',
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
        {
          label: 'API Reference',
          translations: {
            ja: 'APIリファレンス',
            'zh-cn': 'API 参考',
            tl: 'Sanggunian ng API',
          },
          items: [
            'api/web-component',
            'api/html',
            'api/utils',
            'api/cem-plugin',
          ],
        },
      ],
      components: {
        Footer: './src/components/Attribution.astro',
        Head: './src/components/Head.astro',
        Hero: './src/components/Hero.astro',
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
