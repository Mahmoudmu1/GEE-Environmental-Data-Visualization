# GEE-Environmental-Data-Visualization

# 🌍 Environmental Data Visualization using Google Earth Engine

This repository presents a comparative **NDVI (Normalized Difference Vegetation Index)** and **LST (Land Surface Temperature)** trend analysis using **Landsat 8** and **MODIS** datasets in **Google Earth Engine (GEE)**.  
The primary study focuses on **Alicante, Spain (2014–2023)**, with **Perak, Malaysia** serving as a test region for method validation.

---

## 🧠 Project Overview

- **Objective:**  
  Analyze vegetation health and temperature variations across different regions and years using remote sensing data.

- **Supervisor:**  
  Universiti Utara Malaysia (UUM) – Human-Centered Computing (HCC) Program  

- **Duration:**  
  June 2025 – July 2025  

- **Main Study Area:**  
  Alicante, Spain  

- **Test Region:**  
  Perak, Malaysia  

---

## 🧰 Tech Stack

| Category | Tools / Technologies |
|-----------|----------------------|
| Platform | Google Earth Engine (JavaScript API) |
| Datasets | Landsat 8 Collection 2 L2, MODIS (061 MOD11A2) |
| Metrics | NDVI, LST (Land Surface Temperature) |
| Exports | CSV, GeoJSON, PNG |
| Visualization | Canva (Presentation Design) |
| Programming Languages | JavaScript, HTML (GEE UI components) |

---

## 🧩 Scripts

| Region | Dataset | Description | File / GEE Link |
|--------|----------|--------------|-----------------|
| **Spain (Alicante)** | Landsat 8 & MODIS | Full NDVI & LST analysis (2014–2023) | [`scripts/spain_gee_script.js`](scripts/spain_gee_script.js)|
| **Malaysia (Perak)** | Landsat 8 L2 | NDVI, emissivity & LST visualization with legend | [`scripts/malaysia/malaysia_landsat_lst_perak.js`](scripts/malaysia/malaysia_landsat_lst_perak.js) |
| **Malaysia (Perak)** | MODIS LST Day 1 km | DOY-by-year chart & mean LST time-series | [`scripts/malaysia/malaysia_modis_lst_perak_timeseries.js`](scripts/malaysia/malaysia_modis_lst_perak_timeseries.js) |

---

## 📈 How to Generate Results

All results (NDVI and LST maps, time-series charts, and temperature visualizations) can be reproduced directly by running the provided GEE scripts in the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).

Each script automatically:
- Filters and preprocesses Landsat 8 or MODIS datasets
- Computes NDVI and Land Surface Temperature (LST)
- Displays visual layers and charts
- Allows exporting CSV or GeoJSON data if needed

> This repository focuses on **code reproducibility** rather than static outputs.  
> Anyone can run the scripts to generate updated results for other regions or timeframes.

---

## 🎨 Presentation

The project findings are summarized in a **Canva presentation** that visualizes NDVI & LST patterns, comparative insights between Spain and Malaysia, and research outcomes.

📄 **Presentation File:**  
[`Alicante_Analysis_Presentation.pdf`](presentation/Alicante_Analysis_Presentation.pdf)

*(Add your Canva share link here if you’d like others to view it online.)*

---

## 📂 Repository Structure

GEE-Environmental-Data-Visualization/
├── scripts/
│ ├── spain_gee_script.js
│ └── malaysia/
│ ├── malaysia_landsat_lst_perak.js
│ └── malaysia_modis_lst_perak_timeseries.js
├── presentation/
│ └── Alicante_Analysis_Presentation.pdf
└── README.md


---

## 🧭 Author

**Mahmoud M.**  
🎓 Universiti Utara Malaysia (UUM)  
📍 Human-Centered Computing Program  
🔗 [GitHub Repository](https://github.com/Mahmoudmu1/GEE-Environmental-Data-Visualization)

---

## 🧩  

---
