function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.coordinates[0] - p1.coordinates[0], 2) + Math.pow(p2.coordinates[1] - p1.coordinates[1], 2));
  }
  
  function calculatePathWeight(path, points) {
    let weight = 0.0;
    for (let i = 0; i < path.length - 1; ++i) {
      weight += calculateDistance(points[path[i]], points[path[i + 1]]);
    }
    weight += calculateDistance(points[path[path.length - 1]], points[path[0]]);
    return weight;
  }
  
  function tspBruteForce(n, points) {
    const path = Array.from({ length: n }, (_, i) => i);
    let minWeight = Number.MAX_SAFE_INTEGER;
    let minPath;
  
    do {
      const weight = calculatePathWeight(path, points);
      if (weight < minWeight) {
        minWeight = weight;
        minPath = path.slice();
      }
    } while (nextPermutation(path));
  
    const optimalPath = minPath.map((index) => points[index]);
    return { path: optimalPath, weight: minWeight };
  }
  
  function nearestNeighborTSP(n, points) {
    let unvisited = new Set([...Array(n).keys()]);
    const path = [];
    let current = 0; // Start from node 0
  
    while (unvisited.size > 1) {
      path.push(current);
      unvisited.delete(current);
  
      let nearest = null;
      let minDistance = Number.MAX_VALUE;
  
      for (let node of unvisited) {
        const distance = calculateDistance(points[current], points[node]);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = node;
        }
      }
  
      current = nearest;
    }
  
    // Add the last node to complete the cycle
    path.push(current);
  
    const optimalPath = path.map((index) => points[index]);
    const weight = calculatePathWeight(path, points);
  
    return { path: optimalPath, weight };
  }
  
  // Function to generate permutations
  function nextPermutation(arr) {
    let i = arr.length - 2;
    while (i >= 0 && arr[i] >= arr[i + 1]) {
      i--;
    }
  
    if (i >= 0) {
      let j = arr.length - 1;
      while (j > i && arr[j] <= arr[i]) {
        j--;
      }
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  
    const reverseTail = arr.splice(i + 1).reverse();
    arr.push(...reverseTail);
  
    return i >= 0;
  }
  
  // Example usage:
  function coordinatesToString(coordinates) {
    return `[${coordinates[0]}, ${coordinates[1]}]`;
  }
  

// Mapbox Public Access Key
mapboxgl.accessToken = 'pk.eyJ1IjoiamFjb2JtazgiLCJhIjoiY2xrcnNsdDRjMWU3cjNnbGtieXJmMzg5cyJ9.cf_XptPQMhPmMI-dmCXXXA';

// Initializing Map
var map = new mapboxgl.Map({
    // Map Cotainer ID
    container: 'map',
    // Mapbox Style URL
    style: 'mapbox://styles/jacobmk8/clkrsogh801r401p2263q6dp2',
    zoom: 11.5, // Default Zoom
    center:[-80.139198, 25.793449], // Waypoint 1
    // Default centered coordinate
});

// Search Places
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
});
// Direction Form
let directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    profile: 'mapbox/driving',
    interactive: false,
    controls: false
    

});

// Adding Search Places on Map
map.addControl(geocoder, 'top-left')


// Adding navigation control on Map
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

let waypoints = [

];
let orginalWaypoints = [

];
function clearGeocoder() {
    var geocoderInput = document.querySelector('.mapboxgl-ctrl-geocoder input');
    geocoderInput.value = ''; // Set the input value to an empty string
}

function resetMap() {
  // Clear the route
  directions.removeRoutes();

  // Clear the markers
  const markers = document.getElementsByClassName('waypoint-marker');
  for (let i = markers.length - 1; i >= 0; i--) {
    markers[i].remove();
  }

  // Clear the waypoints array
  waypoints.length = 0;
}


function updateMap(){
  directions.setOrigin(waypoints[0].coordinates);

  waypoints.slice(1, -1).forEach((waypoint, index) => {
      directions.addWaypoint(index, waypoint.coordinates, { name: waypoint.label });
      addMarker(waypoint.coordinates, waypoint.label, index + 1); // Add a marker for each waypoint (1-based index)
  });

  // Set destination
  directions.setDestination(waypoints[waypoints.length - 1].coordinates);

  // Function to add a custom circular marker at a specific coordinate with a label and index
  function addMarker(coordinates, label, index) {
      const markerElement = document.createElement('div');
      markerElement.className = 'waypoint-marker';
      markerElement.textContent = index;

      new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(label)) // Display label in a popup when clicked
          .addTo(map);
  }


// Function to calculate the ETA and print it to the console
function calculateETA(route) {
  if (route && route.duration) {
      const durationInSeconds = route.duration;
      const durationInMinutes = durationInSeconds / 60;
      var routeDistanceInMiles = route.distance * 0.000621371;

      console.log('Route Distance (miles):', routeDistanceInMiles);

      console.log('ETA:', durationInMinutes, 'minutes');
  } else {
      console.log('No route found or an error occurred.');
  }
}
  

if (waypoints.length > 1) {
      function calculateBoundingBox(waypoints) {
          const coordinates = waypoints.map(waypoint => waypoint.coordinates);
          return coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      }
      
      // Function to fit the map to the bounding box of all waypoints
      function fitMapToBounds(bounds) {
          map.fitBounds(bounds, {
              padding: 40 // Adjust the padding around the bounding box if needed
          });
      }
      
      // Example usage: Call this function after all waypoints are added
      const bounds = calculateBoundingBox(waypoints);
      fitMapToBounds(bounds);  

      directions.on('route', function (event) {
          // console.log('Directions API Response:', event);

          if (event.route && event.route[0]) {
              // Get the first route (there might be multiple alternatives)
              const route = event.route[0];
              calculateETA(route);
          } else {
              console.log('No route found or an error occurred.');
          }
      });
  
  }

}

