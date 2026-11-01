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

A snip-snap is a sharp change in daily high temperatures followed by a change back, with each leg taking no more than three or four days.

Here is the one on October 13, highs hit summer-like 87°F. Four days later, on October 17, they plunged 32°F down to 55°F, before rebounding back into the 70s over the following week.

{{< whiplash-figure src="october-2026.svg" height="260" alt="Daily highs in Bloomington, October 10-25, 2026. Highs fell from 87°F on October 13 to 55°F on October 17, then rebounded to 74°F by October 25." >}}

## Where do snip-snaps actually happen?

Experiencing weather whiplash in mid-October feels jarring because **fall reversals are historically rare**.

Looking across 130 years of daily records at Bloomington, temperature whiplashes are overwhelmingly a winter and early-spring phenomenon:

{{< whiplash-figure src="seasonality.svg" height="280" alt="Historical temperature reversals by month in Bloomington from 1895 to 2026. Reversals cluster heavily in winter and spring, reaching up to 44°F, while summer and early fall are quiet." >}}

In winter and early spring, the polar jet stream sits right over the Midwest, clashing arctic cold fronts violently against warm Gulf air. That is where Bloomington's record 40°F to 44°F swings happen.

Fall, by contrast, accounts for only about 15% of all historical reversals. Early fall is usually quiet because continental temperature contrasts are weak. But when an October whiplash does strike, it often happens because unseasonable summer heat lingers into mid-October, setting up a steep drop when an early cold front arrives.

## How rare is an extreme snip-snap?

To see how rare the strongest reversals are, I took the single biggest snip-snap from each of the 110 qualifying years in Bloomington's record.

The bars below show the observed distribution of these annual peaks. The curve is a [Gumbel distribution](https://en.wikipedia.org/wiki/Gumbel_distribution)—the standard tool used to calculate "100-year floods" and annual weather extremes:

{{< whiplash-figure src="gumbel-rarity.svg" height="300" alt="Histogram of each year's biggest snip-snap with a fitted Gumbel curve. Most years peak around 29°F. 35°F or more happens about 1 in 5 years, 40°F or more about 1 in 14, and 44°F or more about 1 in 37." >}}

In a typical year, the biggest swing peaks around 29°F. About one year in five brings a swing of 35°F or more, and about one in 14 reaches 40°F.

A 44°F swing is roughly a 1-in-37-year event (about a 3% annual chance). Bloomington has seen two in the last seven years—both during the winter/spring transition:

- **January 29 to February 3, 2019:** 46 → 2 → 48°F. [The B Square](https://bsquarebulletin.com/late-january-cold-sets-record-for-bloomington/) covered the record-setting cold, including the station's 2°F high.
- **March 16 to 21, 2026:** 71 → 27 → 76°F. [WRTV](https://www.wrtv.com/weather/march-weather-madness-from-snow-to-flooding-to-storms/) reported on downtown residents sunbathing in shorts two days before walking in snow.

## Is it getting worse?

Splitting the 130-year record in half shows that the entire curve has shifted: 1896-1960 (52 years) versus 1961-2026 (58 years).

{{< whiplash-figure src="gumbel-eras.svg" height="300" alt="Gumbel curves for 1896-1960 and 1961-2026. The recent curve sits about 3°F to the right and has a fatter tail beyond 40°F." >}}

The typical year's biggest reversal grew from about 29°F to 33°F. That modest shift in the median creates a dramatic change at the tail:

| Biggest snip-snap of the year | 1896-1960 | 1961-2026 |
| --- | --- | --- |
| 35°F or more | 1 in 8 years | 1 in 3.5 years |
| 40°F or more | 1 in 31 years | 1 in 10 years |
| 44°F or more | 1 in 91 years | 1 in 27 years |

## What I take from this

A 40°F snip-snap used to be a once-in-a-generation event in Bloomington; now it occurs roughly once a decade. And while the huge 44°F records belong to winter and spring, October swings are also becoming more frequent as warm days push deeper into autumn.

<details>
<summary>Methods</summary>

**Data.** Long-term daily maximum temperatures come from [NOAA GHCN-Daily, Bloomington IU (USC00120784)](https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/USC00120784.dly), downloaded November 1, 2026, with values through October 26, 2026. The October 2026 event uses verified daily highs from Bloomington Monroe County Airport (KBMG, USW00003893). Values with quality flags are dropped. The IU station reports at 7 a.m. ([station history](https://www.ncei.noaa.gov/access/homr/services/station/search?qid=GHCND:USC00120784&date=all)). Daily highs leave out nighttime temperatures.

**Snip-snaps.** A warm-cold-warm or cold-warm-cold sequence in which each leg takes one to three days with no missing values (relaxed to four days for the October 2026 illustration). Its size is the smaller of the two changes. A snip-snap belongs to the year of its turning point.

**Years.** These are the 108 complete years with at least 95% of daily highs, plus 2019 and 2026. NOAA has no 2019 values from August 27 to October 30, and 2026 is still in progress. Both years already contain a 44°F snip-snap, which ties the record. Missing days can only hide a bigger one, never shrink it. Between late August and October, the biggest snip-snap on record is 36°F. December has reached 42°F, so I'll check 2026 again in January.

**Fit.** Gumbel parameters were estimated by maximum likelihood: location 28.9°F and scale 4.2°F (Kolmogorov-Smirnov p = 0.62). A generalized extreme value curve and a three-parameter Weibull fit no better by AIC. A normal curve fits worse and makes 44°F look about five times rarer (1 in 188 years).

**Uncertainty.** Bootstrapped 90% ranges for the full-record return periods are 4-6 years (35°F), 11-22 years (40°F) and 24-64 years (44°F). For comparison, the observed years give 1 in 4, 1 in 11 and 1 in 55. The earlier half never went above 40°F (1959), so its 44°F figure extrapolates beyond what was observed.

**Return periods.** “1 in N years” means a 1/N chance in any given year, not a fixed schedule. It assumes conditions are stable within each period. The shift between the two halves suggests they are not stable over the whole record.

[Figure script](/posts/whiplash/build_gumbel_figures.py) · [Fitted values](/posts/whiplash/data/gumbel-summary.json)

</details>
