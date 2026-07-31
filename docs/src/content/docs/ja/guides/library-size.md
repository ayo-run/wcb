---
title: ライブラリサイズ
slug: 'ja/library-size'
---

このライブラリ内のすべての関数とベースクラスは、設計上ミニマリストであり、その目的に必要なものしか含んでいません。

`WebComponent` ベースクラスは、[size-limit](http://github.com/ai/size-limit)によれば**1.98 kB**（min + brotli）です。

この数値を動かすすべての変更は、その変更に費やされたバイトの理由と、それによって得られた利益とともに、[`size-change-log.md`](https://github.com/ayo-run/wcb/blob/main/size-change-log.md)に記録されます。
