// Initialize Leaflet map centered on the Greater Charlotte area
const centerCoords = [35.12, -80.70]; 
const map = L.map('interactive-map', {
    center: centerCoords,
    zoom: 10, 
    zoomControl: true
});

L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=algTQ7Nhcq5z8k3FE0BE', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'  
}).addTo(map);

// ==========================================
// EXPANDED OPPORTUNITIES DATABASE
// ==========================================
const opportunitiesData = [
    {
        id: 1,
        name: "Matthews Help Center",
        category: "Community Support",
        city: "Matthews, NC",
        address: "119 N Ames St, Matthews, NC 28105",
        hours: "4 Hour Shifts",
        age: "14+",
        isOpen: true, 
        contactInfo: "melinda@matthewshelpcenter.org",
        link: "https://volunteer.bloomerang.co/volunteer/#/join-party?k=0l6qzxeawydwj5",
        coords: [35.1199, -80.7208],
        imageSrc: "images/Matthews Help Center.jpg",
        description: "Support neighbors in crisis by assisting in the local thrift store.",
        commitment: "Weekly / Recurring",
        verified: true,
        website: "matthewshelpcenter.org",
        bgCheck: "Not required for minors",
        training: "Basic orientation provided",
        schedule: "Monday - Saturday. Store shifts: 9 a.m.–1 p.m. and 1 p.m.–5 p.m.",
        mission: "To provide short-term crisis assistance to our neighbors in the Greater Matthews community.",
        responsibilities: [
            "Receive, sort, and price donated goods",
            "Check out customers and bag items",
            "Maintain the organization's grounds"
        ]
    },
    {
        id: 2,
        name: "Indian Trail Parks & Rec",
        category: "Parks & Recreation",
        city: "Indian Trail, NC",
        address: "315 Matthews-Indian Trail Rd, Indian Trail, NC 28079",
        hours: "Varies (Event Based)",
        age: "15+",
        isOpen: true,
        contactInfo: "recreation@indiantrail.org",
        link: "https://www.indiantrail.org/FormCenter/Parks-and-Rec-applications-8/Volunteer-Application-59",
        coords: [35.0768, -80.6693],
        imageSrc: "images/IndianTrailParks.jpg",
        description: "Help execute memorable community events, family festivals, and park programs.",
        commitment: "One-Time Event",
        verified: "gov",
        website: "indiantrail.org/282/Volunteer",
        bgCheck: "Yes (Depending on placement)",
        training: "Brief day-of orientation",
        schedule: "Varies depending on seasonal community events and family festivals.",
        mission: "Dedicated to enriching Indian Trail's community through memorable experiences and quality public spaces.",
        responsibilities: [
            "Lift and arrange event materials (tents, tables, chairs)",
            "Direct incoming vehicles for parking safety",
            "Register attendees at welcome booths",
            "Help clean up venues"
        ]
    },
    {
        id: 3,
        name: "Hope for Harvest",
        category: "Youth & Education",
        city: "Charlotte, NC",
        address: "1800 Brewton Dr, Charlotte, NC 28206",
        hours: "2.5 - 4 Hours",
        age: "14-18 (High School)",
        isOpen: true,
        contactInfo: "info@hopeforharvest.org",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSdvQsslAwvHvI5UJ5Oe31pK0zmVPmFVy540TbvpvNFoi7hZmQ/viewform",
        coords: [35.2530, -80.8260],
        imageSrc: "images/HopeForHarvest.jpg",
        description: "Mentor underserved youth through after-school STEAM enrichment programs.",
        commitment: "Recurring",
        verified: true,
        website: "hopeforharvest.org",
        bgCheck: "Position-dependent (ID required)",
        training: "Not specified",
        schedule: "Tues/Thurs 3:30-6:00 PM, Summer Camp shifts available",
        mission: "To assist, encourage and educate the underserved homeless youth throughout the Charlotte community.",
        responsibilities: [
            "Guide and mentor children during educational projects",
            "Organize and distribute goods at the clothing pantry",
            "Pack hygiene care kits",
            "Help set up and manage community events"
        ]
    },
    {
        id: 4,
        name: "Union County Animal Services",
        category: "Animal Welfare",
        city: "Monroe, NC",
        address: "3340 Presson Rd, Monroe, NC 28112",
        hours: "Flexible",
        age: "15+",
        isOpen: true,
        contactInfo: "ucadopt@unioncountync.gov",
        link: "https://www.unioncountysheriffsoffice.com/Home/Components/FormBuilder/FormBuilder/8b38ab39e2b54bb580b589ce106f4a34/600",
        coords: [34.9880, -80.5490],
        imageSrc: "images/AnimalShelter.png",
        description: "Care for shelter animals by walking dogs, socializing cats, and assisting families.",
        commitment: "Recurring",
        verified: "gov",
        website: "unioncountysheriffsoffice.com",
        bgCheck: "Yes (Required by Sheriff's Office)",
        training: "Yes (Orientation & handling training mandatory)",
        schedule: "Adoption hours: M-F 1:00 PM - 5:00 PM, Sat 10:00 AM - 3:00 PM",
        mission: "Operating the local county animal shelter, focusing on public safety, stray control, and pet adoptions.",
        responsibilities: [
            "Walk dogs outside on shelter trails",
            "Play with and comfort cats in socialization rooms",
            "Groom animals to ensure they look their best",
            "Interact with visitors looking to adopt"
        ]
    },
    {
        id: 5,
        name: "Senior Nutrition Program",
        category: "Community Support",
        city: "Monroe, NC",
        address: "2330 Concord Ave, Monroe, NC 28110",
        hours: "1 Hour",
        age: "Drivers Needed",
        isOpen: true,
        contactInfo: "UCVolunteers@unioncountync.gov",
        link: "https://lfportal.unioncountync.gov/Forms/SeniorNutritionReferral",
        coords: [35.0060, -80.5400],
        imageSrc: "images/SeniorNutrition.jpg",
        description: "Deliver hot meals directly to homebound seniors and perform safety check-ins.",
        commitment: "Recurring",
        verified: "gov",
        website: "unioncountync.gov",
        bgCheck: "Yes (Mandated for driving assignments)",
        training: "Yes (Brief onboarding on safety/equipment)",
        schedule: "Monday through Friday during mid-day lunchtime windows.",
        mission: "Beyond meals, the program offers social interaction, education, and support to improve seniors' overall quality of life.",
        responsibilities: [
            "Load thermal food coolers into personal vehicles",
            "Drive to localized residential areas and deliver meals",
            "Perform brief safety check-ins on clients",
            "Connect through brief friendly conversations"
        ]
    },
    {
        id: 6,
        name: "Union County Library",
        category: "Youth & Education",
        city: "Monroe, NC",
        address: "316 E. Windsor St, Monroe, NC 28112",
        hours: "2 Hours",
        age: "14+",
        isOpen: true,
        contactInfo: "704-283-8184",
        link: "https://unioncountyncgov.formstack.com/forms/uclvolunteerapplication",
        coords: [34.9850, -80.5495],
        imageSrc: "images/Library.jpg",
        description: "Organize library collections, shelve books, and prepare material packages.",
        commitment: "One-Time / Flexible",
        verified: "gov",
        website: "uclnc.org",
        bgCheck: "Yes (For adults assisting in youth areas)",
        training: "Yes (Alpha-numeric sorting test required)",
        schedule: "General shelving: flexible. Homebound shifts: First Monday of month 9AM-11AM.",
        mission: "The mission of the Union County Library is to inspire our residents to explore, create, and learn.",
        responsibilities: [
            "Sort and place media using library cataloging",
            "Apply colored evaluation strips to test accuracy",
            "Pack material boxes for individuals with mobility constraints",
            "Attend civic engagement meetings"
        ]
    },
    {
        id: 7,
        name: "Teal Diva",
        category: "Health & Wellness",
        city: "Matthews, NC",
        address: "1135 Four Lakes Dr, Matthews, NC 28105",
        hours: "Project Based",
        age: "Flexible",
        isOpen: true,
        contactInfo: "info@tealdiva.org",
        link: "https://www.tealdiva.org/get-involved/",
        coords: [35.1210, -80.7100],
        imageSrc: "images/TealDiva.jpg",
        description: "Provide practical help, like light lawn maintenance, or write encouragement cards.",
        commitment: "Flexible / Projects",
        verified: true,
        website: "tealdiva.org",
        bgCheck: "Position-dependent (For in-home support)",
        training: "Yes (Onboarding based on committee)",
        schedule: "Varies. Remote options or half-day blocks for home/lawn projects.",
        mission: "To provide strength through connection and empower individuals with vital knowledge about gynecologic cancers while focusing on emotional and mental health.",
        responsibilities: [
            "Consult on branding metrics or design digital content",
            "Mow lawns or execute light home maintenance",
            "Sort/package adaptive port-access infusion shirts",
            "Mail prayers and letters of solidarity"
        ]
    }
];

