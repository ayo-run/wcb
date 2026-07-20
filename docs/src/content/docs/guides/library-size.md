---
title: Library Size
slug: library-size
---

All the functions and the base class in the library are minimalist by design and only contains what is needed for their purpose.

The main export (with `WebComponent` + `html`) is **1.7 kB** (min + gzip) according to [bundlephobia.com](https://bundlephobia.com/package/web-component-base@latest), and the `WebComponent` base class is **1.96 kB** (min + brotli) according to [size-limit](http://github.com/ai/size-limit).

Every change that moves this number is recorded in [`size-change-log.md`](https://github.com/ayo-run/wcb/blob/main/size-change-log.md), with the reason the bytes were spent and the benefit they bought.
