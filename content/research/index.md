---
title: "Research"
draft: false
katex: false
back_to_top: false
website_carbon: true
hide_meta: true
aliases: ["/publications/"]
---

I am a PhD researcher in Informatics at Indiana University's [Healthy Cities Lab](https://healthycities.sice.indiana.edu), advised by Dr. Dana Habeeb. My work sits at the intersection of **urban climate science**, **geospatial machine learning**, and **public health**. In simple terms: I study where heat concentrates in cities, who is the most vulnerable, and how we can build practical tools to reduce risk.

## Current Projects

<div class="research-card">

### Urban Representation Learning for Temperature Prediction
I am developing models to predict hourly 10m near-surface air temperature across entire cities using sparse in-situ sensors. This work uses precomputed Earth observation embeddings from Google's AEF foundation model to represent urban context, reduce manual feature engineering, and improve transfer across cities.

</div>

<div class="research-card">

### Local Climate Zone (LCZ) Classification
I built a multi-modal framework to classify urban environments into standardized LCZs using decision tree ensembles and neural network architectures on Google Earth Engine. The system includes end-to-end feature engineering, CNN-based feature extraction, and validation against hyperlocal sensor measurements. [Classified imagery on ArcGIS](https://iu.maps.arcgis.com/home/item.html?id=22673fb225b844a38c2cb59e07944fe9). *(Manuscript under review)*

</div>

<div class="research-card">

### Heat-Health Analysis
I use spatiotemporal models to analyze heat-related emergency department visits in two Midwest communities. This work integrates hospital records, weather observations, and census socio-economic data in R to quantify exposure thresholds and demographic vulnerability patterns.

</div>

<div class="research-card">

### Heat Vulnerability Dashboard
I co-developed a municipal decision-support platform for extreme heat planning. It uses PCA-based index construction across socio-economic, health, and environmental indicators to produce a Heat Vulnerability Index (HVI), delivered through a public-facing interactive web interface. [Live dashboard (Richmond, IN)](https://healthycities.luddy.indiana.edu/beattheheat/hvmt/richmond.html)

</div>

<div class="research-card">

### Urban Sensor Network & Real-Time Dashboard
I helped site and deploy a city-wide distributed temperature sensor network informed by LCZ outputs and urban form analysis. I also built a real-time streaming dashboard (Flask API + Chart.js) to visualize in-situ measurements from across the network. [Live dashboard](https://healthycities.luddy.indiana.edu/sensor/city.html)

</div>

## Publications

[Download CV (PDF)](/resume.pdf) · [Google Scholar](https://scholar.google.com/citations?hl=en&user=q6LkEwgAAAAJ)

### Journal Articles

Habeeb, D., **Devajji, R.**, et al. (2025). Design and Evaluation of Wearable Solar Radiation Shields for Enhanced Personal Heat Exposure Monitoring. *Sensors*, 25(3), 945.

### Conference Papers & Presentations

**Devajji, R.**, Habeeb, D., & Wilson, J. S. (2025). Extreme Heat and Health Impacts: A Study of Emergency Department Visits in Midwest Communities. *American Association of Geographers (AAG) Annual Meeting*.

Habeeb, D., **Devajji, R.**, & Wilson, J. (2025). Local Climate Zones Validation Utilizing Hyperlocal Near-Surface Air Temperature Data. *American Association of Geographers (AAG) Annual Meeting*.

**Devajji, R.** & Habeeb, D. (2025). A Machine Learning Approach to Predicting Hyperlocal Temperature in the Built Environment. *Association of Collegiate Schools of Planning (ACSP) Annual Conference*.

Habeeb, D., **Devajji, R.**, Subramanian, L., Davis, L., & Gumaer, J. (2025). Heat Vulnerability Dashboard: A Decision Support Tool for Extreme Heat. *Association of Collegiate Schools of Planning (ACSP) Annual Conference*.

Tu, H., **Devajji, R.**, & Horan, T. (2025). Algorithmic Literacy and Digital Privacy in the US: An Exploratory Study Using Data Visualization. *IEEE International Conference on Advanced Data Visualization (ICAD)*.

Habeeb, D., Polak, N., & **Devajji, R.** (2024). Leveraging an Urban Environmental Sensing Network to Improve Extreme Heat Resilience. *IEEE International Green and Sustainable Computing Conference (IGSC)*.

### Invited Talks

**Devajji, R.** (2025). SDG 13.3 and Early Warning Systems (EWS): AI in Extreme Heat Resilience. *AICTE ATAL Faculty Development Program, RNS Institute of Technology (RNSIT), Bengaluru* (3-hour invited session; alma mater).

### Grants Awarded

**Nick Polak and Rahul Devajji** (2023-2024): <a href="https://environment.indiana.edu/academics/scholarships/srdg.html#:~:text=Nick%20Polak%20and%20Rahul%20Devajji%3A%20Environmental%20sensing%20for%20extreme%20heat" target="_blank" rel="noopener noreferrer">Sustainability Research and Development Grant (SRDG): Environmental sensing for extreme heat</a> ($10,000)


## Tools & Methods

| Category | Tools |
|---|---|
| **Earth Observation** | Google Earth Engine |
| **Geospatial Analysis** | GDAL, Rasterio, GeoPandas, PostGIS |
| **GIS Platforms** | QGIS, ArcGIS Pro, ArcPy, ESRI JS SDK |
| **Machine Learning** | Scikit-learn, PyTorch, Decision Tree Ensembles, CNNs |
| **Spatial & Statistical Modeling** | R (GLM, spatial packages), time-series analysis |
| **Urban Sensing** | Distributed sensor networks, IoT environmental monitoring |
| **Data Engineering** | Python pipelines, PostgreSQL, ETL workflows |
| **Visualization & Apps** | Plotly Dash, Flask API, Chart.js, Shiny, Tableau |
| **Cloud & Compute** | Google Cloud Platform, HPC clusters, Docker |
| **Reproducible Research** | Git, GitHub, Jupyter, containerized workflows |
