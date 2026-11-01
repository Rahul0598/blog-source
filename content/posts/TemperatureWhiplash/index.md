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

Then, today, I saw [this post from BAM Weather](https://www.facebook.com/bamwx/posts/1607521971419437/): warmer-than-normal temperatures are expected to return to the Midwest and Plains after the chilly weekend.

I was reminded of Michael Scott in *The Office*. I'm happy it's warming up again, but man: snip, snap, snip, snap.

![Michael Scott saying snip snap, snip snap](/posts/whiplash/quickgif-app.gif)

That got me wondering: how rare are swings like this in Bloomington? And are they becoming more common?

## What counts as a snip-snap

I used daily high temperatures from the Bloomington IU weather station, whose record starts in 1895. A snip-snap is a sharp change in the daily high followed by a change back, with each change taking no more than three days. Its size is the smaller of the two changes, so both have to be big.

Here's the one from this March. Highs fell 44°F in two days, then climbed 49°F in three. Its size is 44°F.

{{< whiplash-figure src="march-2026.svg" height="260" alt="Daily highs at Bloomington IU, March 9-28, 2026. Highs fell from 71°F on March 16 to 27°F on March 18, then rose to 76°F on March 21." >}}

## How rare is a 44°F snip-snap?

For each year, I kept only its biggest snip-snap. The bars below show those yearly values for 110 years. The curve is a [Gumbel distribution](https://en.wikipedia.org/wiki/Gumbel_distribution), the standard curve for the biggest event of a year. It is the same tool hydrologists use to estimate a “100-year flood.”

{{< whiplash-figure src="gumbel-rarity.svg" height="300" alt="Histogram of each year's biggest snip-snap with a fitted Gumbel curve. Most years peak around 29°F. 35°F or more happens about 1 in 5 years, 40°F or more about 1 in 14, and 44°F or more about 1 in 37." >}}

In a typical year, the biggest snip-snap is around 29°F. About one year in five has one of 35°F or more, and about one in 14 reaches 40°F. A 44°F snip-snap is roughly a 1-in-37-year event, meaning about a 3% chance in any given year. Bloomington has had two in the last seven years:

- **January 29 to February 3, 2019:** 46 → 2 → 48°F. [The B Square](https://bsquarebulletin.com/late-january-cold-sets-record-for-bloomington/) covered the record-setting cold, including the station's 2°F high.
- **March 16 to 21, 2026:** 71 → 27 → 76°F. [WRTV](https://www.wrtv.com/weather/march-weather-madness-from-snow-to-flooding-to-storms/) talked to a downtown Indianapolis resident who was walking in snow two days after sunbathing in shorts.

## Is it getting worse?

To find out, I split the record in half and fitted a Gumbel curve to each: 1896-1960 (52 years) and 1961-2026 (58 years).

{{< whiplash-figure src="gumbel-eras.svg" height="300" alt="Gumbel curves for 1896-1960 and 1961-2026. The recent curve sits about 3°F to the right and has a fatter tail beyond 40°F." >}}

The whole curve has moved to the right. The typical year's biggest snip-snap grew from about 29°F to 33°F. That shift in the middle has a big effect at the tail:

| Biggest snip-snap of the year | 1896-1960 | 1961-2026 |
| --- | --- | --- |
| 35°F or more | 1 in 8 years | 1 in 3.5 years |
| 40°F or more | 1 in 31 years | 1 in 10 years |
| 44°F or more | 1 in 91 years | 1 in 27 years |

## What I take from this

A 40°F snip-snap used to be a once-in-a-generation event in Bloomington. Now it's closer to once a decade. The numbers for 44°F are rougher, because only two years have reached it. Still, a swing like 2019's or 2026's has gone from roughly once a century to about once a generation.

<details>
<summary>Methods</summary>

**Data.** Daily maximum temperatures from [NOAA GHCN-Daily, Bloomington IU (USC00120784)](https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/USC00120784.dly), downloaded November 1, 2026, with values through October 26, 2026. Values with a quality flag are dropped. The station reports at 7 a.m. ([station history](https://www.ncei.noaa.gov/access/homr/services/station/search?qid=GHCND:USC00120784&date=all)). Daily highs leave out nighttime temperatures.

**Snip-snaps.** A warm-cold-warm or cold-warm-cold sequence in which each change takes one to three days with no missing values. Its size is the smaller of the two changes. A snip-snap belongs to the year of its turning point.

**Years.** These are the 108 complete years with at least 95% of daily highs, plus 2019 and 2026. NOAA has no 2019 values from August 27 to October 30, and 2026 is still in progress. Both years already contain a 44°F snip-snap, which ties the record. December has reached 42°F, so I'll check 2026 again in January.

**Fit.** Gumbel parameters were estimated by maximum likelihood: location 28.9°F and scale 4.2°F (Kolmogorov-Smirnov p = 0.62). A generalized extreme value curve and a three-parameter Weibull fit no better by AIC. A normal curve fits worse and makes 44°F look about five times rarer (1 in 188 years).

**Uncertainty.** Bootstrapped 90% ranges for the full-record return periods are 4-6 years (35°F), 11-22 years (40°F) and 24-64 years (44°F). For comparison, the observed years give 1 in 4, 1 in 11 and 1 in 55. The earlier half never went above 40°F (1959), so its 44°F figure extrapolates beyond what was observed.

**Return periods.** “1 in N years” means a 1/N chance in any given year. It assumes conditions are stable within each period. The shift between the two halves suggests they are not stable over the whole record.

[Figure script](/posts/whiplash/build_gumbel_figures.py) · [Fitted values](/posts/whiplash/data/gumbel-summary.json)

</details>
