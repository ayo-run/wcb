import globals from 'globals'
import pluginJs from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  // Config, build, and script files run in Node — give them Node globals
  // (e.g. `process`) on top of the browser defaults.
  {
    files: ['**/*.config.{js,mjs,cjs}', 'scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  // The Storybook config files and the CEM analyzer config run in Node.
  {
    files: [
      'storybook/.storybook/*.js',
      '**/custom-elements-manifest.config.mjs',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    ignores: ['site/*', '**/dist/*', 'storybook/storybook-static/*'],
  },
]
