// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data.features)
  createFeatures(data.features);

});

function createFeatures(earthquakeData) {

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

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
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

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var baseMaps = {
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
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
