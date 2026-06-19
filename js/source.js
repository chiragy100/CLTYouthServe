import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// 1. Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCO-AmNN7QO_9wbqNq9nR1e_XYBdlRSLVg",
  authDomain: "clt-youthserve.firebaseapp.com",
  projectId: "clt-youthserve",
  storageBucket: "clt-youthserve.firebasestorage.app",
  messagingSenderId: "29022006642",
  appId: "1:29022006642:web:d783a76d7a0e2fd91b01eb",
  measurementId: "G-7LWN04E6QL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================
// AUTO SIGN-OUT LOGIC (6 HOUR IDLE TIMER)
// ==========================================
const IDLE_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 Hours in milliseconds

// Update the timestamp in localStorage whenever the user does something
function resetIdleTimer() {
    localStorage.setItem('lastActivity', Date.now().toString());
}

// Track these standard activities
window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('keydown', resetIdleTimer);
window.addEventListener('click', resetIdleTimer);
window.addEventListener('scroll', resetIdleTimer);

// Check every 60 seconds if they have exceeded the 6-hour limit
setInterval(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    
    // If we have a timestamp, and the time since then is greater than our 6 hour limit
    if (lastActivity && (Date.now() - parseInt(lastActivity, 10) > IDLE_TIMEOUT_MS)) {
        // Only trigger if a user is currently logged in
        if (auth.currentUser) {
            console.log("User idle for 6 hours. Auto-signing out for security.");
            signOut(auth).then(() => {
                localStorage.removeItem('lastActivity'); // Clean up
                window.location.href = "login.html";     // Kick them to the login page
            });
        }
    }
}, 60000); // 60000 ms = 1 minute


// ==========================================
// GLOBAL NAVBAR LOGIC
// ==========================================
const authMenu = document.getElementById("auth-menu");

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Initialize the activity timer the moment they log in/page loads
        if (!localStorage.getItem('lastActivity')) {
            resetIdleTimer();
        }

        // Replace Sign In / Join Now with Dashboard / Sign Out
        if (authMenu) {
            authMenu.innerHTML = `
                <a href="dashboard.html" class="login">Dashboard</a>
                <button id="global-logout-btn" class="btn-nav">Sign Out</button>
            `;
            
            document.getElementById("global-logout-btn").addEventListener("click", () => {
                signOut(auth).then(() => {
                    localStorage.removeItem('lastActivity'); // Clean up on manual sign out
                    window.location.reload(); 
                });
            });
        }
    } else {
        // User is NOT logged in
        if (authMenu) {
            authMenu.innerHTML = `
                <a href="login.html" class="login">Sign In</a>
                <a href="signup.html" class="btn-nav">Join Now</a>
            `;
        }
    }
});

// ==========================================
// UI EFFECTS
// ==========================================
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