// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"



function createFeatures(earthquakeData, platesDataFeatures) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
//console.log(plateData)

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

function createMap(earthquakes, plateData) {

  // Define streetmap and darkmap layers
//   var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     tileSize: 512,
//     maxZoom: 18,
//     zoomOffset: -1,
//     id: "mapbox/streets-v11",
//     accessToken: API_KEY
//   });

//   var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "dark-v10",
//     accessToken: API_KEY
//   });
  
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

const init = async() => {
  // Perform a GET request to the query URL
var earthData = await d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  return data;
});

var platesData = await d3.json(platesUrl).then(function(platesData){
  console.log("Inside ")
  console.log(platesData)
  return platesData;
})
console.log("After ")
console.log(platesData)

createFeatures(earthData.features, platesData.features);
}
init();