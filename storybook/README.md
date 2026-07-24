# Storybook testing ground

A real-consumer harness for `web-component-base/cem-plugin`. It writes no components of its own — the stories render the components in [`demo/examples/`](../demo/examples), so the plugin is exercised against the same code the demo site ships.

```sh
pnpm build                  # at the repo root — the CEM config imports from dist/
pnpm -F storybook dev       # runs `cem analyze`, then starts Storybook on :6006
```

## What it proves

- `custom-elements-manifest.config.mjs` imports the plugin from its **published subpath**, so a broken `exports` map fails here the way it would for a consumer.
- Not one story declares `argTypes`. Every control and every row of the attributes table comes from `.wcb/custom-elements.json`.
- Each default-literal shape gets a story under **Plugin → Inferred control types**, so the controls panel is the assertion: `boolean` → toggle, `number` → number input, `object` → JSON editor, `string` → text field.
- `hello-world` covers the camelCase case — `myName` reaching Storybook as `my-name`.
- `typed-button` covers defaults hoisted into a `const` (the [typed props](../docs/src/content/docs/guides/prop-access.mdx) pattern), which the plugin has to resolve through an identifier.

## Why the globs are an explicit list

The demo pages are standalone, so several reuse the same tag name — `my-counter` is defined in five examples. That's harmless when each page loads alone, but Storybook loads everything into one document, where duplicate tags collide in both `customElements.define` and the manifest lookup. Keep `custom-elements-manifest.config.mjs` to one definition per tag when adding stories.

## VS Code autocomplete

The same `pnpm -F storybook analyze` run also emits `html-custom-data.json` — to the **repo-root `.wcb/`**, because `html.customData` in `.vscode/settings.json` resolves paths from the workspace root, not from the settings file. With it in place, `<typed-` completes in any `.html` file, with `variant` / `disabled` / `clicks` offered as attributes. Restart VS Code after the first generation for it to register.

That covers `.html` files only. For the same completions inside `` html`…` `` tagged templates, install the [Custom Elements Manifest Language Server](https://marketplace.visualstudio.com/items?itemName=pwrs.cem-language-server-vscode) extension — it reads the `customElements` field in `package.json` and needs no settings.

The `.wcb/` folders (manifest + custom-data) and `storybook-static/` are all generated and gitignored.
