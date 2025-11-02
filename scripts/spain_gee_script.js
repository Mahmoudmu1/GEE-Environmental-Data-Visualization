// =======================================================
// 1. Load and Filter Region of Interest (ROI)
// =======================================================

// Load the full Spain Level 2 shapefile from your Assets
var spain = ee.FeatureCollection("projects/mymemeberlink/assets/gadm41_ESP_2");

// Filter only the Alicante region
var roi = spain.filter(ee.Filter.eq('NAME_1', 'Alicante'));

// Visualize Alicante boundary
Map.addLayer(roi, {}, 'Alicante');
Map.centerObject(roi, 9);

// =======================================================
// 2. Helper Functions
// =======================================================

// Apply scaling factors to Landsat 8 Collection 2, Tier 1 imagery
function applyScaleFactors(image) {
  var optical = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermal = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(optical, null, true)
              .addBands(thermal, null, true);
}

// Mask clouds and cloud shadows
function cloudMask(image) {
  var qa = image.select('QA_PIXEL');
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
               .and(qa.bitwiseAnd(cloudBitmask).eq(0));
  return image.updateMask(mask);
}

// =======================================================
// 3. Main Function: Compute LST and NDVI per Year
// =======================================================

function calculateLST(year) {
  var start = ee.Date.fromYMD(year, 6, 1);
  var end = ee.Date.fromYMD(year, 9, 21);

  // Filter Landsat imagery
  var image = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                .filterBounds(roi)
                .filterDate(start, end)
                .map(applyScaleFactors)
                .map(cloudMask)
                .median()
                .clip(roi);

  // Compute NDVI
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');

  // Compute NDVI-based emissivity
  var ndviMin = ee.Number(ndvi.reduceRegion({
    reducer: ee.Reducer.min(),
    geometry: roi,
    scale: 30,
    maxPixels: 1e9
  }).values().get(0));

  var ndviMax = ee.Number(ndvi.reduceRegion({
    reducer: ee.Reducer.max(),
    geometry: roi,
    scale: 30,
    maxPixels: 1e9
  }).values().get(0));

  var pv = ndvi.subtract(ndviMin).divide(ndviMax.subtract(ndviMin))
               .pow(2).rename('PV');

  var em = pv.multiply(0.004).add(0.986).rename('EM');
  var thermal = image.select('ST_B10').rename('thermal');

  // Compute Land Surface Temperature (LST)
  var lst = thermal.expression(
    '(TB / (1 + (0.00115 * (TB / 1.438)) * log(em))) - 273.15', {
      'TB': thermal.select('thermal'),
      'em': em
    }).rename('LST Alicante ' + year);

  // ===========================
  // Visualization on the Map
  // ===========================

  Map.addLayer(image, {
    bands: ['SR_B4', 'SR_B3', 'SR_B2'],
    min: 0.0, max: 0.15
  }, 'True Color 432 - ' + year);

  Map.addLayer(ndvi, {
    min: -1, max: 1,
    palette: ['blue', 'white', 'green']
  }, 'NDVI Alicante - ' + year);

  Map.addLayer(lst, {
    min: 15, max: 45,
    palette: [
      '040274','040281','0502a3','0502b8','0502ce','0502e6','0602ff','235cb1','307ef3','269db1','30c8e2','32d3ef',
      '3be285','3ff38f','86e26f','3ae237','b5e22e','d6e21f','fff705','ffd611','ffb613','ff8b13','ff6e08','ff500d',
      'ff0000','de0101','c21301','a71001','911003'
    ]
  }, 'LST - ' + year);

  // ===========================
  // Export NDVI, LST, and True Color
  // ===========================

  Export.image.toDrive({
    image: ndvi,
    description: 'NDVI_Alicante_' + year,
    folder: 'GEE_Exports',
    fileNamePrefix: 'NDVI_Alicante_' + year,
    region: roi.geometry(),
    scale: 30,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });

  Export.image.toDrive({
    image: lst,
    description: 'LST_Alicante_' + year,
    folder: 'GEE_Exports',
    fileNamePrefix: 'LST_Alicante_' + year,
    region: roi.geometry(),
    scale: 30,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });

  Export.image.toDrive({
    image: image.select(['SR_B4', 'SR_B3', 'SR_B2']),
    description: 'TrueColor_Alicante_' + year,
    folder: 'GEE_Exports',
    fileNamePrefix: 'TrueColor_Alicante_' + year,
    region: roi.geometry(),
    scale: 30,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });
}

