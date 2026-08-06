---
title: '把你的演示加入案例展示'
slug: 'zh-cn/showcase'
description: '从 `npm create wcb@latest` 到首页卡片的完整流程：构建组件、把演示页面部署上线，再往案例展示的数据文件里加一条记录。'
---

[文档首页](/zh-cn/)有一个案例展示区，每张卡片对应一个用 wcb 构建的组件的在线演示。任何人都可以添加一条新记录，链接到自己的演示页面。

本指南会带你走完整个流程：生成组件脚手架、把演示页面部署上线，以及提交这条记录。如果你的组件已经运行在一个公开页面上，可以直接从[第 3 步](#3-添加你的记录)开始。

## 卡片需要什么

卡片指向的是演示页面，满足以下条件即可列入：

- **页面是公开的**，可通过 `https://` 访问，并且会长期保持在线。项目站点、GitHub Pages 部署，或你自己域名下的一个页面都可以。
- **页面上的组件是用 wcb 构建的**——继承自 `WebComponent`，或直接使用[只用部分能力](/zh-cn/just-parts/)的方式（`html`、`createElement`）。
- **有一个自定义元素标签名**，它会成为卡片的标题。一张卡片对应一个元素。
- **页面有指向 [webcomponent.io](https://webcomponent.io) 的链接**——一个可见的链接就够了，例如页脚的“A [web-component-base](https://webcomponent.io) component”，`npm create wcb@latest` 生成的项目里本来就有。

组件不必发布到 npm，演示页面也不必做得多精致。演示无法打开的记录会被移除，所以如果某个页面你打算下线，或者还没有公开，就先别列入。

## 开始之前

你需要准备：

- [Node.js](https://nodejs.org)（当前 LTS 版本），其中已包含 npm
- [pnpm](https://pnpm.io/installation)，文档站点要求使用它——换成别的包管理器会直接拒绝安装
- 一个 GitHub 账号，用于提交 pull request

## 1. 构建一个组件

如果你已经有了，跳到第 2 步。

```sh
npm create wcb@latest my-element
cd my-element
npm install
npm run dev
```

Vite 会打印一个本地地址。项目根目录下的 `index.html` 就是演示页面，它已经渲染出 `<my-element>`；背后的组件是 `src/my-element.ts`。编辑该文件，保存后页面即会更新。

脚手架还配置了哪些东西，见[快速上手](/zh-cn/getting-started/)；组件本身怎么写，见[用法](/zh-cn/usage/)。

## 2. 把演示页面部署上线

```sh
npm run build
```

这会把 `index.html` 及其资源构建到 `dist/`。（`npm run build:lib` 是另一回事——它把组件打包成可发布到 npm 的产物，不会生成页面。）

`dist/` 可以部署到任意静态托管：[Netlify](https://docs.netlify.com/site-deploys/create-deploys/)、[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、Cloudflare Pages，或你自己服务器上的一个目录。

如果不是部署在域名根路径，而是子路径（`https://you.github.io/my-element/`），构建时必须带上这个前缀，否则页面加载出来既没有样式也没有脚本：

```sh
npm run build -- --base=/my-element/
```

打开部署好的网址，确认组件能正常渲染，并且页面上有指向 [webcomponent.io](https://webcomponent.io) 的链接——脚手架的页脚里已经有一个。这个网址就是卡片要链接到的地址。

## 3. 添加你的记录

在 GitHub 上 [fork `ayo-run/wcb`](https://github.com/ayo-run/wcb/fork)，克隆你的 fork，并为这次改动新建一个分支。所有卡片都在同一个文件里：

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

按字母顺序把你的组件加为新的一个键：

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
  },
```

改动就这些。键就是你的标签名，会以 `<my-element>` 的形式渲染为卡片标题；`href` 会带上外链标记并在新标签页中打开。首页及其三个译本都从这个对象渲染，所以没有页面需要改。

### 各字段

| 字段           | 必填 | 含义                                                                                     |
| -------------- | ---- | ---------------------------------------------------------------------------------------- |
| _键_           | 是   | 自定义元素在 HTML 中的标签名，因为含有连字符所以需要加引号。它是卡片的标题，且不可重复。   |
| `href`         | 是   | 演示页面的绝对 `https://` URL。                                                            |
| `description`  | 是   | 用一行英文说明组件的作用，作为卡片正文。大约 15 个词。                                      |
| `translations` | 否   | 同一句话的其他语言版本，以语言前缀（`ja`、`zh-cn`、`tl`）为键。未填写的语言会显示英文。     |

你会写哪种语言，就为哪种语言补上翻译：

```js title="docs/src/showcase.mjs"
  'my-element': {
    href: 'https://my-element.example.com',
    description: 'One line on what the component does',
    translations: {
      'zh-cn': '用一行说明组件的作用',
    },
  },
```

## 4. 本地预览站点

在你克隆下来的仓库根目录：

```sh
pnpm install
pnpm docs
```

Astro 会在 `http://localhost:4321` 提供站点。案例展示在首页底部，`/ja/`、`/zh-cn/` 和 `/tl/` 也会显示你的卡片，并使用各自适用的说明文字。

```sh
pnpm test
```

如果某条记录缺少字段、`href` 不是 `https://` 开头的网址，或者键不再按字母顺序排列，这套测试就会失败。

## 5. 提交 pull request

把改动的这一个文件提交，然后向 [`ayo-run/wcb`](https://github.com/ayo-run/wcb) 提交 pull request：

```sh
git commit -am "docs: add <my-element> to the showcase"
```

标题就是这次改动所需的全部说明。审阅者确认三件事：演示页面能打开、页面上的组件确实是用 wcb 构建的，以及页面有指向 webcomponent.io 的链接。合并之后，你的卡片会在站点的下一次构建中出现。

本仓库在 [SourceHut](https://git.sr.ht/~ayoayco/wcb) 上也有镜像，你想在那边工作也可以。
