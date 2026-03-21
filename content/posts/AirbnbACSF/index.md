---
title: "AAG 2026 and AirBnBs without AC"
slug: "where-san-francisco-airbnb-listings-offer-ac"
date: "2026-03-21"
draft: false
katex: false
toc: false
tags: ["gis", "data-viz"]
back_to_top: true
website_carbon: true
---

I was in San Francisco between March 17 and 21 for the annual American Association of Geographers (AAG) conference, and I stayed in an Airbnb. I was excited to stay in sunny California, and escape the Indiana's snowy weather, but was surprised by how much hotter SF was in comparison. I was greeted by a "heat advisory" in effect until the end of the week.

I loved walking along the streets, enjoying tram rides, even though I was sweaty outdoors. The harder part was indoors. My room did not have air conditioning, which meant uncomfortably warm nights. Opening the window didn’t help as there was little wind, and the surrounding urban form (dense mid/high-rise buildings, what we’d classify as compact LCZs) seemed to trap heat. The only real relief was a small portable fan balanced on a chair and pointed at the bed.

Observations from KSFO, the weather station at San Francisco International Airport, show just how anomalous the week was. Daily highs reached 82°F on March 17, 80°F on March 18, 81°F on March 19, and 88°F on March 20. The March normal high at SFO is 63.4°F, so those days were roughly 17°F to 25°F warmer than a typical March day. Peak “feels like” temperatures during the period climbed above 85°F.

That experience made me wonder how many short-term rentals in San Francisco actually advertise cooling. So I built this interactive map to examine where Airbnb listings say they offer air conditioning, where they do not, and where they mention fans instead. You can pan around the city, filter listings, search by name or Airbnb URL, and click any point to inspect the listing details. You can also open the visualization directly in a full browser tab [here](/posts/airbnb-ac-sf/sf-airbnb-ac-map.html).


<div class="full-width-embed" style="height: 780px; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; margin: 24px 0;">
<iframe
    src="/posts/airbnb-ac-sf/sf-airbnb-ac-map.html"
    width="100%"
    height="100%"
    frameborder="0"
    style="border: none;">
    Your browser does not support iframes. Please visit the <a href="/posts/airbnb-ac-sf/sf-airbnb-ac-map.html">interactive map</a> directly.
</iframe>
</div>

The citywide numbers proved my suspicions. Of 7,535 San Francisco Airbnb listings in the dataset, 5,508 listings, or 73.1%, do not advertise air conditioning. Only 2,027 listings, or 26.9%, do. Another 1,243 listings mention a portable fan, and 1,519 mention some kind of fan amenity. Even so, 4,245 listings, or 56.3%, advertise neither AC nor any fan at all.

That matters because heat risk is not experienced evenly across a city. A single airport station such as KSFO can tell us that a week was unusually hot, but it cannot tell us how that heat was experienced from block to block, building to building. Urban form, street geometry, wind exposure, building materials, and access to indoor cooling all shape what heat actually feels like on the ground. That is why assumptions like “San Francisco is cool” break down quickly during anomalous events. During a hot week, the difference between a shaded, breezy location and a dense block with little ventilation can be the difference between manageable discomfort and unsafe indoor conditions.

Two things seem increasingly clear. First, we need more hyperlocal temperature mapping to understand neighborhood-scale heat exposure. Second, cooling access is no longer a luxury amenity. In dense urban areas, the absence of AC, or even adequate ventilation, can turn a short heat event into a serious problem.

This is something I’ve been thinking about more through my work on urban temperature modeling: how do we move from coarse, city-wide averages to actionable, building-scale insights? Because ultimately, heat isn’t experienced as an average—it’s experienced where you are.
