// Store the API endpoint.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Send the data.features object to the createFeatures function.
  createFeatures(data.features);
  console.log("data: ", data);
});

function createFeatures(earthquakeData) {

  // Function to determine circle marker color based on earthquake depth
  function getColor(depth) {
    return depth > 90 ? "#FF5F65" :
           depth > 70 ? "#FCA35D" :
           depth > 50 ? "#FDB72A" :
           depth > 30 ? "#F7DB11" :
           depth > 10 ? "#DCFF5E" :
                        "#A3F600";
  }

  // Function to determine marker radius based on magnitude
  function getRadius(magnitude) {
    return magnitude * 4; // Adjust multiplier for better visualization
  }

  // Define a function to create a popup for each earthquake marker
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>
      <p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`
    );
  }

  // Create a GeoJSON layer with circle markers based on earthquake data
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
  });

  // Send the earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data & OpenStreetMap contributors, SRTM | Map style OpenTopoMap (CC-BY-SA)'
  });

  // Create a baseMaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold the earthquake layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map with initial layers and center position
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Add layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend for the depth color scale
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend"),
        depthLevels = [-10, 10, 30, 50, 70, 90],
        colors = ["#A3F600", "#DCFF5E", "#F7DB11", "#FDB72A", "#FCA35D", "#FF5F65"];

    // Loop through depth intervals and create a colored square for each interval
    for (let i = 0; i < depthLevels.length; i++) {
      div.innerHTML +=
        '<div style="display: flex; align-items: center"> <i style="width: 10px; height: 10px; display: block; margin-right: 4; background-color:' + colors[i] + '"></i> ' +
        depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '</div>' : '+');
    }

    return div;
  };

  // Add the legend to the map
  legend.addTo(myMap);
}
