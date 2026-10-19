---
title: "Snip, snap: Bloomington’s temperature whiplash"
slug: "bloomington-temperature-whiplash"
date: "2026-10-18"
draft: false
toc: false
back_to_top: true
website_carbon: true
tags: ["weather", "data-viz"]
---

It's October 18, and it's suddenly cold. Just a few days ago, I was enjoying the sunshine and warm air. It almost felt like summer! Now it's hard to step outside without a jacket, and I'm mad at myself for not spending more time outdoors while it was warm.

<p data-facebook-context>Then, today, I saw this post about how it's going to be warmer again next week:</p>

<aside class="whiplash-facebook" data-facebook-post aria-label="Referenced Facebook post">
  <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fbamwx%2Fposts%2F1607521971419437%2F&amp;show_text=true&amp;width=320" width="320" height="560" title="BAM Weather Facebook post about warmer weather returning to the Midwest" loading="lazy" allow="encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
  <p><a href="https://www.facebook.com/bamwx/posts/1607521971419437/">Read the post on Facebook</a>: warmer-than-normal temperatures are expected to return to the Midwest and Plains after the chilly weekend.</p>
</aside>

I was reminded of Michael Scott in *The Office*. I'm happy it's warming up again, but man: snip, snap, snip, snap.

![Michael Scott saying snip snap, snip snap](/posts/whiplash/quickgif-app.gif)

That got me wondering: how often has Bloomington's weather swung back and forth like this? And are these swings becoming more common?

{{< whiplash-stations >}}
To explore those questions, I used daily high temperatures from the Bloomington IU weather station within the city. I chose IU for its longer historical record, which begins in 1895.
{{< /whiplash-stations >}}

The chart below looks for sharp temperature swings followed by a reversal within a few days. Move the threshold to explore when these cycles happened and how intense they were.

{{< whiplash >}}

With the default threshold of 27°F (15°C) in both directions, and at most three days for each change:

- Cycles are becoming more frequent: the fitted annual count rises by about 2.1 cycles between 1897 and 2025.
- The intensity trend is less clear: the fitted mean intensity rises by about 0.8°F between 1897 and 2025, but its uncertainty includes no change.
- Warm-cold-warm is more common than cold-warm-cold: 133 versus 101 cycles.
- The strongest complete cycles tie in 2026 and 2019: 71 → 27 → 76°F on March 16-21, 2026, and 46 → 2 → 48°F on January 29-February 3, 2019. Both have a 44°F minimum change, with two days of cooling and three of warming.
- The biggest single change within three days happened in 1972: a 59°F rise, from -7 to 52°F on January 16-19.

Bloomington has a long history of snip-snap weather, including bigger single swings decades ago. With this definition, sharp reversals are becoming more frequent.

Local reporting puts these episodes in context:

- [The B Square: “Late January cold sets record for Bloomington”](https://bsquarebulletin.com/late-january-cold-sets-record-for-bloomington/) (January 31, 2019). Reports the IU station’s 2°F daily high, the cold turning point in the 2019 cycle above. It documents the cold phase of that reversal.
- [WRTV: “March weather madness: From snow to flooding to storms”](https://www.wrtv.com/weather/march-weather-madness-from-snow-to-flooding-to-storms/) (March 16-17, 2026). A downtown Indianapolis resident, walking in snow, recalls sunbathing in shorts just two days earlier. The story explicitly calls the conditions “weather whiplash.”
- [WRTV: “Why have there been so many wild weather swings in March in Indianapolis?”](https://www.wrtv.com/news/local-news/why-have-there-been-so-many-wild-weather-swings-in-march-in-indianapolis/) (March 25, 2026). An NWS meteorologist discusses Indianapolis’s March 22 record high of 88°F and a rare 50°F spread down to 38°F. That comparison uses a high and a low, whereas the charts here compare daily highs.
