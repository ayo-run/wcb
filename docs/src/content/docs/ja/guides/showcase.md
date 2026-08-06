---
title: 'ショーケースにデモを追加する'
slug: 'ja/showcase'
description: '`npm create wcb@latest`からホームページのカードまでの全手順。コンポーネントを作り、デモページを公開し、ショーケースのデータファイルに1エントリ追加します。'
---

[ドキュメントのホームページ](/ja/)には、wcbで作られたコンポーネントのライブデモごとに1枚ずつカードが並ぶショーケースがあります。誰でも新しいエントリを追加して、自分のデモページへのリンクを載せられます。

このガイドでは、コンポーネントの雛形作成からデモページの公開、エントリの送信まで、一通りの手順を案内します。すでに公開ページで動いているコンポーネントがあるなら、[ステップ3](#3-エントリを追加する)から始めてください。

## カードに必要なもの

カードが指すのはデモページです。次を満たしていれば掲載できます。

- **公開されたページであること** — `https://`でアクセスでき、今後も公開が続くこと。プロジェクトサイト、GitHub Pagesへのデプロイ、自分のドメインの1ページ、いずれでも構いません。
- **そのコンポーネントがwcbで作られていること** — `WebComponent`を継承しているか、[部分だけを使う](/ja/just-parts/)（`html`、`createElement`）形で使っていること。
- **カスタム要素のタグ名があること** — これがカードのタイトルになります。1枚のカードにつき1つの要素です。
- **[webcomponent.io](https://webcomponent.io)へのリンクがあること** — 目に見えるリンクが1つあれば十分です。たとえばフッターの「A [web-component-base](https://webcomponent.io) component」。`npm create wcb@latest`の雛形には最初から入っています。

npmへの公開は必要ありませんし、デモページが凝ったものである必要もありません。デモが表示されなくなったエントリは削除されるので、閉じる予定のあるページやまだ公開していないページは掲載を見送ってください。

## 準備するもの

次のものが必要です。

- [Node.js](https://nodejs.org)（現行のLTS）。npmが同梱されています
- [pnpm](https://pnpm.io/installation)。ドキュメントサイトが要求します。他のパッケージマネージャーではインストールできません
- プルリクエストのためのGitHubアカウント

## 1. コンポーネントを作る

すでにある場合はステップ2へ進んでください。

```sh
npm create wcb@latest my-element
cd my-element
npm install
npm run dev
```

ViteがローカルのURLを表示します。プロジェクト直下の`index.html`がデモページで、すでに`<my-element>`をレンダリングしています。その中身は`src/my-element.ts`です。このファイルを編集すると、保存するたびにページが更新されます。

雛形が他に何を用意するかは[はじめる](/ja/getting-started/)に、コンポーネントの書き方そのものは[使い方](/ja/usage/)にあります。

## 2. デモページを公開する

```sh
npm run build
```

これで`index.html`とそのアセットが`dist/`にビルドされます（`npm run build:lib`は別物で、コンポーネントをnpm向けにパッケージ化するだけでページは生成しません）。

`dist/`は任意の静的ホスティングにデプロイできます。[Netlify](https://docs.netlify.com/site-deploys/create-deploys/)、[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、Cloudflare Pages、あるいは自分のサーバー上のディレクトリでも構いません。

ドメイン直下ではなくサブパス（`https://you.github.io/my-element/`）で配信する場合は、ビルド時にその接頭辞を渡す必要があります。渡さないと、スタイルもスクリプトも読み込まれないページになります。

```sh
npm run build -- --base=/my-element/
```

デプロイしたURLを開き、コンポーネントが表示されること、そしてページから[webcomponent.io](https://webcomponent.io)へリンクしていることを確認してください（雛形のフッターに入っています）。そのURLがカードのリンク先になります。

## 3. エントリを追加する

GitHubで[`ayo-run/wcb`をフォーク](https://github.com/ayo-run/wcb/fork)し、フォークをクローンして、変更用のブランチを作ります。すべてのカードは1つのファイルに入っています。

```js title="docs/src/showcase.mjs"
export const showcase = {
  'mastodon-content': {
    href: 'https://mastodon-content.webcomponent.io',
    description:
      'Progressively enhances a Mastodon status: rewrites hashtag links and marks hashtag bars',
  },
  'status-indicator': {
    href: 'https://status-indicator.webcomponent.io',
    description: 'Colored circles that can pulse',
  },
}
```

自分のコンポーネントを、アルファベット順の位置にキーとして追加します。

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
  },
```

変更はこれだけです。キーはタグ名であり、`<my-element>`としてカードのタイトルに描画されます。`href`には外部リンクの印が付き、新しいタブで開きます。ホームページとその3つの翻訳はすべてこのオブジェクトから描画されるので、編集するページはありません。

### フィールド

| フィールド     | 必須   | 内容                                                                                                                           |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| _キー_         | はい   | HTMLに書くとおりのカスタム要素のタグ名。ハイフンを含むためクォートします。カードのタイトルになり、他のエントリと重複できません。 |
| `href`         | はい   | デモページの絶対`https://` URL。                                                                                               |
| `description`  | はい   | コンポーネントの説明を英語で1行。カードの本文になります。目安は15語程度。                                                       |
| `translations` | いいえ | 同じ説明の他ロケール版。ロケール接頭辞（`ja`、`zh-cn`、`tl`）をキーにします。省略したロケールでは英語の行が表示されます。       |

書ける言語があれば、翻訳を添えてください。

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
    translations: {
      ja: 'コンポーネントの説明を一行で',
    },
  },
```

## 4. サイトをプレビューする

クローンしたリポジトリのルートで:

```sh
pnpm install
pnpm docs
```

Astroが`http://localhost:4321`でサイトを配信します。ショーケースはホームページの一番下にあり、`/ja/`、`/zh-cn/`、`/tl/`でも該当する説明文でカードが表示されます。

```sh
pnpm test
```

エントリにフィールドが欠けている場合、`href`が`https://`のURLでない場合、キーがアルファベット順から外れている場合は、このテストが失敗します。

## 5. プルリクエストを開く

変更した1ファイルをコミットし、[`ayo-run/wcb`](https://github.com/ayo-run/wcb)に対してプルリクエストを開きます。

```sh
git commit -am "docs: add <my-element> to the showcase"
```

説明はこのタイトルで十分です。レビュアーが確認するのは3点、デモページが開けること、そこにあるコンポーネントがwcbで作られていること、そしてページからwebcomponent.ioへリンクしていることです。マージされれば、次のビルドでカードが表示されます。

リポジトリは[SourceHut](https://git.sr.ht/~ayoayco/wcb)にもミラーされています。そちらで作業したい場合はどうぞ。
