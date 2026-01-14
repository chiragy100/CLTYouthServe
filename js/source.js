// Add a subtle scroll effect to the navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        nav.style.padding = '1rem 8%';
    } else {
        nav.style.boxShadow = 'none';
        nav.style.padding = '1.5rem 8%';
    }
});


// Inside js/source.js

const Charlotte = [35.2271, -80.8433];

// Create map
const map = L.map('interactive-map', {
    center: Charlotte,
    zoom: 10, // Zoomed out slightly to see Matthews
    zoomControl: true
});

L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=algTQ7Nhcq5z8k3FE0BE', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'  
}).addTo(map);

// 1. Generic Charlotte Marker
L.marker(Charlotte).addTo(map).bindPopup('Charlotte, NC');

// 2. Matthews Help Center Pin
const matthewsHelpCenter = L.marker([35.1199, -80.7208]).addTo(map);

matthewsHelpCenter.bindPopup(`
  <div style="min-width: 200px;">
    <h3 style="margin: 0 0 5px 0; color: #1b4332;">Matthews Help Center</h3>
    <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Status:</strong> Opportunities Closed</p>
    <p style="margin: 5px 0; font-size: 0.9rem;">119 N Ames St, Matthews, NC</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
    <p style="margin: 5px 0; font-size: 0.85rem;"><strong>Contact:</strong> Melinda</p>
    <a href="mailto:melinda@matthewshelpcenter.org" style="color: #2d6a4f; text-decoration: none; font-weight: bold;">Email Coordinator</a>
  </div>
`);

// Prevent map rendering bugs
setTimeout(() => {
  map.invalidateSize();
}, 200);

// ... (Your existing map code stays above this) ...

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

            // Optional: Center the map on the user
            // map.setView([userLat, userLng], 12); 
        },
        (error) => {
            // Error handling (User denied permission, etc.)
            console.log("Location access denied or unavailable: ", error.message);
        }
    );
} else {
    console.log("Geolocation is not available in this browser.");
}