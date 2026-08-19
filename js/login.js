/*
  FILE PURPOSE:
  This script (js/login.js) manages user sign-in and password recovery functionality for the website. 
  It handles form input validation, toggles the user interface dynamically between sign-in and password reset modes, 
  sends password reset emails via Firebase Auth, and authenticates existing users before redirecting them to their dashboard.

  FILES REFERENCED IN THIS FILE:
  - External Firebase Libraries: firebase-app.js, firebase-auth.js (loaded via Google CDN)
  - Associated HTML Page: login.html
  - Redirection Target: dashboard.html
*/

// Import required Firebase modular SDK functions for app initialization and authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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

// Initialize Firebase App and Auth services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Global DOM Element Selectors from login.html
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorBox = document.getElementById("error-message");
const passwordGroup = document.getElementById("password-group");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const loginForm = document.getElementById("login-form");

// Input Listener: Clears red error outlines dynamically as the user types/edits form fields
const inputs = [emailInput, passwordInput];
inputs.forEach(input => {
    if (input) {
        input.addEventListener("input", function() {
            input.classList.remove("invalid-field");
        });
    }
});

// State flag tracking whether form is in standard "Sign In" mode or "Forgot Password" mode
let isResetMode = false;

// ==========================================
// 1. UI TOGGLE LOGIC (FORGOT PASSWORD SWITCH)
// ==========================================
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevents link jump anchor behavior
        
        isResetMode = !isResetMode; // Toggle mode boolean state

        // Clear existing error state messages and field outlines
        if (errorBox) { errorBox.textContent = ""; errorBox.style.color = ""; }
        inputs.forEach(input => { if (input) input.classList.remove("invalid-field"); });

        if (isResetMode) {
            // Morph view into "Forgot Password" mode: Hide password input, update button labels
            passwordGroup.style.display = "none";
            loginBtn.textContent = "Send Reset Link";
            forgotPasswordLink.textContent = "Back to Sign In";
            if (passwordInput) passwordInput.removeAttribute("required");
        } else {
            // Revert view to standard "Sign In" mode
            passwordGroup.style.display = "block"; 
            loginBtn.textContent = "Sign In";
            forgotPasswordLink.textContent = "Forgot Password?";
            if (passwordInput) passwordInput.setAttribute("required", "true");
        }
    });
}

// ==========================================
// 2. FORM SUBMISSION PIPELINE
// ==========================================
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevents default form submission and page reloads
        if (loginBtn) loginBtn.disabled = true; // Disable button to block duplicate submissions

        // Reset UI alerts and field highlights prior to processing
        if (errorBox) { errorBox.textContent = ""; errorBox.style.color = ""; }
        inputs.forEach(input => {
            if (input) input.classList.remove("invalid-field");
        });

        // Extract input values and trim email whitespace
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        // Check 1: Verify email presence (Required for both login & reset flows)
        if (!email) {
            if (errorBox) errorBox.textContent = "Please enter your email address.";
            if (emailInput) emailInput.classList.add("invalid-field");
            if (loginBtn) loginBtn.disabled = false;
            return;
        }

        // Check 2: Verify email format validity via regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (errorBox) errorBox.textContent = "Please enter a valid email address.";
            if (emailInput) emailInput.classList.add("invalid-field");
            if (loginBtn) loginBtn.disabled = false;
            return;
        }

        // ==========================================
        // FORGOT PASSWORD EXECUTION ROUTE
        // ==========================================
        if (isResetMode) {
            sendPasswordResetEmail(auth, email, {
                url: new URL("login.html", window.location.href).href,
                handleCodeInApp: false
            })
                .then(() => {
                    if (errorBox) {
                        errorBox.style.color = "var(--emerald)";
                        errorBox.textContent = "Reset link sent! Please check your inbox.";
                    }
                    if (loginBtn) loginBtn.disabled = false;
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.error("Reset Error:", errorCode);
                    if (errorBox) {
                        if (errorCode === 'auth/user-not-found') {
                            errorBox.textContent = "No account found with that email address.";
                        } else {
                            errorBox.textContent = "An error occurred. Please try again later.";
                        }
                    }
                    if (loginBtn) loginBtn.disabled = false;
                });
            
            return; // Terminate execution here so form does not proceed to login execution
        }

        // ==========================================
        // STANDARD LOGIN EXECUTION ROUTE
        // ==========================================
        
        // Check 3: Verify password presence for sign-in attempt
        if (!password) {
            if (errorBox) errorBox.textContent = "Please enter your password.";
            if (passwordInput) passwordInput.classList.add("invalid-field");
            if (loginBtn) loginBtn.disabled = false;
            return;
        }

        // Authenticate credentials against Firebase Auth
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Logged in:", user.email);
                
                if (errorBox) {
                    errorBox.style.color = "var(--emerald)"; 
                    errorBox.textContent = "Success! Logging you in...";
                }

                // Redirect user to dashboard page upon successful authentication
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            })
            .catch((error) => {
                // Firebase Login Error Handler
                const errorCode = error.code;
                console.error("Login Error:", errorCode);

                if (errorBox) {
                    if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                        errorBox.textContent = "Incorrect email or password. Please try again.";
                        if (emailInput) emailInput.classList.add("invalid-field");
                        if (passwordInput) passwordInput.classList.add("invalid-field");
                    } else if (errorCode === 'auth/too-many-requests') {
                        errorBox.textContent = "Too many failed attempts. Please wait a moment before trying again.";
                    } else if (errorCode === 'auth/invalid-email') {
                        errorBox.textContent = "The email address is badly formatted.";
                        if (emailInput) emailInput.classList.add("invalid-field");
                    } else {
                        errorBox.textContent = "An unexpected login error occurred. Details: " + errorCode;
                    }
                }
                if (loginBtn) loginBtn.disabled = false;
            });
    });
}