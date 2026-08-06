/**
 * The homepage showcase: one entry per live demo of a component built with
 * wcb. `components/ShowcaseGrid.astro` loops over this object and renders a
 * card for each entry, in every locale, so adding a demo is a one-entry pull
 * request against this file and nothing else — no page is edited, and the
 * card appears the next time the site is built.
 *
 * The contributor-facing version of all this is `guides/showcase.md`; keep the
 * two in step when the shape below changes.
 * @typedef {object} ShowcaseEntry
 * @property {string} href the demo page — an absolute `https://` URL
 * @property {string} description one line on what the component does, in
 *   English; it is the card's body text
 * @property {Record<string, string>} [translations] the same line in other
 *   locales, keyed by the locale prefixes in `astro.config.mjs`. Optional and
 *   never required of a contributor: a locale with no entry here shows the
 *   English one.
 */

/**
 * Keyed by custom element tag name, which is also the card's title — one key
 * per element, kept in alphabetical order so two demos added in the same week
 * don't land on the same line of a diff.
 * @type {Record<string, ShowcaseEntry>}
 */
export const showcase = {
  'mastodon-content': {
    href: 'https://mastodon-content.webcomponent.io',
    description:
      'Progressively enhances a Mastodon status: rewrites hashtag links and marks hashtag bars',
    translations: {
      ja: 'Mastodonの投稿を段階的に拡張します。ハッシュタグのリンクを書き換え、ハッシュタグの行に印を付けます',
      'zh-cn': '渐进增强 Mastodon 嘟文内容：重写话题标签链接，并标记话题标签行',
      tl: 'Pinapaganda nang paunti-unti ang isang Mastodon status: binabago ang mga hashtag link at minamarkahan ang mga hashtag bar',
    },
  },
  'status-indicator': {
    href: 'https://status-indicator.webcomponent.io',
    description: 'Colored circles that can pulse',
    translations: {
      ja: '点滅できる色付きの円',
      'zh-cn': '会闪烁的彩色圆点',
      tl: 'Mga kulay na bilog na maaaring pumitik',
    },
  },
}
