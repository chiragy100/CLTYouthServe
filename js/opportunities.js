// ==========================================
// FIREBASE AUTHENTICATION & DATABASE SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCO-AmNN7QO_9wbqNq9nR1e_XYBdlRSLVg",
  authDomain: "clt-youthserve.firebaseapp.com",
  projectId: "clt-youthserve",
  storageBucket: "clt-youthserve.firebasestorage.app",
  messagingSenderId: "29022006642",
  appId: "1:29022006642:web:d783a76d7a0e2fd91b01eb",
  measurementId: "G-7LWN04E6QL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global state
let isLoggedIn = false;
let hasFullAccess = false; 
let currentUser = null;
let userStarredIds = []; 

// Listen for actual Firebase login state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        hasFullAccess = user.emailVerified; 
        
        // Fetch the user's saved opportunities from Firestore
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
    
    // Re-apply filters to re-render the UI based on auth & saved data
    applyFilters();
});

// ==========================================
// MAP INITIALIZATION
// ==========================================
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

L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=algTQ7Nhcq5z8k3FE0BE', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'  
}).addTo(map);

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
                // Fallback attempt if not initially loaded
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
// EXPANDED OPPORTUNITIES DATABASE (15 Total)
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
    },
    {
        id: 8,
        name: "Greater Matthews Habitat for Humanity",
        category: "Community Support",
        city: "Matthews, NC",
        address: "2447 East John Street, Matthews, NC 28105",
        hours: "Flexible",
        age: "16+",
        isOpen: true,
        contactInfo: "704-847-4266",
        link: "https://www.greatermatthewshabitat.org/getinvolved",
        coords: [35.0933, -80.6975],
        imageSrc: "images/Greater Matthews Habitat for Humanity.jpg",
        description: "A non-profit affordable housing organization that brings people together to build homes, communities, and hope for local families in need.",
        commitment: "Recurring",
        verified: true,
        website: "greatermatthewshabitat.org",
        bgCheck: "Yes (Required for court-ordered community service)",
        training: "Yes (Online orientation quiz and store tour)",
        schedule: "Tuesday–Friday 10:00 a.m. – 5:00 p.m. and Saturday 9:00 a.m. – 5:00 p.m.",
        mission: "We bring people together to build homes and hope.",
        responsibilities: [
            "Swing hammers, paint, and install materials on active construction sites",
            "Prepare and serve lunches to builders",
            "Sort and lift heavy donated furniture at the retail ReStore",
            "Manage clerical work in the main office"
        ]
    },
    {
        id: 9,
        name: "Common Heart",
        category: "Community Support",
        city: "Indian Trail, NC",
        address: "116 Business Park Dr, Suite A, Indian Trail, NC 28079",
        hours: "2 - 4 Hours",
        age: "All Ages (14-17 independent)",
        isOpen: true,
        contactInfo: "volunteer@commonheart.org",
        link: "https://commonheart.org/volunteer/",
        coords: [35.0780, -80.6550],
        imageSrc: "images/Common Heart.jpg",
        description: "A grassroots non-profit operating a network of food pantries and delivery programs to eradicate food insecurity and eliminate generational poverty.",
        commitment: "Recurring",
        verified: true,
        website: "commonheart.org",
        bgCheck: "Position-dependent (Required for court-ordered service)",
        training: "Yes (Civil Rights/FDA Anti-Discrimination training)",
        schedule: "Highly flexible. Morning, afternoon, and evening slots available.",
        mission: "Common Heart’s mission is to foster individual and community engagement to feed hungry families and empower those in poverty, creating a sustainable community where all can thrive.",
        responsibilities: [
            "Weigh, sort, and pack food donations",
            "Drive personal vehicles to rescue surplus inventory",
            "Deliver monthly food boxes to homebound neighbors",
            "Answer phones and connect neighbors with community resources"
        ]
    },
    {
        id: 10,
        name: "Bright Blessings",
        category: "Youth & Education",
        city: "Matthews, NC",
        address: "1150 Crews Road, Suite C, Matthews, NC 28105",
        hours: "1 Hour",
        age: "14+",
        isOpen: true,
        contactInfo: "chloe@brightblessingsusa.org",
        link: "https://www.brightblessingsusa.org/getinvolved",
        coords: [35.1055, -80.7060],
        imageSrc: "images/Bright Blessings.jpg",
        description: "A non-profit organization dedicated to bringing joy, care, and support to homeless and impoverished children and their families.",
        commitment: "Recurring",
        verified: true,
        website: "brightblessingsusa.org",
        bgCheck: "Not specified",
        training: "Yes",
        schedule: "Monday – Thursday 9:00 a.m. – 3:00 p.m. and Friday 9:00 a.m. – 12:00 p.m.",
        mission: "Our mission is to bring joy, care, and support to homeless and impoverished children and their families.",
        responsibilities: [
            "Assemble hygiene and care kits",
            "Wrap birthday presents and write personalized birthday cards",
            "Organize off-site collection drives for needed supplies",
            "Facilitate birthday celebrations at local homeless shelters"
        ]
    },
    {
        id: 11,
        name: "Heart For Monroe",
        category: "Community Support",
        city: "Monroe, NC",
        address: "104 S Hayne St, Monroe, NC 28112",
        hours: "Project Based",
        age: "All ages welcome",
        isOpen: true,
        contactInfo: "info@heartformonroe.com",
        link: "https://heartformonroe.com/get-involved/",
        coords: [34.9818, -80.5505],
        imageSrc: "images/Heart For Monroe.jpg",
        description: "A local nonprofit that mobilizes the community to address homelessness, hunger, and education in the Monroe area.",
        commitment: "Recurring / Flexible",
        verified: true,
        website: "heartformonroe.com",
        bgCheck: "Not specified",
        training: "Yes",
        schedule: "Tuesdays (10 a.m. – 1 p.m.), Thursdays (10 a.m. – 1 p.m.), and 1st & 3rd Tuesdays 6 p.m. – 7:30 p.m.",
        mission: "Heart for Monroe is a nonprofit organization that exists to unite and mobilize churches, community organizations, ministries, businesses, and individuals to address homelessness, hunger, education, and build relationships in our community.",
        responsibilities: [
            "Hang clothes on racks and organize thrift-style inventory",
            "Guide clients through 'The Closet' to select basic essentials",
            "Process items at a check-out counter",
            "Participate in direct relational conversations with those seeking help"
        ]
    },
    {
        id: 12,
        name: "Community Shelter of Union County",
        category: "Community Support",
        city: "Monroe, NC",
        address: "160 Meadow Street, Monroe, NC 28110",
        hours: "2 - 4 Hours",
        age: "10+ (with guardian)",
        isOpen: true,
        contactInfo: "volunteer@unionshelter.org",
        link: "https://unionshelter.org/get-involved/volunteering-for-individuals.html",
        coords: [34.9912, -80.5313],
        imageSrc: "images/Community Shelter of Union County.jpg",
        description: "An emergency shelter and soup kitchen providing a safe space, daily meals, and rehousing services.",
        commitment: "Recurring / Shifts",
        verified: true,
        website: "unionshelter.org",
        bgCheck: "Not specified",
        training: "Yes (Volunteer Orientation required)",
        schedule: "Shifts operate across standard days based on the volunteer calendar.",
        mission: "To provide emergency shelter, food, and rehousing services to individuals and families experiencing homelessness.",
        responsibilities: [
            "Prep and serve food in the soup kitchen",
            "Distribute bulk grocery items through the outdoor drive-thru pantry",
            "Compile specific hygiene/snack kits from home",
            "Organize household furniture for rehousing program graduates"
        ]
    },
    {
        id: 13,
        name: "Humane Society of Union County",
        category: "Animal Welfare",
        city: "Monroe, NC",
        address: "4015 Waxhaw Hwy., Monroe NC 28112",
        hours: "Flexible",
        age: "All ages welcome",
        isOpen: true,
        contactInfo: "HSUCinfo@gmail.com",
        link: "https://hsuc.org/volunteer-application/",
        coords: [34.9392, -80.6033],
        imageSrc: "images/Humane Society of Union County.jpg",
        description: "A local animal rescue and welfare organization relying on foster homes and operating a low-cost spay/neuter clinic.",
        commitment: "Flexible / Projects",
        verified: true,
        website: "hsuc.org",
        bgCheck: "Not specified",
        training: "Yes",
        schedule: "Highly flexible (Daily, Weekly, Monthly, Weekends, Occasionally).",
        mission: "Dedicated to animal rescue and adoption, and running a low cost spay/neuter clinic to control local pet populations.",
        responsibilities: [
            "Transport animals to vet appointments",
            "Walk dogs and take photographs for adoption profiles",
            "Set up tables and tents at adoption events",
            "Handle direct sales at community booths"
        ]
    },
    {
        id: 14,
        name: "Second Harvest Food Bank of Metrolina",
        category: "Community Support",
        city: "Charlotte, NC",
        address: "500 Spratt St B, Charlotte, NC 28206",
        hours: "2 - 4 Hours",
        age: "Varies by project",
        isOpen: true,
        contactInfo: "bvandyne@secondharvestmetrolina.org",
        link: "https://www.secondharvestmetrolina.org/ways-to-give/give-time-by-volunteering/volunteer",
        coords: [35.2396, -80.8285],
        imageSrc: "images/Second Harvest Food Bank.jpg",
        description: "A massive regional food bank serving the Metrolina area through warehouse food sorting and mobile pantries.",
        commitment: "Recurring / Shifts",
        verified: true,
        website: "secondharvestmetrolina.org",
        bgCheck: "Yes (For Court-Ordered volunteers)",
        training: "Yes",
        schedule: "Mon-Fri (7:30 a.m.–5:00 p.m.) weekday shifts, plus specific Saturday shifts.",
        mission: "To eradicate hunger through warehouse food sorting, agency distributions, and mobile pantries.",
        responsibilities: [
            "Inspect raw food product for expiration dates or damage",
            "Sort goods into appropriate categories",
            "Manually pack backpacks and boxes with specific food ratios",
            "Load distributions for community agencies"
        ]
    },
    {
        id: 15,
        name: "Habitat for Humanity of the Charlotte Region",
        category: "Community Support",
        city: "Charlotte, NC",
        address: "1133 N. Wendover Rd, Charlotte, NC 28211",
        hours: "4 Hours",
        age: "14+ (16+ for construction)",
        isOpen: true,
        contactInfo: "volunteer@habitatCLTregion.org",
        link: "https://www.cltregionrestore.org/volunteer",
        coords: [35.1950, -80.8105],
        imageSrc: "images/Habitat Charlotte.jpg",
        description: "Retail outlets supporting Habitat for Humanity by selling gently used furniture and building materials.",
        commitment: "Recurring / Shifts",
        verified: true,
        website: "cltregionrestore.org",
        bgCheck: "Position-dependent",
        training: "Yes (Orientation and on-site training provided)",
        schedule: "4-hour shifts (10:00 a.m.–2:00 p.m. or 2:00 p.m.–6:00 p.m.) operating Monday through Sunday.",
        mission: "Seeking to put God's love into action, Habitat for Humanity brings people together to build homes, communities and hope.",
        responsibilities: [
            "Lift furniture and sort through donated housewares",
            "Place items on retail shelves and sweep floors",
            "Load purchased items into customers' cars",
            "Act as a cashier/barista at Julia's Cafe"
        ]
    }, 
    {
        id: 16,
        name: "First Baptist Church of Indian Trail",
        category: "Community Support",
        city: "Indian Trail, NC",
        address: "732 Indian Trail Fairview Rd, Indian Trail, NC 28079",
        hours: "Varies",
        age: "11+ (Varies by role; 16+ for media and guest services)",
        isOpen: true,
        contactInfo: "(704) 882-1005",
        link: "https://www.fbcit.org/volunteer",
        coords: [35.0900, -80.6600],
        imageSrc: "images/FBCIT.jpg",
        description: "A large church mobilizing volunteers weekly to serve in youth ministries, media production, guest services, and local community outreach.",
        commitment: "Recurring / Shifts",
        verified: true,
        website: "fbcit.org",
        bgCheck: "Yes (Required for youth and child ministries)",
        training: "Yes (Reviewing manuals, scheduling interviews, and safety procedure training for specific roles)",
        schedule: "Sunday mornings (9:15 a.m. & 11:00 a.m.), Wednesday evenings, and Thursday evenings.",
        mission: "To love and lead everyone we meet into an everyday walk with Christ.",
        responsibilities: [
            "Lead or assist in Preschool, Elementary, Middle, and High School ministries",
            "Serve on the Guest Services team as a greeter, parking lot attendant, or coffee team member",
            "Operate camera, sound, or lighting equipment for the Media team",
            "Participate in local missions and community outreach programs"
        ]
    },
    {
        id: 17,
        name: "Carolina Waterfowl Rescue",
        category: "Animal Welfare",
        city: "Indian Trail, NC",
        address: "5403 Poplin Rd, Indian Trail, NC 28079",
        hours: "2–4 Hours per shift",
        age: "14+ (14-15 with parent; 16+ to volunteer solo or for baby bird feeding)",
        isOpen: true,
        contactInfo: "volunteer@cwrescue.org",
        link: "https://www.cwrescue.org/volunteer",
        coords: [35.0811, -80.5732],
        imageSrc: "images/Carolina Waterfowl Rescue.jpg",
        description: "A non-profit wildlife rescue organization dedicated to the sanctuary, rehabilitation, and rescue of injured, orphaned, or abandoned wildlife, waterfowl, and exotic animals.",
        commitment: "Weekly / Recurring",
        verified: true,
        website: "cwrescue.org",
        bgCheck: "Not explicitly required (Tetanus booster required for animal handling)",
        training: "Yes (Mandatory 2.5-hour Onsite Volunteer Orientation or specific role training)",
        schedule: "Shifts daily (8:00 a.m.–12:00 p.m. and 4:00 p.m.–8:00 p.m.); Baby bird shifts operate in 3-hour blocks during season.",
        mission: "To provide sanctuary, rescue, and rehabilitation for wildlife, farmed, and exotic animals while advocating for animal welfare through public education.",
        responsibilities: [
            "Feed and water resident animals and assist with medical cage cleaning",
            "Feed orphaned songbirds and prep specialized diets (seasonal)",
            "Sort and chop fresh produce to distribute across animal yards",
            "Assist with facility maintenance, pen mucking, dishes, and laundry"
        ]
    },
    {
        id: 18,
        name: "Atrium Health Volunteer Services - Charlotte",
        category: "Health & Wellness",
        city: "Charlotte, NC",
        address: "1000 Blythe Blvd, Charlotte, NC 28203",
        hours: "2–4 Hours per shift",
        age: "16+ (Junior volunteer programs available for ages 16-17; Adult programs 18+)",
        isOpen: true,
        contactInfo: "volunteerservices@atriumhealth.org",
        link: "https://app.betterimpact.com/PublicEnterprise/EnterpriseSearch?EnterpriseGuid=0cbce21a-d35c-4c7a-90cc-9901f379ed92&SearchType=Organization&SearchId=43725",
        coords: [35.2038, -80.8401],
        imageSrc: "images/Atrium Health.jpg",
        description: "Comprehensive volunteer program across Atrium Health hospital facilities providing patient experience enhancement, administrative support, and guest navigation.",
        commitment: "Recurring / Weekly shifts",
        verified: true,
        website: "atriumhealth.org",
        bgCheck: "Yes (Mandatory background check and health screening/immunization verification)",
        training: "Yes (Mandatory general orientation and unit-specific training required)",
        schedule: "Shifts available 7 days a week; morning, afternoon, and evening slots depending on hospital department assignment.",
        mission: "To improve health, elevate hope and advance healing - for all.",
        responsibilities: [
            "Welcome and escort patients and visitors as Guest Services Ambassadors",
            "Distribute patient enrichment activity carts (books, puzzles, crafts)",
            "Provide administrative support for clinical and volunteer services departments",
            "Offer comfort and companionship to hospitalized patients"
        ]
    }, 
    {
        id: 19,
        name: "Develop for Good",
        category: "Youth & Education",
        city: "Remote (Global)",
        address: "Remote / Online",
        hours: "5–10 Hours per week",
        age: "18+ (College/University students)",
        isOpen: true,
        contactInfo: "contact@developforgood.org",
        link: "https://www.developforgood.org/for-students",
        coords: [37.7749, -122.4194],
        imageSrc: "images/Develop for Good.jpg",
        description: "A national non-profit platform connecting college tech students and industry mentors with non-profits to design and build custom software, web, and mobile solutions.",
        commitment: "16-Week Cohort Program",
        verified: true,
        website: "developforgood.org",
        bgCheck: "Not required",
        training: "Yes (Guided project experience supervised by industry mentors)",
        schedule: "Flexible / Remote; 16-week project cycles during spring, summer, and fall cohorts.",
        mission: "To bridge the tech opportunity gap for underserved students and the digital divide for nonprofits by delivering high-impact, custom technical solutions.",
        responsibilities: [
            "Design user interfaces (UI/UX) and prototype digital products for non-profit clients",
            "Develop front-end and back-end code for mobile apps, websites, and database management systems",
            "Participate in weekly team sprint meetings with industry mentors and non-profit stakeholders",
            "Present completed digital products during cohort Demo Day presentations"
        ]
    },
    {
        id: 20,
        name: "Union Academy Charter School (PK-5 Campus)",
        category: "Youth & Education",
        city: "Monroe, NC",
        address: "675 N MLK Jr. Blvd, Monroe, NC 28110",
        hours: "Varies",
        age: "K-12 Students & Parents (Families complete 60 hrs/yr; High schoolers complete 105 hrs for graduation)",
        isOpen: true,
        contactInfo: "awatkins@unionacademy.org",
        link: "https://www.unionprep.org/volunteers",
        coords: [34.9912, -80.5488],
        imageSrc: "images/Union Academy.jpg",
        description: "A public charter school mobilizing family members and students to support enrichment, classroom operations, and community service projects.",
        commitment: "Recurring / Academic Year",
        verified: true,
        website: "unionprep.org",
        bgCheck: "Yes (Required for on-campus parent/adult volunteers)",
        training: "Yes (Volunteer Orientation presentation and MobileServe tracking setup required)",
        schedule: "School hours (Monday–Friday 7:30 a.m. – 3:30 p.m.) plus extracurricular and evening event shifts.",
        mission: "To educate the whole child through a challenging curriculum and character education, while fostering community service and active family involvement.",
        responsibilities: [
            "Assist teachers with classroom activities, reading programs, and tutoring",
            "Help manage school events, book fairs, and athletic booster activities",
            "Chaperone field trips and supervise student enrichment projects",
            "Log service hours via MobileServe to track family and high school graduation requirements"
        ]
    }, 
    {
        id: 21,
        name: "Charlotte Mecklenburg Library (VolunTeen Program)",
        category: "Youth & Education",
        city: "Charlotte, NC",
        address: "310 N Tryon St, Charlotte, NC 28202",
        hours: "2 Hours per week (Approx. 40 hours per session)",
        age: "13–17 (18 if currently enrolled in high school)",
        isOpen: true,
        contactInfo: "(704) 416-0500",
        link: "https://www.cmlibrary.org/services/teen-services",
        coords: [35.2281, -80.8407],
        imageSrc: "images/Charlotte Mecklenburg Library.jpg",
        description: "A structured youth leadership initiative across 21 branch locations offering teens hands-on library experience, community service hours, and skill development.",
        commitment: "Seasonal Session (School Year or Summer)",
        verified: true,
        website: "cmlibrary.org",
        bgCheck: "Yes (Required for all volunteers 16 years of age and older)",
        training: "Yes (Orientation and ongoing task-specific training provided)",
        schedule: "Shift schedules vary by branch, typically running weekday afternoons/evenings or weekend morning/afternoon slots.",
        mission: "To improve lives and build a stronger community by bringing people, information, and ideas together.",
        responsibilities: [
            "Assist library staff with circulation, shelving, and retrieving requested books",
            "Help patrons with printing, computers, and basic technology navigation",
            "Prepare materials and set up spaces for children and teen library programs",
            "Create engaging social media content, book reviews, or blogs for the library"
        ]
    }, 
    {
        id: 22,
        name: "Novant Health Ballantyne Medical Center",
        category: "Health & Wellness",
        city: "Charlotte, NC",
        address: "10905 Providence Rd West, Charlotte, NC 28277",
        hours: "2–4 Hours per shift",
        age: "14+ (Accepting Junior, College, and Adult volunteers)",
        isOpen: true,
        contactInfo: "(980) 488-4000",
        link: "https://www.novanthealth.org/locations/medical-centers/ballantyne-medical-center/volunteer/",
        coords: [35.0535, -80.8524],
        imageSrc: "images/Novant Health Ballantyne.jpg",
        description: "Community hospital volunteer program assisting patients, visitors, and hospital staff through front desk guidance, administrative support, and wayfinding.",
        commitment: "Recurring / Minimum 6-month commitment",
        verified: true,
        website: "novanthealth.org",
        bgCheck: "Yes (Mandatory background check, health screening, and proof of flu vaccination)",
        training: "Yes (Mandatory general volunteer orientation and module education required)",
        schedule: "Shifts available Monday through Sunday during morning and afternoon hours.",
        mission: "To improve the health of our communities, one person at a time.",
        responsibilities: [
            "Welcome, check in, and guide patients and visitors at the front desk",
            "Assist visitors navigating surgical waiting rooms and hospital departments",
            "Support retail operations inside the hospital gift shop",
            "Deliver flowers, mail, and comfort items to patient rooms"
        ]
    },
    {
        id: 23,
        name: "Novant Health Huntersville Medical Center",
        category: "Health & Wellness",
        city: "Huntersville, NC",
        address: "10030 Gilead Rd, Huntersville, NC 28078",
        hours: "2–4 Hours per shift",
        age: "14+ (Accepting Teen/Junior, College, and Adult volunteers)",
        isOpen: true,
        contactInfo: "(704) 316-4000",
        link: "https://www.novanthealth.org/locations/medical-centers/huntersville-medical-center/volunteer/",
        coords: [35.4124, -80.8658],
        imageSrc: "images/Novant Health Huntersville.jpg",
        description: "Community hospital volunteer program serving patients, families, and healthcare teams across inpatient units, surgical waiting rooms, and public entryways.",
        commitment: "Recurring / Minimum 6-month commitment",
        verified: true,
        website: "novanthealth.org",
        bgCheck: "Yes (Mandatory background check, TB screening, and required immunizations)",
        training: "Yes (Mandatory online orientation and unit-specific training)",
        schedule: "Shifts available Monday through Sunday (Morning: 8:00 a.m.–12:00 p.m., Afternoon: 12:00 p.m.–4:00 p.m., Evening: 4:00 p.m.–8:00 p.m.).",
        mission: "To improve the health of our communities, one person at a time.",
        responsibilities: [
            "Greet patients and visitors at the main entrance and guide them to appointments",
            "Assist families in surgical and intensive care waiting rooms",
            "Deliver flowers, mail, and comfort carts to inpatient rooms",
            "Perform clerical support and inventory tasks for clinical departments"
        ]
    },
    {
        id: 24,
        name: "Novant Health Matthews Medical Center",
        category: "Health & Wellness",
        city: "Matthews, NC",
        address: "1500 Matthews Township Pkwy, Matthews, NC 28105",
        hours: "2–4 Hours per shift",
        age: "14+ (Accepting Junior, College, and Adult volunteers)",
        isOpen: true,
        contactInfo: "(704) 384-6500",
        link: "https://www.novanthealth.org/locations/medical-centers/matthews-medical-center/volunteer/",
        coords: [35.1165, -80.7189],
        imageSrc: "images/Novant Health Matthews.jpg",
        description: "Community hospital volunteer program dedicated to improving patient experience through wayfinding assistance, department support, and compassionate guest interaction.",
        commitment: "Recurring / Minimum 6-month commitment",
        verified: true,
        website: "novanthealth.org",
        bgCheck: "Yes (Mandatory background check and proof of flu vaccination)",
        training: "Yes (Mandatory new volunteer orientation and departmental onboarding)",
        schedule: "Shifts available Monday through Sunday; morning and afternoon windows depending on unit placement.",
        mission: "To improve the health of our communities, one person at a time.",
        responsibilities: [
            "Visit patients and loved ones to provide comfort and emotional support",
            "Serve as a reception clerk, greeting and checking in hospital visitors",
            "Guide and transport patients and families throughout the facility",
            "Assist hospital departments with administrative and operational tasks"
        ]
    },
    {
        id: 25,
        name: "American Heart Association (Youth Heart Programs & Heart Clubs)",
        category: "Health & Wellness",
        city: "Charlotte, NC (Greater Charlotte Division)",
        address: "128 S Tryon St #1580, Charlotte, NC 28202",
        hours: "3–5 Hours per month (Flexible)",
        age: "13+ (13-17 for High School Heart Clubs & Youth Ambassadors; 16+ for Youth Leadership Council)",
        isOpen: true,
        contactInfo: "HeartClub@heart.org",
        link: "https://www.heart.org/en/volunteer/opportunities",
        coords: [35.2264, -80.8431],
        imageSrc: "images/American Heart Association.png",
        description: "National health nonprofit offering structured student leadership pathways, campus Heart Clubs, local Heart Walk event support, and youth advocacy opportunities.",
        commitment: "Seasonal / Academic Year",
        verified: true,
        website: "heart.org",
        bgCheck: "Not required for standard youth student roles",
        training: "Yes (Leadership development orientation and club advisor resources provided)",
        schedule: "Flexible remote & school-based hours; scheduled weekend shifts during annual Heart Walks and community health expos.",
        mission: "To be a relentless force for a world of longer, healthier lives.",
        responsibilities: [
            "Establish and lead school-based Heart Clubs focused on heart health education and fundraising",
            "Serve as a Youth Heart Ambassador sharing personal stories to advocate for health equity",
            "Organize community teams and assist with event logistics for the annual Charlotte Heart Walk",
            "Promote Hands-Only CPR training and heart-healthy habit initiatives among peers"
        ]
    },
    {
        id: 26,
        name: "GenerationNation (Youth Lead Charlotte-Mecklenburg)",
        category: "Community Support",
        city: "Charlotte, NC",
        address: "600 E 4th St, Charlotte, NC 28202",
        hours: "3–5 Hours per month (Sessions held twice monthly)",
        age: "14–18 (High school students in Charlotte-Mecklenburg)",
        isOpen: true,
        contactInfo: "info@generationnation.org",
        link: "https://generationnation.org/programs/youth-lead/",
        coords: [35.2215, -80.8388],
        imageSrc: "images/GenerationNation.jpg",
        description: "A competitive civic leadership program empowering high school students to explore local government, engage with community leaders, and solve civic issues across Charlotte-Mecklenburg.",
        commitment: "Seasonal Cohort (Winter to Spring)",
        verified: true,
        website: "generationnation.org",
        bgCheck: "Not required for student participants",
        training: "Yes (Comprehensive civic leadership development and mentoring included)",
        schedule: "Twice a month outside of school hours (bi-weekly virtual and in-person sessions in downtown Charlotte).",
        mission: "To educate and empower youth to become active, informed citizens and leaders in their schools and communities.",
        responsibilities: [
            "Participate in bi-weekly civic leadership workshops and local government site visits",
            "Collaborate with peers to analyze and propose solutions for youth-focused community issues",
            "Engage directly with Charlotte-Mecklenburg school board members, city council, and county leaders",
            "Serve as a student representative on the Charlotte-Mecklenburg Youth Council"
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
const mapDistanceStatus = document.getElementById("map-distance-status");

let markerGroup = L.layerGroup().addTo(map);
let userLocation = null; 
let currentRadiusCircle = null; 

function formatDistance(coords) {
    if (!userLocation) return "Distance unavailable";
    const meters = map.distance(L.latLng(userLocation.lat, userLocation.lng), L.latLng(coords[0], coords[1]));
    const miles = meters / 1609.34;
    return `${miles < 1 ? miles.toFixed(2) : miles.toFixed(1)} miles away`;
}

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
    const applyDisabledClass = opp.isOpen && hasFullAccess ? "" : "disabled";
    const applyLabel = !hasFullAccess ? "Verify email to apply" : (opp.isOpen ? "Apply via External Link" : "Applications Closed");
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

// Global Event Delegation for buttons (Learn More & Star Button)
document.addEventListener('click', async function(e) {
    // Check if they clicked "Learn More"
    const modalBtn = e.target.closest('.open-modal-btn');
    if (modalBtn) {
        const id = parseInt(modalBtn.getAttribute('data-opp-id'), 10);
        openModal(id);
        return;
    }

    // Check if they clicked the Star/Save button
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
                // Remove from local array, update UI, and push removal to Firestore
                userStarredIds = userStarredIds.filter(savedId => savedId !== id);
                starBtn.textContent = '☆';
                starBtn.setAttribute("aria-label", "Save opportunity");
                starBtn.title = "Save opportunity";
                await updateDoc(userRef, { starredOpportunities: arrayRemove(id) });
            } else {
                // Add to local array, update UI, and push addition to Firestore
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
function renderOpportunities(dataToRender) {
    const visibleData = hasFullAccess ? dataToRender : dataToRender.slice(0, 3);
    if (oppCountDisplay) oppCountDisplay.textContent = visibleData.length;
    if (listingsGrid) listingsGrid.innerHTML = '';
    markerGroup.clearLayers();

    visibleData.forEach(opp => {
        // Render Map Marker for Opportunity
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
    
        // Render Left-Side Card
        if (listingsGrid) {
            const statusBadgeClass = opp.isOpen ? "status-open" : "status-closed";
            const statusBadgeText = opp.isOpen ? "Open" : "Closed";
            
            const verifiedBadge = opp.verified === true 
                ? `<span class="verified-badge">🟢 Verified Nonprofit</span>` 
                : (opp.verified === "gov" ? `<span class="gov-badge">🏛️ Gov Org</span>` : '');

            const tasksPreviewHTML = opp.responsibilities.slice(0,3).map(task => `<li>${task}</li>`).join('');
            const dynamicBgStyle = opp.imageSrc ? `background-image: url('${opp.imageSrc}');` : '';
            
            // Check if this opportunity is in the user's saved array
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

    if (currentRadiusCircle) {
        map.removeLayer(currentRadiusCircle);
        currentRadiusCircle = null;
    }

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

// Attach Event Listeners
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

// Initial Render
renderOpportunities(opportunitiesData);
setTimeout(() => { map.invalidateSize(); }, 200);

// Modal Close Logic
const modalOverlay = document.getElementById('opp-modal');
if (modalOverlay) {
    modalOverlay.querySelector('.close-modal').addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });
}

// User Location Logic
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