// ==========================================
// STATE & DOM ELEMENTS
// ==========================================
const listingsGrid = document.getElementById("listings-grid");
const oppCountDisplay = document.getElementById("opp-count");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const radiusFilter = document.getElementById("radius-filter");

// Store active markers so we can clear them during filtering
let markerGroup = L.layerGroup().addTo(map);
let userLocation = null; // Will hold {lat, lng} once found
let currentRadiusCircle = null; // Will hold the Leaflet Circle object

// Modal generation function
function openModal(id) {
    const opp = opportunitiesData.find(o => o.id === id);
    if (!opp) return;

    const modal = document.getElementById('opp-modal');
    const modalBody = document.getElementById('modal-body');

    const verifiedBadgeHtml = opp.verified === true 
        ? `<span class="badge verified">🟢 Verified 501(c)(3)</span>` 
        : (opp.verified === "gov" ? `<span class="badge gov">🏛️ Government Organization</span>` : '');

    const statusBadgeText = opp.isOpen ? "Accepting Volunteers" : "Currently Full";
    const statusClass = opp.isOpen ? "status-open" : "status-closed";
    const applyDisabledClass = opp.isOpen ? "" : "disabled";
    const tasksListHtml = opp.responsibilities.map(t => `<li>${t}</li>`).join('');

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
            <ul>
                ${tasksListHtml}
            </ul>
        </div>

        <div class="modal-section modal-section-no-border">
            <h3>Contact & Location</h3>
            <p>📍 ${opp.address}</p>
            <p>✉️ <a href="mailto:${opp.contactInfo}">${opp.contactInfo}</a></p>
        </div>
        
        <div class="modal-footer">
            <a href="${opp.link}" target="_blank" rel="noopener" class="modal-apply-btn ${applyDisabledClass}">
                ${opp.isOpen ? 'Apply via External Link' : 'Applications Closed'}
            </a>
            <p class="modal-timestamp">Last Updated: June 2026</p>
        </div>
    `;

    modal.classList.add('active');
}

// Global Event Delegation for modal buttons
document.addEventListener('click', function(e) {
    const modalBtn = e.target.closest('.open-modal-btn');
    if (modalBtn) {
        const id = parseInt(modalBtn.getAttribute('data-opp-id'), 10);
        openModal(id);
    }
});

// ==========================================
// RENDERING & FILTERING LOGIC
// ==========================================

function renderOpportunities(dataToRender) {
    // 1. Update counter
    if (oppCountDisplay) oppCountDisplay.textContent = dataToRender.length;

    // 2. Clear existing grid and map markers
    if (listingsGrid) listingsGrid.innerHTML = '';
    markerGroup.clearLayers();

    dataToRender.forEach(opp => {
        // Render Map Marker
        const marker = L.marker(opp.coords);
        const popupContent = `
          <div class="map-popup-card">
            <h3 class="popup-title">${opp.name}</h3>
            <span class="popup-category-tag">${opp.category}</span>
            <p class="popup-text"><strong>Status:</strong> ${opp.isOpen ? 'Accepting Volunteers' : 'Currently Full'}</p>
            <p class="popup-text">📍 ${opp.address}</p>
            <hr class="popup-divider">
            <button class="btn-card full-width open-modal-btn" data-opp-id="${opp.id}">Learn More</button>
          </div>
        `;
        marker.bindPopup(popupContent);
        markerGroup.addLayer(marker);

        // Render Left-Side Card
        if (listingsGrid) {
            const statusBadgeClass = opp.isOpen ? "status-open" : "status-closed";
            const statusBadgeText = opp.isOpen ? "Open" : "Closed";
            
            const verifiedBadge = opp.verified === true 
                ? `<span class="verified-badge">🟢 Verified Nonprofit</span>` 
                : (opp.verified === "gov" ? `<span class="gov-badge">🏛️ Gov Org</span>` : '');

            const tasksPreviewHTML = opp.responsibilities.slice(0,3).map(task => `<li>${task}</li>`).join('');
            const dynamicBgStyle = opp.imageSrc ? `background-image: url('${opp.imageSrc}');` : '';

            const cardHTML = `
              <div class="opp-card">
                <div class="opp-img ${opp.imgClass || ''}" style="${dynamicBgStyle}">
                  <span class="category-tag ${statusBadgeClass}">${statusBadgeText}</span>
                </div>

                <div class="opp-content">
                  <h3>${opp.name}</h3>
                  <p class="org-name">${opp.category} &nbsp; ${verifiedBadge}</p>
                  
                  <p class="opp-description">
                    ${opp.description}
                  </p>

                  <div class="opp-details">
                    <span>📍 ${opp.city}</span>
                    <span>⏱️ ${opp.hours}</span>
                    <span>📅 ${opp.commitment}</span>
                  </div>

                  <div class="role-brief">
                    <strong>What You'll Do:</strong>
                    <ul>
                      ${tasksPreviewHTML}
                    </ul>
                  </div>

                  <button class="btn-card align-bottom open-modal-btn" data-opp-id="${opp.id}">Learn More</button>
                </div>
              </div>
            `;
            listingsGrid.insertAdjacentHTML("beforeend", cardHTML);
        }
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedRadius = radiusFilter.value ? parseInt(radiusFilter.value, 10) : null;

    const filteredData = opportunitiesData.filter(opp => {
        // 1. Check Search (Matches name, description, or category)
        const matchesSearch = 
            opp.name.toLowerCase().includes(searchTerm) || 
            opp.description.toLowerCase().includes(searchTerm) || 
            opp.category.toLowerCase().includes(searchTerm);

        // 2. Check Category
        const matchesCategory = selectedCategory === "" || opp.category === selectedCategory;

        // 3. Check Distance Radius
        let matchesRadius = true; // Default true if no radius selected
        if (selectedRadius && userLocation) {
            const oppLatLng = L.latLng(opp.coords[0], opp.coords[1]);
            const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
            
            // Calculate distance in miles
            const distanceInMiles = map.distance(userLatLng, oppLatLng) * 0.000621371;
            matchesRadius = distanceInMiles <= selectedRadius;
        }

        return matchesSearch && matchesCategory && matchesRadius;
    });

    // 4. Handle Translucent Map Circle (Delete old circle first!)
    if (currentRadiusCircle) {
        map.removeLayer(currentRadiusCircle);
        currentRadiusCircle = null;
    }

    if (selectedRadius && userLocation) {
        // Convert miles back to meters for Leaflet's L.circle
        const radiusInMeters = selectedRadius / 0.000621371;
        
        currentRadiusCircle = L.circle([userLocation.lat, userLocation.lng], {
            radius: radiusInMeters,
            color: '#1b4332',      // Using your theme's emerald/forest color
            fillColor: '#1b4332',
            fillOpacity: 0.1,      // Translucent
            weight: 2
        }).addTo(map);

        // Optional: Auto-zoom map to fit the new circle
        map.fitBounds(currentRadiusCircle.getBounds(), { padding: [20, 20] });
    }

    // Re-render UI with filtered array
    renderOpportunities(filteredData);
}

// Attach Event Listeners to inputs
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
radiusFilter.addEventListener('change', () => {
    // Prevent filtering by radius if user denied location services
    if (!userLocation && radiusFilter.value !== "") {
        alert("We need your location to calculate distance. Please allow location access in your browser.");
        radiusFilter.value = ""; 
        return;
    }
    applyFilters();
});

// Initial Render on page load
renderOpportunities(opportunitiesData);

setTimeout(() => {
    map.invalidateSize();
}, 200);

// ==========================================
// MODAL CLOSE LOGIC
// ==========================================
const modalOverlay = document.getElementById('opp-modal');
if (modalOverlay) {
    modalOverlay.querySelector('.close-modal').addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });
}

// ==========================================
// GET USER'S CURRENT LOCATION
// ==========================================
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 8, fillColor: "#007bff", color: "#fff",
                weight: 2, opacity: 1, fillOpacity: 0.8
            }).addTo(map);

            userMarker.bindPopup("<strong>You are here</strong>").openPopup();
            
            // If they happen to select a radius *before* location loaded, re-apply it now
            applyFilters();
        },
        (error) => { 
            console.log("Location access denied/unavailable."); 
            // Disable radius dropdown if location isn't available
            radiusFilter.disabled = true;
            radiusFilter.options[0].text = "Location Disabled";
        }
    );
}