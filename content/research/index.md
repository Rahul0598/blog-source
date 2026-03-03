---
title: "Research"
date: "2024-01-01"
draft: false
katex: false
back_to_top: false
---

I am a PhD researcher in Informatics at Indiana University's [Healthy Cities Lab](https://healthycities.sice.indiana.edu), advised by Dr. Dana Habeeb. My research sits at the intersection of **urban climate science**, **geospatial machine learning**, and **public health** — with a focus on understanding how the built environment shapes heat exposure and vulnerability for city residents.

---

## Research Interests

- **Urban Heat & Climate** - Microclimate variability, urban heat islands, Local Climate Zone (LCZ) mapping, and the role of urban morphology in shaping surface and near-surface temperatures.
- **Geospatial AI & Earth Observation** - Applying foundation model embeddings (e.g., Google's AEF), CNNs, and ensemble methods to remote sensing data (Landsat-8, Sentinel-2, NAIP) for urban classification and prediction tasks.
- **Spatiotemporal Modeling** - Predicting hyperlocal air temperature from sparse in-situ sensors using ML/DL architectures enhanced with Earth observation context.
- **Heat-Health Equity** - Integrating electronic health records, socio-economic indicators, and meteorological data to identify demographically vulnerable populations exposed to extreme heat.
- **Sensor Networks & Personal Exposure** - Designing distributed IoT sensor deployments and analyzing wearable-based heat exposure data to study intra-urban thermal variability.

---

## Current Projects

### Urban Representation Learning for Temperature Prediction
Predicting hourly 10m near-surface air temperature across entire cities using sparse in-situ sensors. Leverages precomputed Earth observation embeddings from Google's AEF foundation model to encode urban landscape context, reducing manual feature engineering while improving generalization across cities.

### Local Climate Zone (LCZ) Classification
A multi-modal framework for categorizing urban environments into standardized LCZs using decision tree ensembles and neural network architectures on Google Earth Engine. Includes end-to-end pipelines for feature engineering, CNN-based feature extraction, and validation against hyperlocal sensor data. [Classified imagery on ArcGIS](https://iu.maps.arcgis.com/home/item.html?id=22673fb225b844a38c2cb59e07944fe9). *(Manuscript under review)*

### Heat-Health Analysis
Spatiotemporal modeling of heat-related emergency department visits in two Midwest communities. Integrates hospital records, weather station observations, and census socio-economic data using statistical models in R to quantify demographic vulnerability and exposure thresholds.

### Heat Vulnerability Dashboard
A municipal decision-support platform for extreme heat planning. Uses PCA-based index construction across socio-economic, health, and environmental indicators to produce a Heat Vulnerability Index (HVI). Built as a fully interactive public-facing web interface. [Live dashboard (Richmond, IN)](https://healthycities.luddy.indiana.edu/beattheheat/hvmt/richmond.html)

### Urban Sensor Network & Real-Time Dashboard
Sited and deployed a city-wide distributed temperature sensor network informed by LCZ outputs and urban form analysis. Built a real-time streaming dashboard (Flask API + Chart.js) to visualize in-situ measurements from across the network. [Live dashboard](https://healthycities.luddy.indiana.edu/sensor/city.html)

---

## Tools & Methods

| Category | Tools |
|---|---|
| **Remote Sensing** | Google Earth Engine, Landsat-8, Sentinel-2, NAIP, GDAL |
| **GIS** | QGIS, ArcGIS Pro, ArcPy, PostGIS |
| **ML / DL** | Scikit-learn, PyTorch, Decision Tree Ensembles, CNNs |
| **Spatiotemporal** | Time-series ML, Spatial interpolation, R (spatial packages) |
| **Data & Apps** | Python, R, PostgreSQL, Flask, Chart.js, Shiny, Tableau |
| **Cloud & Infra** | GCP, Docker, Terraform, CI/CD |
