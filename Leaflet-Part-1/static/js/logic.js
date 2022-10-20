// Store our API as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL
d3.json(queryURL).then(function(data){

    // Send the data.features and data.features object to the createFeatures function.
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData, platesData){

    // Create popups describing place and time of earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Create a GeoJSON layer containing the features
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.35
       } 
       return L.circleMarker(latlng,options);
    }
    // Create a variable for earthquakes to store features
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Circles color palette based on magnitude (feature) data marker
function chooseColor(mag){
    switch(true){
        case(1.0 <= mag && mag <= 2.5):
            return "#0071BC"; // Strong blue
        case (2.5 <= mag && mag <=4.0):
            return "#35BC00";
        case (4.0 <= mag && mag <=5.5):
            return "#BCBC00";
        case (5.5 <= mag && mag <= 8.0):
            return "#BC3500";
        case (8.0 <= mag && mag <=20.0):
            return "#BC0000";
        default:
            return "#E2FFAE";
    }
}

// Create map legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [1.0, 2.5, 4.0, 5.5, 8.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // Color legend on each magnitude item to label
    // Push to labels as list items
    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // Add each label list item to the div
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };


// Create map
function createMap(earthquakes) {
    // Create the base layers
    let street = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    // Create a baseMaps object
    let baseMaps = {
      "Street Map": street,
      // "Topographic Map"
    };

    // Create an overlay object
    let overlayMaps = {
      Earthquakes: earthquakes,
      
    };

  // Create streetmap and earthquakes layers to display
  let myMap = L.map("map", {
    center: [
      39.8282, -98.5795
    ],
    zoom: 4,
    layers: [street, earthquakes]
  });
  // Add the layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}