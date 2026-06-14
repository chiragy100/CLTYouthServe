// Initialize Leaflet map centered on Charlotte, NC used in the opportunities page
const Charlotte = [35.2271, -80.8433];
const map = L.map('interactive-map', {
    center: Charlotte,
    zoom: 10, // Zoomed out slightly to see Matthews
    zoomControl: true
});

// Loads street map images from MapTiler and display them to my Leaflet map
L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=algTQ7Nhcq5z8k3FE0BE', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'  
}).addTo(map);

// 1. Generic Charlotte Marker
L.marker(Charlotte).addTo(map).bindPopup('Charlotte, NC');

// 2. Matthews Help Center Pin
const matthewsHelpCenter = L.marker([35.1199, -80.7208]).addTo(map);

matthewsHelpCenter.bindPopup(`
  <div class="map-popup-card">
    <h3 class="popup-title">Matthews Help Center</h3>
    <p class="popup-text"><strong>Status:</strong> Opportunities Closed</p>
    <p class="popup-text">119 N Ames St, Matthews, NC</p>
    <hr class="popup-divider">
    <p class="popup-text"><strong>Contact:</strong> Melinda</p>
    <a href="mailto:melinda@matthewshelpcenter.org" class="popup-link">Email Coordinator</a>
  </div>
`);

// Prevent map rendering bugs
setTimeout(() => {
    map.invalidateSize();
}, 200);

// 3. GET USER'S CURRENT LOCATION
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success! We got the location
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Add a special blue circle marker for the user
            const userMarker = L.circleMarker([userLat, userLng], {
                radius: 8,
                fillColor: "#ff0000",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            // Add a popup saying "You are here"
            userMarker.bindPopup("<strong>You are here</strong>").openPopup();
        },
        (error) => {
            // Error handling (User denied permission, etc.)
            console.log("Location access denied or unavailable: ", error.message);
        }
    );
} else {
    console.log("Geolocation is not available in this browser.");
}