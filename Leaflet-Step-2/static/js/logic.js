// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

function createFeatures(earthquakeData, platesDataFeatures) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

function geojsonMarkerOptions(mag,sig) {
    return({
    radius: markerRadius(mag),
    fillColor: markerColour(sig),
    color: "#000",
    // weight: 1,
    opacity: 1,
    fillOpacity: 1})
};

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng){
          return L.circleMarker(latlng, geojsonMarkerOptions(feature.properties.mag, feature.properties.sig))
      },
    onEachFeature: onEachFeature
  });

  var plateData = L.geoJSON(platesDataFeatures, {
    style: function () {
      return { color: 'orange', stroke: true, weight: 1, fillOpacity: 0 };
    },
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes,plateData);
}

function markerRadius(mag){
    var radius =8;
    var inc = 3;
    if (mag < 2){
        radius += inc;
    }
    else if (mag <3){
        radius += 2*inc;
    }
    else if (mag <4){
        radius += 3*inc;
    }
    else if (mag <5){
        radius += 4*inc;
    }
    else if (mag <6){
        radius += 5*inc;
    }
    else if (mag <7){
        radius += 6*inc;
    }
    else{
        radius += 7*inc;
    }
    return radius;
}

function markerColour(sig){
    var colour;
    console.log(sig)
    if (sig <= 10){
        colour = "#80ff80"
    }
    else if (sig <= 30){
        colour = "#d9ff66"
    }
    else if (sig <= 50){
        colour = "#ffdb4d"
    }
    else if (sig <= 70){
        colour = "#ffc266"
    }
    else if (sig <= 90){
        colour = "#ff9900"
    }
    else{
        colour = "#ff1a1a"
    }
    return colour;
}

function createMap(earthquakes, plateData) {


  var grayscaleMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.light',
      accessToken: API_KEY,
    }
  );

  var satelliteMap = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: API_KEY,
    }
  );

  var outdoorsMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: API_KEY,
    }
  );

 // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    PlateData: plateData
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [satelliteMap, earthquakes, plateData]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const mags = [-10, 10, 30, 50, 70, 90];
    const magsColour = ["#80ff80", "#d9ff66", "#ffdb4d", "#ffc266", "#ff9900", "#ff1a1a"]
    mags.forEach((mag, i) => {
      const next = mags[i + 1] ? '&ndash; ' + mags[i + 1] + '<br>' : '+';
      div.innerHTML += `<div class="legend-range" style="background: ${magsColour[i]}">${mags[i]} ${next}</div>`;
    });

    return div;
  }

  // Adding legend to the map
  legend.addTo(myMap);
}

const init = async() => {
  // Perform a GET request to the query URL
var earthData = await d3.json(queryUrl).then(function(data) {
  console.log(data)
  // Once we get a response, send the data.features object to the createFeatures function
  return data;
});

var platesData = await d3.json(platesUrl).then(function(platesData){
  return platesData;
})

createFeatures(earthData.features, platesData.features);
}
init();