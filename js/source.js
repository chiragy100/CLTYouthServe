/*
  FILE PURPOSE:
  This file serves as the core global JavaScript file (js/source.js). It initializes Firebase configuration, 
  manages global authentication listener states, updates navigation bar buttons dynamically based on whether 
  a user is signed in, handles automatic sign-out after 6 hours of inactivity, and adds subtle UI scroll effects.

  FILES REFERENCED IN THIS FILE:
  - External Firebase Libraries: firebase-app.js, firebase-auth.js (via Google CDN)
  - HTML Web Pages: login.html, signup.html, dashboard.html
*/

// Import required modular functions from Google Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ==========================================
// 1. FIREBASE INITIALIZATION
// ==========================================

// Firebase configuration keys connecting the website to the CLT YouthServe cloud database
const firebaseConfig = {
  apiKey: "AIzaSyCO-AmNN7QO_9wbqNq9nR1e_XYBdlRSLVg",
  authDomain: "clt-youthserve.firebaseapp.com",
  projectId: "clt-youthserve",
  storageBucket: "clt-youthserve.firebasestorage.app",
  messagingSenderId: "29022006642",
  appId: "1:29022006642:web:d783a76d7a0e2fd91b01eb",
  measurementId: "G-7LWN04E6QL"
};

// Initializes the Firebase application instance and authentication service
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ==========================================
// 2. AUTO SIGN-OUT LOGIC (6 HOUR IDLE TIMER)
// ==========================================

// Defines inactivity limit: 6 Hours converted to milliseconds
const IDLE_TIMEOUT_MS = 6 * 60 * 60 * 1000; 

// Function to update the last active timestamp in browser storage whenever user acts
function resetIdleTimer() {
    localStorage.setItem('lastActivity', Date.now().toString());
}

// Global Event Listeners: Triggers idle timer resets on common user interactions
window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('keydown', resetIdleTimer);
window.addEventListener('click', resetIdleTimer);
window.addEventListener('scroll', resetIdleTimer);

// Background Interval: Checks every 60 seconds if the user exceeded 6 hours without activity
setInterval(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    
    // Checks if activity timestamp exists and exceeded the 6-hour threshold
    if (lastActivity && (Date.now() - parseInt(lastActivity, 10) > IDLE_TIMEOUT_MS)) {
        // Automatically signs out active users for account security
        if (auth.currentUser) {
            console.log("User idle for 6 hours. Auto-signing out for security.");
            signOut(auth).then(() => {
                localStorage.removeItem('lastActivity'); // Clears saved activity timestamp
                window.location.href = "login.html";     // Redirects user to login page
            });
        }
    }
}, 60000); // 60,000 ms = 1 Minute frequency check


// ==========================================
// 3. GLOBAL NAVBAR LOGIC
// ==========================================

// Retrieves navigation menu element containing login/signup links
const authMenu = document.getElementById("auth-menu");

// Listens for authentication state changes (detects if user is logged in or out)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Initializes activity timestamp on session start if missing
        if (!localStorage.getItem('lastActivity')) {
            resetIdleTimer();
        }

        // Dynamically replaces "Sign In / Join Now" buttons with "Dashboard / Sign Out"
        if (authMenu) {
            authMenu.innerHTML = `
                <a href="dashboard.html" class="login">Dashboard</a>
                <button id="global-logout-btn" class="btn-nav">Sign Out</button>
            `;
            
            // Attaches click listener to sign out button
            document.getElementById("global-logout-btn").addEventListener("click", () => {
                signOut(auth).then(() => {
                    localStorage.removeItem('lastActivity'); // Clears timer on sign out
                    window.location.reload(); 
                });
            });
        }
    } else {
        // Default state when user is NOT signed in: Displays "Sign In" and "Join Now"
        if (authMenu) {
            authMenu.innerHTML = `
                <a href="login.html" class="login">Sign In</a>
                <a href="signup.html" class="btn-nav">Join Now</a>
            `;
        }
    }
});


// ==========================================
// 4. UI EFFECTS
// ==========================================

// Scroll Event Listener: Adds shadow and shrinks navbar height when scrolling down the page
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