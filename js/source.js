import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// 1. Initialize Firebase (Copied from your existing config)
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

// 2. Global Navbar Logic
const authMenu = document.getElementById("auth-menu");

onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- USER IS LOGGED IN ---
        if (authMenu) {
            // Replace Sign In / Join Now with Dashboard / Sign Out
            authMenu.innerHTML = `
                <a href="dashboard.html" class="login">Dashboard</a>
                <button id="global-logout-btn" class="btn-nav">Sign Out</button>
            `;
            
            // Activate the new Sign Out button
            document.getElementById("global-logout-btn").addEventListener("click", () => {
                signOut(auth).then(() => {
                    // Refresh the page so the navbar resets to default
                    window.location.reload(); 
                });
            });
        }
    } else {
        // --- USER IS NOT LOGGED IN ---
        if (authMenu) {
            // Show default state (Safety fallback)
            authMenu.innerHTML = `
                <a href="login.html" class="login">Sign In</a>
                <a href="signup.html" class="btn-nav">Join Now</a>
            `;
        }
    }
});

// 3. Existing Scroll Effect
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