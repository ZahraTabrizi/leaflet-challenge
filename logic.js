// URL for earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function (data) {
 
  createFeatures(data.features);
});

// Define a function to set circle color based on depth
function depthColor(depth) {
  const depthRanges = [10, 30, 50, 70, 90];
  const colors = ["Turquoise", "LightGreen", "Yellow", "Orange", "DarkOrange", "Red"];

  for (let i = 0; i < depthRanges.length; i++) {
    if (depth > depthRanges[i]) {
      return colors[i + 1];
    }
  }

  return colors[0];
}


function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  };


  function markerSize(magnitude) {
    return magnitude * 5;
  };


  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: depthColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  // Send earthquakes layer 
  createMap(earthquakes);
};

// Add items to the tilelayer and create basemap object
function createMap(earthquakes) {
  // Create base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create baseMaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create overlay object 
  let overlayMaps = {
    Earthquakes: earthquakes
  };

    // Create map
let myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 3,
  layers: [street, earthquakes]
});

// layer control
// baseMaps and overlayMaps.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// legend control
let legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend"),
    depths = [-10, 10, 30, 50, 70, 90],
    labels = [];
  
    // background color
  div.style.backgroundColor = "white"; 
  // border
  div.style.border = "5px solid black"; 

  // Define the legend HTML template
let legendTemplate = '<strong>Depth (km)</strong><br>';

// Loop: depths array, color squares, labels to the legend
for (var i = 0; i < depths.length; i++) {
  let color = depthColor(depths[i] + 1);
  let label = depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
  let colorSquare = `<i style="background:${color}; width: 10px; height: 10px; display: inline-block;"></i>`;
  legendTemplate += colorSquare + ' ' + label;
}

// Add the legend HTML
div.innerHTML += legendTemplate;

  return div;
};

// Add legend to map
legend.addTo(myMap);
};