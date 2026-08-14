---
title: 库体积
slug: 'zh-cn/library-size'
description: WebComponent 基类的 min + brotli 体积、size-limit 的测量方式，以及每次字节变化的记录位置。
---

库中所有的函数和基类在设计上都力求极简，只包含实现其目的所必需的内容。

根据 [size-limit](http://github.com/ai/size-limit) 的测量，`WebComponent` 基类的体积为 **1.98 kB**（min + brotli）。

每一次改变这个数字的变更，都会被记录在 [`size-change-log.md`](https://github.com/ayo-run/wcb/blob/v6/size-change-log.md) 中，包括花费这些字节的原因以及它们带来的收益。
