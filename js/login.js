import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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

// Global Element Selectors
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorBox = document.getElementById("error-message");

// Helper function to clear individual input red glows when a user fixes them
const inputs = [emailInput, passwordInput];
inputs.forEach(input => {
    if (input) {
        input.addEventListener("input", function() {
            input.classList.remove("invalid-field");
        });
    }
});

if (loginBtn) {
    loginBtn.addEventListener("click", function(event) {
        event.preventDefault(); // Stop page reload

        // Reset UI state at the start of every click submit attempt
        if (errorBox) errorBox.textContent = "";
        inputs.forEach(input => {
            if (input) input.classList.remove("invalid-field");
        });

        // Grab current values and trim whitespace from email
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        // ==========================================
        // FRONT-END VALIDATION (CATCH ALL EMPTY FIELDS)
        // ==========================================
        
        if (!email) {
            if (errorBox) errorBox.textContent = "Please enter your email address.";
            if (emailInput) emailInput.classList.add("invalid-field");
            return;
        }

        // Simple regex check for valid email formatting
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (errorBox) errorBox.textContent = "Please enter a valid email address.";
            if (emailInput) emailInput.classList.add("invalid-field");
            return;
        }

        if (!password) {
            if (errorBox) errorBox.textContent = "Please enter your password.";
            if (passwordInput) passwordInput.classList.add("invalid-field");
            return;
        }

        // ==========================================
        // FIREBASE PROCESSING PIPELINE
        // ==========================================
        
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in successfully
                const user = userCredential.user;
                console.log("Logged in:", user.email);
                
                if (errorBox) {
                    errorBox.style.color = "var(--emerald)"; 
                    errorBox.textContent = "Success! Logging you in...";
                }

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            })
            .catch((error) => {
                const errorCode = error.code;
                console.error("Login Error:", errorCode);

                if (errorBox) {
                    // User-friendly custom responses hiding raw system code
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
                        // Fallback catch-all error message structure keeping details safe at the end
                        errorBox.textContent = "An unexpected login error occurred. Details: " + errorCode;
                    }
                }
            });
    });
}