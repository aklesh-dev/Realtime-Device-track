// Establish a socket connection
const socket = io();

// Check if the browser supports geolocation
if (navigator.geolocation) {
  // Options to control the frequency and accuracy of location updates
  const options = {
    enableHighAccuracy: true, // Use high accuracy GPS if available
    timeout: 5000,            // Wait 5 seconds before timing out
    maximumAge: 0             // Do not use cached location data
  };

  // Watch for changes in the user's position
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Emit the current location to the server
      socket.emit("send-location", { latitude, longitude });
    },
    (err) => {
      console.error("Error obtaining geolocation:", err);
      // Optionally, you can provide a user-friendly message or handle the error in a different way
      // alert("Unable to retrieve your location. Please check your settings and try again.");
    },
    options
  );
} else {
  console.error("Geolocation is not supported by this browser.");
  // Optionally, you can provide a user-friendly message
  alert("Geolocation is not supported by this browser.");
}


// Create a Leaflet map centered on Nepal [27.7172, 85.3240]
const map = L.map("map").setView([0,0], 16);

// Add OpenStreetMap tile layer to the map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Aklesh Yadav" 
}).addTo(map);

// Initialize an object to hold marker instances for each connected user
const markers = {};

// Listen for 'receive-location' events from the server
socket.on("receive-location", (data) => {
  const { id, longitude, latitude } = data; // Destructure the necessary data from the event

  // Check if a marker for this user already exists
  if (markers[id]) {
    // If it exists, update its position to the new coordinates
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // If it does not exist, create a new marker and add it to the map
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }

  // Optionally, you can update the map view to center on the new user's location
  map.setView([latitude, longitude], 16);
});

//  Event listener for when a user disconnects
socket.on("user-disconnected", (id) => {
  // If a marker for this user exists, remove it from the map and delete it from the markers object
  if (markers[id]) {
    map.removeLayer(markers[id]);// Remove the marker from the map
    delete markers[id];// Delete the marker from the markers object
  }
})

