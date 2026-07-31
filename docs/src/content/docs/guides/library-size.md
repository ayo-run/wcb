---
title: Library Size
slug: library-size
description: What the WebComponent base class weighs, min + brotli, how size-limit measures it, and where every byte change is recorded.
---

All the functions and the base class in the library are minimalist by design and only contains what is needed for their purpose.

The `WebComponent` base class is **1.98 kB** (min + brotli) according to [size-limit](http://github.com/ai/size-limit).

Every change that moves this number is recorded in [`size-change-log.md`](https://github.com/ayo-run/wcb/blob/main/size-change-log.md), with the reason the bytes were spent and the benefit they bought.
