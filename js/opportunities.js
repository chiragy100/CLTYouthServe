/*
  FILE PURPOSE:
  This script (js/opportunities.js) powers the main interactive logic on the "Find Opportunities" page. 
  It loads volunteer opportunities from Firebase Firestore, initializes the Leaflet interactive map with user 
  geolocation support, handles live filtering and distance calculations, renders opportunity cards and map markers, 
  manages the details modal, and handles saving/starring opportunities to the user's Firestore profile.

  Currently all opportunities are being displayed from the firestore and ot opportunitiesData.js

  FILES REFERENCED IN THIS FILE:
  - External Libraries: Firebase App, Auth, Firestore SDKs; Leaflet JS (loaded via CDN on the page)
  - Associated HTML Page: opportunities.html
  - Redirection Routes: login.html, dashboard.html
*/

// ==========================================
// FIREBASE AUTHENTICATION & DATABASE SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Firebase credentials configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCO-AmNN7QO_9wbqNq9nR1e_XYBdlRSLVg",
  authDomain: "clt-youthserve.firebaseapp.com",
  projectId: "clt-youthserve",
  storageBucket: "clt-youthserve.firebasestorage.app",
  messagingSenderId: "29022006642",
  appId: "1:29022006642:web:d783a76d7a0e2fd91b01eb",
  measurementId: "G-7LWN04E6QL"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fetches all volunteer opportunity records from the Firestore database
async function loadOpportunities() {
    try {
        const opportunitiesSnapshot = await getDocs(
            collection(db, "opportunities")
        );

        opportunitiesData = opportunitiesSnapshot.docs.map(docSnap => {
            return docSnap.data();
        });

        console.log(
            `Loaded ${opportunitiesData.length} opportunities from Firestore.`
        );

    } catch (error) {
        console.error("Error loading opportunities:", error);
    }
}

// Global application state variables
let isLoggedIn = false;
let hasFullAccess = false; 
let currentUser = null;
let userStarredIds = [];
// Array holding opportunities loaded from Firestore
let opportunitiesData = [];

// Listens for login state changes and retrieves the user's saved/starred opportunities from Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        hasFullAccess = user.emailVerified; 
        
        // Fetch the user's saved opportunity IDs from their Firestore profile document
        const docRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().starredOpportunities) {
                userStarredIds = docSnap.data().starredOpportunities;
            }
        } catch (error) {
            console.error("Error fetching saved opportunities:", error);
        }
    } else {
        isLoggedIn = false;
        hasFullAccess = false;
        currentUser = null;
        userStarredIds = [];
    }
    
    // Re-apply filters to refresh UI based on current user state and saved items
    applyFilters();
});

// ==========================================
// MAP INITIALIZATION
// ==========================================

// Sets default map view coordinates and geographic bounding limits around Charlotte, NC
const centerCoords = [35.12, -80.70]; 
const mapBounds = L.latLngBounds([34.72, -81.12], [35.58, -80.18]);
const map = L.map('interactive-map', {
    center: centerCoords,
    zoom: 10,
    minZoom: 9,
    maxZoom: 16,
    maxBounds: mapBounds,
    maxBoundsViscosity: 1,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 120,
    zoomControl: true,
    worldCopyJump: false
});

// Load MapTiler base map tile layer
L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=algTQ7Nhcq5z8k3FE0BE', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'  
}).addTo(map);

// Custom Leaflet map control button to re-center the map view on the user's current location
const HomeControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd() {
        const button = L.DomUtil.create("button", "map-home-control");
        button.type = "button";
        button.title = "Center map on my location";
        button.textContent = "My Location";
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, "click", () => {
            if (userLocation) map.setView([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 12));
            else if (navigator.geolocation) {
                // Request user location if not already captured
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                        map.setView([userLocation.lat, userLocation.lng], 12);
                    }
                );
            }
        });
        return button;
    }
});
map.addControl(new HomeControl());


// ==========================================
// STATE & DOM ELEMENTS
// ==========================================
const listingsGrid = document.getElementById("listings-grid");
const oppCountDisplay = document.getElementById("opp-count");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const radiusFilter = document.getElementById("radius-filter");
const mapDistanceStatus = document.getElementById("map-distance-status");

let markerGroup = L.layerGroup().addTo(map);
let userLocation = null; 
let currentRadiusCircle = null; 

// Formats distance in miles between user location and opportunity coordinates
function formatDistance(coords) {
    if (!userLocation) return "Distance unavailable";
    const meters = map.distance(L.latLng(userLocation.lat, userLocation.lng), L.latLng(coords[0], coords[1]));
    const miles = meters / 1609.34;
    return `${miles < 1 ? miles.toFixed(2) : miles.toFixed(1)} miles away`;
}

