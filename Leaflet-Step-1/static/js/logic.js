// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

var platesUrl = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json"

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


function geojsonMarkerOptions(mag) {
    return({
    radius: markerRadius(mag),
    fillColor: markerColour(mag),
    color: "#000",
    // weight: 1,
    opacity: 1,
    fillOpacity: 1})
};


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng){
          return L.circleMarker(latlng, geojsonMarkerOptions(feature.properties.mag))
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
    //console.log(radius)

    return radius;
}

function markerColour(mag){
    var colour;
    console.log(mag)
    if (mag < 1){
        colour = "#00ff00"
    }
    else if (mag <3){
        colour = "#ccff99"
    }
    else if (mag <5){
        colour = "#f8a816"
    }
    else if (mag <7){
        colour = "#ff7800"
    }
    else if (mag <9){
        colour = "#ff3300"
    }
    else{
        colour = "#ff0000"
    }
    //console.log(colour)
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


  // Define a baseMaps object to hold our base layers
//   var baseMaps = {
//     "Street Map": streetmap,
//     "Dark Map": darkmap
//   };
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
    const mags = [0, 2, 4, 6, 8, 10];

    mags.forEach((mag, i) => {
      const next = mags[i + 1] ? '&ndash; ' + mags[i + 1] + '<br>' : '+';
      div.innerHTML += `<div class="legend-range" style="background: ${markerColour(
        mags[i]
      )}">${mags[i]} ${next}</div>`;
    });

    return div;
  }

  // Adding legend to the map
  legend.addTo(myMap);
}
