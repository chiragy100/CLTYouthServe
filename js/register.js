import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
// 1. IMPORT FIRESTORE FUNCTIONS
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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
const db = getFirestore(app); // 2. INITIALIZE DATABASE

// Global Element Selectors
const submitBtn = document.getElementById("submit-btn");
const confirmPasswordInput = document.getElementById("confirm-password");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const fullnameInput = document.getElementById("fullname");
const dobInput = document.getElementById("dob");
const errorBox = document.getElementById("error-message");

// Helper function to clear individual input red glows when a user fixes them
const inputs = [emailInput, passwordInput, confirmPasswordInput, fullnameInput, dobInput];
inputs.forEach(input => {
    if (input) {
        input.addEventListener("input", function() {
            input.classList.remove("invalid-field");
        });
    }
});

if (submitBtn) {
  submitBtn.addEventListener("click", function(event) {
      event.preventDefault(); 

      // Reset UI state at the start of every click submit attempt
      if (errorBox) errorBox.textContent = "";
      inputs.forEach(input => {
          if (input) input.classList.remove("invalid-field");
      });

      // Grab current values and trim whitespace
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";
      const fullname = fullnameInput ? fullnameInput.value.trim() : "";
      const dob = dobInput ? dobInput.value : "";

      // ==========================================
      // FRONT-END VALIDATION (CATCH ALL EMPTY FIELDS)
      // ==========================================
      
      if (!fullname) {
          if (errorBox) errorBox.textContent = "Please enter your full name.";
          if (fullnameInput) fullnameInput.classList.add("invalid-field");
          return;
      }

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

      if (!dob) {
          if (errorBox) errorBox.textContent = "Please select your date of birth.";
          if (dobInput) dobInput.classList.add("invalid-field");
          return;
      }

      // Front-end local check for password length (Stops execution immediately if under 6)
      if (password.length < 6) {
          if (errorBox) errorBox.textContent = "Password must be at least 6 characters long.";
          if (passwordInput) passwordInput.classList.add("invalid-field");
          return;
      }

      // Password Match Validation Check
      if (password !== confirmPassword) {
          if (errorBox) errorBox.textContent = "Passwords do not match!";
          if (confirmPasswordInput) confirmPasswordInput.classList.add("invalid-field");
          return;
      }

      // ==========================================
      // FIREBASE PROCESSING PIPELINE
      // ==========================================
      
      // 3. CREATE USER (Auth)
      createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              const user = userCredential.user;
              console.log("User created:", user.uid);

              // 4. SAVE EXTRA DETAILS TO DATABASE (Firestore)
              const userData = {
                  fullName: fullname,
                  email: email,
                  dateOfBirth: dob,
                  role: "student", 
                  joinedAt: new Date().toISOString(),
                  serviceHours: 0 
              };

              // Write to the database
              setDoc(doc(db, "users", user.uid), userData)
                .then(() => {
                    console.log("User data stored in Firestore");
                    
                    // 5. SEND VERIFICATION & REDIRECT
                    sendEmailVerification(user).then(() => {
                        if (errorBox) {
                            errorBox.style.color = "var(--emerald)"; 
                            errorBox.textContent = "Account created! Verification email sent. Redirecting...";
                        }
                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 2000);
                    });
                })
                .catch((error) => {
                    console.error("Error writing to DB:", error);
                    if (errorBox) errorBox.textContent = "Account created, but failed to save profile data.";
                });

          })
          .catch((error) => {
              const errorCode = error.code;
              console.error("Firebase Auth Error:", errorCode, error.message);
              
              if (errorBox) {
                  // User-friendly custom responses hiding raw system code
                  if (errorCode === 'auth/email-already-in-use') {
                      errorBox.textContent = "That email is already registered. Please sign in instead.";
                      if (emailInput) emailInput.classList.add("invalid-field");
                  } else if (errorCode === 'auth/invalid-email') {
                      errorBox.textContent = "The email address is badly formatted.";
                      if (emailInput) emailInput.classList.add("invalid-field");
                  } else if (errorCode === 'auth/operation-not-allowed') {
                      errorBox.textContent = "Email/Password sign-up is currently disabled.";
                  } else {
                      // Fallback catch-all error message structure keeping details safe at the end
                      errorBox.textContent = "An unexpected registration error occurred. Details: " + errorCode;
                  }
              }
          });
  });
}