// Populates and displays the full details popup modal for a specific opportunity
function openModal(id) {
    const opp = opportunitiesData.find(o => o.id === id);
    if (!opp) return;

    const modal = document.getElementById('opp-modal');
    const modalBody = document.getElementById('modal-body');

    // Generate HTML for verification badges
    const verifiedBadgeHtml = opp.verified === true 
        ? `<span class="badge verified">🟢 Verified 501(c)(3)</span>` 
        : (opp.verified === "gov" ? `<span class="badge gov">🏛️ Government Organization</span>` : '');

    const statusBadgeText = opp.isOpen ? "Accepting Volunteers" : "Currently Full";
    const statusClass = opp.isOpen ? "status-open" : "status-closed";
    const applyDisabledClass = opp.isOpen && hasFullAccess ? "" : "disabled";
    const applyLabel = !hasFullAccess ? "Verify email to apply" : (opp.isOpen ? "Apply via External Link" : "Applications Closed");
    const tasksListHtml = opp.responsibilities.map(t => `<li>${t}</li>`).join('');

    // Inject modal detail markup
    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${opp.name}</h2>
            <div class="modal-badges-container">
                ${verifiedBadgeHtml}
                <span class="badge status ${statusClass}">${statusBadgeText}</span>
            </div>
            <p><strong>Category:</strong> ${opp.category}</p>
            <p><strong>Website:</strong> <a href="https://${opp.website}" target="_blank">${opp.website}</a></p>
        </div>
        <div class="modal-section">
            <h3>About the Organization</h3>
            <p><em>"${opp.mission}"</em></p>
        </div>
        <div class="modal-section">
            <h3>Requirements</h3>
            <ul>
                <li><strong>Minimum Age:</strong> ${opp.age}</li>
                <li><strong>Background Check:</strong> ${opp.bgCheck}</li>
                <li><strong>Training Required:</strong> ${opp.training}</li>
            </ul>
        </div>
        <div class="modal-section">
            <h3>Time Commitment & Schedule</h3>
            <ul>
                <li><strong>Type:</strong> ${opp.commitment}</li>
                <li><strong>Shift Length (Hours Earned):</strong> ${opp.hours}</li>
                <li><strong>Schedule:</strong> ${opp.schedule}</li>
            </ul>
        </div>
        <div class="modal-section">
            <h3>What You'll Do</h3>
            <ul>${tasksListHtml}</ul>
        </div>
        <div class="modal-section modal-section-no-border">
            <h3>Contact & Location</h3>
            <p>📍 ${opp.address}</p>
            <p>✉️ <a href="mailto:${opp.contactInfo}">${opp.contactInfo}</a></p>
        </div>
        <div class="modal-footer">
            <a href="${opp.isOpen && hasFullAccess ? opp.link : '#'}" target="_blank" rel="noopener" class="modal-apply-btn ${applyDisabledClass}" ${!hasFullAccess ? 'aria-disabled="true"' : ''}>
                ${applyLabel}
            </a>
            <p class="modal-timestamp">Last Updated: August 2026</p>
        </div>
    `;
    modal.classList.add('active');
}

// Global Event Delegation for dynamic buttons ("Learn More" and "Star/Save")
document.addEventListener('click', async function(e) {
    // Event handler for "Learn More" modal trigger
    const modalBtn = e.target.closest('.open-modal-btn');
    if (modalBtn) {
        const id = parseInt(modalBtn.getAttribute('data-opp-id'), 10);
        openModal(id);
        return;
    }

    // Event handler for Star/Save opportunity toggle button
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) {
        if (!isLoggedIn || !currentUser) {
            alert("Please create a free account or sign in to save opportunities!");
            window.location.href = "login.html";
            return;
        }
        if (!hasFullAccess) {
            alert("Please verify your email address before saving opportunities.");
            window.location.href = "dashboard.html";
            return;
        }

        const id = parseInt(starBtn.getAttribute('data-opp-id'), 10);
        const isCurrentlyStarred = userStarredIds.includes(id);
        const userRef = doc(db, "users", currentUser.uid);

        try {
            if (isCurrentlyStarred) {
                // Remove from starred array locally and sync with Firestore database
                userStarredIds = userStarredIds.filter(savedId => savedId !== id);
                starBtn.textContent = '☆';
                starBtn.setAttribute("aria-label", "Save opportunity");
                starBtn.title = "Save opportunity";
                await updateDoc(userRef, { starredOpportunities: arrayRemove(id) });
            } else {
                // Add to starred array locally and sync with Firestore database
                userStarredIds.push(id);
                starBtn.textContent = '⭐';
                starBtn.setAttribute("aria-label", "Remove from saved opportunities");
                starBtn.title = "Remove saved opportunity";
                await updateDoc(userRef, { starredOpportunities: arrayUnion(id) });
            }
        } catch (error) {
            console.error("Error updating saved opportunities:", error);
            alert("Something went wrong saving this. Please try again.");
        }
    }
});


// ==========================================
// RENDERING & FILTERING LOGIC
// ==========================================

// Renders filtered opportunity cards on the left list panel and pin markers on the map
function renderOpportunities(dataToRender) {
    // Limit unverified or guest users to 3 sample preview results
    const visibleData = hasFullAccess ? dataToRender : dataToRender.slice(0, 3);
    if (oppCountDisplay) oppCountDisplay.textContent = visibleData.length;
    if (listingsGrid) listingsGrid.innerHTML = '';
    markerGroup.clearLayers();

    visibleData.forEach(opp => {
        // Render Map Marker Pin for the Opportunity
        const marker = L.marker(opp.coords);

        const popupContent = `
          <div class="map-popup-card">
            <h3 class="popup-title">${opp.name}</h3>
            <span class="popup-category-tag">${opp.category}</span>
            <p class="popup-text"><strong>Status:</strong> ${opp.isOpen ? 'Accepting Volunteers' : 'Currently Full'}</p>
            <p class="popup-text distance-label">📍 ${formatDistance(opp.coords)}</p>
            <p class="popup-text">📍 ${opp.address}</p>
            <hr class="popup-divider">
            <button class="btn-card full-width open-modal-btn" data-opp-id="${opp.id}">Learn More</button>
          </div>
        `;
        marker.bindPopup(popupContent);
        if (userLocation) {
            marker.bindTooltip(formatDistance(opp.coords), {
                permanent: true,
                direction: "top",
                offset: [0, -12],
                className: "distance-tooltip"
            });
        }
        markerGroup.addLayer(marker);
    
        // Render Left-Side Opportunity Card
        if (listingsGrid) {
            const statusBadgeClass = opp.isOpen ? "status-open" : "status-closed";
            const statusBadgeText = opp.isOpen ? "Open" : "Closed";
            
            const verifiedBadge = opp.verified === true 
                ? `<span class="verified-badge">🟢 Verified Nonprofit</span>` 
                : (opp.verified === "gov" ? `<span class="gov-badge">🏛️ Gov Org</span>` : '');

            const tasksPreviewHTML = opp.responsibilities.slice(0,3).map(task => `<li>${task}</li>`).join('');
            const dynamicBgStyle = opp.imageSrc ? `background-image: url('${opp.imageSrc}');` : '';
            
            // Check if item is saved in user's profile
            const starIcon = userStarredIds.includes(opp.id) ? '⭐' : '☆';

            const cardHTML = `
              <div class="opp-card">
                <div class="opp-img ${opp.imgClass || ''}" style="${dynamicBgStyle}">
                  <span class="category-tag ${statusBadgeClass}">${statusBadgeText}</span>
                </div>

                <div class="opp-content" style="position: relative;">
                    <button class="star-btn" data-opp-id="${opp.id}" aria-label="${userStarredIds.includes(opp.id) ? "Remove from saved opportunities" : "Save opportunity"}" title="${userStarredIds.includes(opp.id) ? "Remove saved opportunity" : "Save opportunity"}" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); border: 1px solid #ddd; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 2; transition: transform 0.1s;">
                        ${starIcon}
                    </button>
                  <h3>${opp.name}</h3>
                  
                  <p class="org-name">${opp.category} &nbsp; ${verifiedBadge}</p>
                  
                  <p class="opp-description">${opp.description}</p>

                  <div class="opp-details">
                    <span>📍 ${opp.city}</span>
                    <span class="distance-label">${formatDistance(opp.coords)}</span>
                    <span>⏱️ ${opp.hours}</span>
                    <span>📅 ${opp.commitment}</span>
                  </div>

                  <div class="role-brief">
                    <strong>What You'll Do:</strong>
                    <ul>${tasksPreviewHTML}</ul>
                  </div>

                  <button class="btn-card align-bottom open-modal-btn" data-opp-id="${opp.id}">Learn More</button>
                </div>
              </div>
            `;
            listingsGrid.insertAdjacentHTML("beforeend", cardHTML);
        }
    });

    // Displays prompt card encouraging unverified/guest users to sign up to view all postings
    if (!hasFullAccess && dataToRender.length > 3) {
        const hiddenCount = dataToRender.length - 3;
        const promptTitle = isLoggedIn ? "Verify Your Email to Unlock" : "Unlock";
        const promptMessage = isLoggedIn 
            ? "Please check your inbox and verify your email to view the remaining volunteer events, distances, and applications." 
            : "Create a free account and verify your email to view the remaining volunteer events and their map locations.";

        const loginPromptHTML = `
            <div class="login-prompt-card" style="text-align: center; padding: 30px 20px; background: #f8fafc; border-radius: 15px; border: 2px dashed #cbd5e1; margin-top: 10px;">
                <h3 style="color: #0f172a; margin-bottom: 8px; font-size: 1.2rem;">🔒 ${promptTitle} ${hiddenCount} More Opportunities</h3>
                <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5;">${promptMessage}</p>
                ${!isLoggedIn ? `<a href="login.html" class="btn-card" style="background: var(--forest); color: white; padding: 10px 24px; text-decoration: none;">Sign In to View All</a>` : ''}
            </div>
        `;
        listingsGrid.insertAdjacentHTML("beforeend", loginPromptHTML);
    }
}

// Filters opportunity list based on search term, category dropdown, and distance radius
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedRadius = radiusFilter.value ? parseInt(radiusFilter.value, 10) : null;

    const filteredData = opportunitiesData.filter(opp => {
        const matchesSearch = opp.name.toLowerCase().includes(searchTerm) || opp.description.toLowerCase().includes(searchTerm) || opp.category.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === "" || opp.category === selectedCategory;
        
        let matchesRadius = true;
        if (selectedRadius && userLocation) {
            const oppLatLng = L.latLng(opp.coords[0], opp.coords[1]);
            const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
            const distanceInMiles = map.distance(userLatLng, oppLatLng) / 1609.34;
            matchesRadius = distanceInMiles <= selectedRadius;
        }

        return matchesSearch && matchesCategory && matchesRadius;
    });

    // Remove existing radius circle overlay on map
    if (currentRadiusCircle) {
        map.removeLayer(currentRadiusCircle);
        currentRadiusCircle = null;
    }

    // Draw radius circle overlay on map if distance filter is active
    if (selectedRadius && userLocation) {
        const radiusInMeters = selectedRadius * 1609.34;
        currentRadiusCircle = L.circle([userLocation.lat, userLocation.lng], {
            radius: radiusInMeters,
            color: '#1b4332',      
            fillColor: '#1b4332',
            fillOpacity: 0.1,      
            weight: 2
        }).addTo(map);
        map.fitBounds(currentRadiusCircle.getBounds(), { padding: [20, 20], maxZoom: 13 });
    }

    // Update distance status text on UI
    if (mapDistanceStatus) {
        if (!userLocation) {
            mapDistanceStatus.textContent = "Allow location access to see exact distances.";
        } else if (selectedRadius) {
            mapDistanceStatus.textContent = `Showing opportunities within ${selectedRadius} miles.`;
        } else {
            mapDistanceStatus.textContent = "Distances shown from your current location. Click a marker for details.";
        }
    }

    renderOpportunities(filteredData);
}

// Attach input listeners to filter controls
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
radiusFilter.addEventListener('change', () => {
    if (!userLocation && radiusFilter.value !== "") {
        alert("We need your location to calculate distance. Please allow location access in your browser.");
        radiusFilter.value = ""; 
        return;
    }
    applyFilters();
});

// Initial Data Loading & Render Call
loadOpportunities().then(() => {
    applyFilters();
    setTimeout(() => {
        map.invalidateSize();
    }, 200);
});

// Modal Dismiss Logic
const modalOverlay = document.getElementById('opp-modal');
if (modalOverlay) {
    modalOverlay.querySelector('.close-modal').addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });
}

// Geolocation Handling: Requests user location to enable distance calculations and marker placement
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 8, fillColor: "#007bff", color: "#fff", weight: 2, opacity: 1, fillOpacity: 0.8
            }).addTo(map);
            userMarker.bindPopup("<strong>You are here</strong>").openPopup();
            map.setView([userLocation.lat, userLocation.lng], Math.min(Math.max(map.getZoom(), 11), 13));
            applyFilters();
        },
        (error) => { 
            console.log("Location access denied/unavailable."); 
            radiusFilter.disabled = true;
            radiusFilter.options[0].text = "Location Disabled";
        }
    );
}