//Function below updates information screen 

function updateInformation(ett, totalDistance, numWaypoints) {
  document.getElementById('ett').innerText = `ETT: ${ett} minutes`;
  document.getElementById('totalDistance').innerText = `Total Distance: ${totalDistance} miles`;
  document.getElementById('waypoints').innerText = `Waypoints: ${numWaypoints}`;
}
geocoder.on('result', function (event) {


   
    // Get the latitude and longitude from the result
    const latitude = event.result.geometry.coordinates[1];
    const longitude = event.result.geometry.coordinates[0];
    const name = event.result.place_name;

    // Print the latitude and longitude to the console
    // console.log('Latitude:', latitude);
    // console.log('Longitude:', longitude);
    const newWaypoint = {
        coordinates: [longitude, latitude],
        label: name
    };
    waypoints.push(newWaypoint);
    orginalWaypoints.push(newWaypoint);
    clearGeocoder();

    console.log(waypoints);

    //Label
     // create text
    //  const para = document.createElement("p");
    //  const node = document.createTextNode(newWaypoint.label);
    //  para.appendChild(node);
    //  const element = document.getElementById("nav");
    //  element.appendChild(para)
 // Example usage:
  
  const n = waypoints.length;
  
  // Get results using the two algorithms directly
  // const bruteForceResult = tspBruteForce(n, orginalWaypoints);
  // const tspResult = nearestNeighborTSP(n, orginalWaypoints);
  
  // console.log("Brute Force Result:", {
  //   path: bruteForceResult.path.map((point) => ({
  //     label: point.label,
  //     coordinates: coordinatesToString(point.coordinates)
  //   })),
  //   weight: bruteForceResult.weight
  // });
  // console.log("TSP Result:", {
  //   path: tspResult.path.map((point) => ({
  //     label: point.label,
  //     coordinates: coordinatesToString(point.coordinates)
  //   })),
  //   weight: tspResult.weight
  // });


    // Set origin and waypoints
    directions.setOrigin(waypoints[0].coordinates);

    waypoints.slice(1, -1).forEach((waypoint, index) => {
        directions.addWaypoint(index, waypoint.coordinates, { name: waypoint.label });
        addMarker(waypoint.coordinates, waypoint.label, index + 1); // Add a marker for each waypoint (1-based index)
    });

    // Set destination
    directions.setDestination(waypoints[waypoints.length - 1].coordinates);

    // Function to add a custom circular marker at a specific coordinate with a label and index
    function addMarker(coordinates, label, index) {
        const markerElement = document.createElement('div');
        markerElement.className = 'waypoint-marker';
        markerElement.textContent = index;

        new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(label)) // Display label in a popup when clicked
            .addTo(map);
    }


// Function to calculate the ETA and print it to the console
function calculateETA(route) {
    if (route && route.duration) {
        const durationInSeconds = route.duration;
        const durationInMinutes = durationInSeconds / 60;
        var routeDistanceInMiles = route.distance * 0.000621371;
        


        console.log('Route Distance (miles):', routeDistanceInMiles);
        updateInformation(durationInMinutes.toFixed(2), routeDistanceInMiles.toFixed(2), orginalWaypoints.length);


        console.log('ETA:', durationInMinutes, 'minutes');
    } else {
        console.log('No route found or an error occurred.');
    }
}
    

if (waypoints.length > 1) {
        function calculateBoundingBox(waypoints) {
            const coordinates = waypoints.map(waypoint => waypoint.coordinates);
            return coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        }
        
        // Function to fit the map to the bounding box of all waypoints
        function fitMapToBounds(bounds) {
            map.fitBounds(bounds, {
                padding: 40 // Adjust the padding around the bounding box if needed
            });
        }
        
        // Example usage: Call this function after all waypoints are added
        const bounds = calculateBoundingBox(waypoints);
        fitMapToBounds(bounds);  

        directions.on('route', function (event) {
            // console.log('Directions API Response:', event);

            if (event.route && event.route[0]) {
                // Get the first route (there might be multiple alternatives)
                const route = event.route[0];
                calculateETA(route);
            } else {
                console.log('No route found or an error occurred.');
            }
        });
    
    }

    
});








// Custom CSS for waypoint markers
const customMarkerStyle = `
    .waypoint-marker {
        width: 35px;
        height: 35px;
        border: 2px solid red;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-weight: bold;
        background-color: white;
        color: red;
    }
`;

// Create a custom style tag for the waypoint markers
const styleTag = document.createElement('style');
styleTag.textContent = customMarkerStyle;

// Append the custom style to the head of the document
document.head.appendChild(styleTag);



this.map.addControl(directions, 'top-right');

//Button controls
document.getElementById('original-btn').addEventListener('click', function() {
  // Handle the "Original" button click here
  resetMap();
  const n = orginalWaypoints.length;
  waypoints = [].concat(orginalWaypoints);
  updateMap();
});

document.getElementById('brute-force-btn').addEventListener('click', function() {
  // Handle the "Brute Force" button click here
  resetMap();
  const n = orginalWaypoints.length;
  const bruteForceResult = tspBruteForce(n, orginalWaypoints);
  waypoints = bruteForceResult.path.slice(); 
  updateMap()

});

document.getElementById('nearest-neighbor-btn').addEventListener('click', function() {
  // Handle the "Nearest Neighbor" button click here
  resetMap();
  const n = orginalWaypoints.length;
  const tspResult = nearestNeighborTSP(n, orginalWaypoints);
  waypoints = tspResult.path.slice(); 
  updateMap()
});
document.getElementById('reset-btn').addEventListener('click', function() {
  // Handle the "Reset" button click here
  resetMap();
});




