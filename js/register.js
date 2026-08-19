/*
  FILE PURPOSE:
  This file serves as the user registration logic script (js/register.js). It handles front-end form validation 
  for the sign-up page, creates new user authentication accounts in Firebase, writes initial profile data 
  (name, email, age, role) to the Firestore database, and dispatches email verification links.

  FILES REFERENCED IN THIS FILE:
  - External Firebase Libraries: firebase-app.js, firebase-auth.js, firebase-firestore.js (via Google CDN)
  - HTML Web Pages: signup.html, login.html, dashboard.html
*/

// Import required Firebase modules for App initialization, Authentication, and Firestore database operations
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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

// Global DOM Element Selectors from signup.html
const submitBtn = document.getElementById("submit-btn");
const confirmPasswordInput = document.getElementById("confirm-password");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const fullnameInput = document.getElementById("fullname");
const dobInput = document.getElementById("dob");
const errorBox = document.getElementById("error-message");
const signupForm = document.getElementById("signup-form");

// Helper listener: Clears red error borders on inputs as soon as the user starts typing/editing
const inputs = [emailInput, passwordInput, confirmPasswordInput, fullnameInput, dobInput];
inputs.forEach(input => {
    if (input) {
        input.addEventListener("input", function() {
            input.classList.remove("invalid-field");
        });
    }
});

// FORM SUBMISSION EVENT LISTENER
if (signupForm) {
  signupForm.addEventListener("submit", function(event) {
      event.preventDefault(); // Prevents default browser page reload
      if (submitBtn) submitBtn.disabled = true; // Prevents double submission clicks

      // Resets error messages and field highlights from previous attempts
      if (errorBox) errorBox.textContent = "";
      inputs.forEach(input => {
          if (input) input.classList.remove("invalid-field");
      });

      // Extract form input values and strip whitespace
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";
      const fullname = fullnameInput ? fullnameInput.value.trim() : "";
      const dob = dobInput ? dobInput.value : "";

      // ==========================================
      // FRONT-END VALIDATION CHECKS
      // ==========================================
      
      // Check 1: Full Name field empty
      if (!fullname) {
          if (errorBox) errorBox.textContent = "Please enter your full name.";
          if (fullnameInput) fullnameInput.classList.add("invalid-field");
          if (submitBtn) submitBtn.disabled = false;
          return;
      }

      // Check 2: Email field empty
      if (!email) {
          if (errorBox) errorBox.textContent = "Please enter your email address.";
          if (emailInput) emailInput.classList.add("invalid-field");
          if (submitBtn) submitBtn.disabled = false;
          return;
      }

      // Check 3: Email format validity using regular expression pattern
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          if (errorBox) errorBox.textContent = "Please enter a valid email address.";
          if (emailInput) emailInput.classList.add("invalid-field");
          if (submitBtn) submitBtn.disabled = false;
          return;
      }

      // Check 4: Date of Birth field empty
      if (!dob) {
          if (errorBox) errorBox.textContent = "Please select your date of birth.";
          if (dobInput) dobInput.classList.add("invalid-field");
          if (submitBtn) submitBtn.disabled = false;
          return;
      }

      // Check 5: Password minimum length requirement (at least 6 characters)
      if (password.length < 6) {
          if (errorBox) errorBox.textContent = "Password must be at least 6 characters long.";
          if (passwordInput) passwordInput.classList.add("invalid-field");
          if (submitBtn) submitBtn.disabled = false;
          return;
      }

      // Check 6: Password confirmation equality check
      if (password !== confirmPassword) {
          if (errorBox) errorBox.textContent = "Passwords do not match!";
          if (confirmPasswordInput) confirmPasswordInput.classList.add("invalid-field");
          if (submitBtn) submitBtn.disabled = false;
          return;
      }

      // ==========================================
      // FIREBASE CREATION & DATA RECORDING PIPELINE
      // ==========================================
      
      // Step A: Create authentication user in Firebase Auth
      createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              const user = userCredential.user;
              console.log("User created:", user.uid);

              // Step B: Prepare default user document object for database storage
              const userData = {
                  fullName: fullname,
                  email: email,
                  dateOfBirth: dob,
                  role: "student", 
                  joinedAt: new Date().toISOString(),
                  serviceHours: 0 
              };

              // Step C: Save user document in Firestore under 'users' collection with user's UID
              setDoc(doc(db, "users", user.uid), userData)
                .then(() => {
                    console.log("User data stored in Firestore");
                    
                    // Step D: Send email verification link and redirect to dashboard
                    sendEmailVerification(user, {
                        url: new URL("login.html", window.location.href).href,
                        handleCodeInApp: false
                    }).then(() => {
                        if (errorBox) {
                            errorBox.style.color = "var(--emerald)"; 
                            errorBox.textContent = "Account created! Verification email sent. Redirecting...";
                        }
                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 2000);
                    }).catch(() => {
                        if (errorBox) errorBox.textContent = "Account created, but we could not send the verification email. Please use Resend Link from your dashboard.";
                        if (submitBtn) submitBtn.disabled = false;
                    });
                })
                .catch((error) => {
                    console.error("Error writing to DB:", error);
                    if (errorBox) errorBox.textContent = "Account created, but failed to save profile data.";
                    if (submitBtn) submitBtn.disabled = false;
                });

          })
          .catch((error) => {
              // Firebase Authentication Error Handler
              const errorCode = error.code;
              console.error("Firebase Auth Error:", errorCode, error.message);
              
              if (errorBox) {
                  // User-friendly custom responses hiding raw system codes
                  if (errorCode === 'auth/email-already-in-use') {
                      errorBox.textContent = "That email is already registered. Please sign in instead.";
                      if (emailInput) emailInput.classList.add("invalid-field");
                  } else if (errorCode === 'auth/invalid-email') {
                      errorBox.textContent = "The email address is badly formatted.";
                      if (emailInput) emailInput.classList.add("invalid-field");
                  } else if (errorCode === 'auth/operation-not-allowed') {
                      errorBox.textContent = "Email/Password sign-up is currently disabled.";
                  } else {
                      errorBox.textContent = "An unexpected registration error occurred. Details: " + errorCode;
                  }
              }
              if (submitBtn) submitBtn.disabled = false;
          });
  });
}