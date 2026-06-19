import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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
const passwordGroup = document.getElementById("password-group");
const forgotPasswordLink = document.getElementById("forgot-password-link");

// Helper function to clear individual input red glows when a user fixes them
const inputs = [emailInput, passwordInput];
inputs.forEach(input => {
    if (input) {
        input.addEventListener("input", function() {
            input.classList.remove("invalid-field");
        });
    }
});

// State tracker to know if we are logging in or resetting a password
let isResetMode = false;

// ==========================================
// UI TOGGLE LOGIC
// ==========================================
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function(event) {
        event.preventDefault(); // Stop the link from jumping the page
        
        isResetMode = !isResetMode; // Toggle the state

        // Clear any lingering errors/red outlines
        if (errorBox) { errorBox.textContent = ""; errorBox.style.color = ""; }
        inputs.forEach(input => { if (input) input.classList.remove("invalid-field"); });

        if (isResetMode) {
            // Morph into Forgot Password UI
            passwordGroup.style.display = "none";
            loginBtn.textContent = "Send Reset Link";
            forgotPasswordLink.textContent = "Back to Sign In";
            if (passwordInput) passwordInput.removeAttribute("required");
        } else {
            // Revert to Sign In UI
            passwordGroup.style.display = "block"; 
            loginBtn.textContent = "Sign In";
            forgotPasswordLink.textContent = "Forgot Password?";
            if (passwordInput) passwordInput.setAttribute("required", "true");
        }
    });
}

// ==========================================
// FORM SUBMISSION PIPELINE
// ==========================================
if (loginBtn) {
    loginBtn.addEventListener("click", function(event) {
        event.preventDefault(); // Stop page reload

        // 1. Reset UI state at the start of every click submit attempt
        if (errorBox) { errorBox.textContent = ""; errorBox.style.color = ""; }
        inputs.forEach(input => {
            if (input) input.classList.remove("invalid-field");
        });

        // 2. Grab current values
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        // 3. Email Validation (Required for BOTH Login and Reset modes)
        if (!email) {
            if (errorBox) errorBox.textContent = "Please enter your email address.";
            if (emailInput) emailInput.classList.add("invalid-field");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (errorBox) errorBox.textContent = "Please enter a valid email address.";
            if (emailInput) emailInput.classList.add("invalid-field");
            return;
        }

        // ==========================================
        // FORGOT PASSWORD PIPELINE
        // ==========================================
        if (isResetMode) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    if (errorBox) {
                        errorBox.style.color = "var(--emerald)"; // Ensure this matches your CSS
                        errorBox.textContent = "Reset link sent! Please check your inbox.";
                    }
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
                });
            
            return; // EXIT here so it doesn't try to log in!
        }

        // ==========================================
        // LOGIN PIPELINE
        // ==========================================
        
        // 4. Password validation (Only needed if logging in)
        if (!password) {
            if (errorBox) errorBox.textContent = "Please enter your password.";
            if (passwordInput) passwordInput.classList.add("invalid-field");
            return;
        }

        // 5. Fire Login Request
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
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
            });
    });
}