// =======================================================
// 4. Run the LST Calculation for Each Year
// =======================================================

var years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
years.forEach(function(year) {
  calculateLST(year);
});

// =======================================================
// 5. Add LST Legend to the Map
// =======================================================

var minLST = 15;
var maxLST = 45;
var palette = [
  '040274','040281','0502a3','0502b8','0502ce','0502e6','0602ff','235cb1','307ef3','269db1','30c8e2','32d3ef',
  '3be285','3ff38f','86e26f','3ae237','b5e22e','d6e21f','fff705','ffd611','ffb613','ff8b13','ff6e08','ff500d',
  'ff0000','de0101','c21301','a71001','911003'
];

var step = (maxLST - minLST) / (palette.length - 1);
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px 15px', backgroundColor: 'white'}});

legend.add(ui.Label({
  value: 'Land Surface Temperature (°C)',
  style: {fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0'}
}));

for (var i = 0; i < palette.length; i++) {
  legend.add(ui.Panel({
    widgets: [
      ui.Label({style: {
        backgroundColor: '#' + palette[i],
        padding: '5px',
        margin: '0 0 5px 0',
        width: '30px'
      }}),
      ui.Label({
        value: (minLST + i * step).toFixed(2),
        style: {fontSize: '10px', margin: '0 0 5px 6px'}
      })
    ],
    layout: ui.Panel.Layout.Flow('horizontal')
  }));
}
Map.add(legend);

// =======================================================
// 6. Add Map Title
// =======================================================

Map.add(ui.Panel([
  ui.Label({
    value: 'Land Surface Temperature - Alicante (2014–2023)',
    style: {fontWeight: 'bold', fontSize: '20px', padding: '8px'}
  })
], ui.Panel.Layout.Flow('vertical'), {
  position: 'top-center'
}));

// =======================================================
// 7. MODIS LST Time Series and Exports
// =======================================================

// Load and scale MODIS LST imagery
var collection = ee.ImageCollection('MODIS/061/MOD11A2')
  .select("LST_Day_1km")
  .filterDate('2014-01-01', '2023-12-31')
  .filterBounds(roi);

var LSTDay = collection.map(function(img) {
  return img.multiply(0.02).subtract(273.15)
    .copyProperties(img, ['system:time_start', 'system:time_end']);
});

// Chart 1: Annual LST Variation by Day of Year
var chart = ui.Chart.image.doySeriesByYear(
  LSTDay, 'LST_Day_1km', roi, ee.Reducer.mean(), 1000
).setOptions({
  title: 'Annual Variation of LST in Alicante (MODIS)',
  vAxis: {title: 'Temperature (°C)'},
  hAxis: {title: 'Day of Year'}
});
print(chart);

// Mean LST Map (2014–2023)
Map.addLayer(LSTDay.mean().clip(roi), {
  min: 20.0,
  max: 40.0,
  palette: palette
}, 'Mean LST MODIS (2014–2023)');

// Export MODIS mean LST image
Export.image.toDrive({
  image: LSTDay.mean().clip(roi),
  description: 'MODIS_LST_Mean_2014_2023',
  folder: 'GEE_Exports',
  fileNamePrefix: 'MODIS_LST_Mean_2014_2023',
  region: roi.geometry(),
  scale: 1000,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

// Export MODIS LST time series data
var timeseries = LSTDay.map(function(image) {
  var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');
  var mean = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: roi,
    scale: 1000,
    maxPixels: 1e13
  }).get('LST_Day_1km');
  return ee.Feature(null, {'date': date, 'mean_LST': mean});
});
var timeseries_fc = ee.FeatureCollection(timeseries);

Export.table.toDrive({
  collection: timeseries_fc,
  description: 'MODIS_LST_Timeseries_Alicante_2014_2023',
  folder: 'GEE_Exports',
  fileNamePrefix: 'MODIS_LST_Timeseries_Alicante_2014_2023',
  fileFormat: 'CSV'
});

// Chart 2: Full Time Series (Mean LST)
var chart2 = ui.Chart.image.series({
  imageCollection: LSTDay,
  region: roi,
  reducer: ee.Reducer.mean(),
  scale: 1000,
  xProperty: 'system:time_start'
}).setOptions({
  title: 'Mean LST Over Time (2014–2023)',
  vAxis: {title: 'Temperature (°C)'},
  hAxis: {title: 'Date'},
  lineWidth: 1,
  pointSize: 3
});
print(chart2);
