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

const submitBtn = document.getElementById("submit-btn");

if (submitBtn) {
  submitBtn.addEventListener("click", function(event) {
      event.preventDefault(); 

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      const fullname = document.getElementById("fullname").value;
      const dob = document.getElementById("dob").value; // Get the DOB

      if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
      }

      // 3. CREATE USER (Auth)
      createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              const user = userCredential.user;
              console.log("User created:", user.uid);

              // 4. SAVE EXTRA DETAILS TO DATABASE (Firestore)
              // We create a document inside a collection called "users"
              // The document ID will be the User's unique ID (uid)
              const userData = {
                  fullName: fullname,
                  email: email,
                  dateOfBirth: dob,
                  role: "student", // Good to track if they are a student or admin
                  joinedAt: new Date().toISOString(),
                  serviceHours: 0 // Initialize their hours to 0
              };

              // Write to the database
              setDoc(doc(db, "users", user.uid), userData)
                .then(() => {
                    console.log("User data stored in Firestore");
                    
                    // 5. SEND VERIFICATION & REDIRECT
                    sendEmailVerification(user).then(() => {
                        alert("Account created! Verification email sent.");
                        window.location.href = "dashboard.html";
                    });
                })
                .catch((error) => {
                    console.error("Error writing to DB:", error);
                    alert("Account created, but failed to save profile data.");
                });

          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              
              if (errorCode === 'auth/email-already-in-use') {
                  alert("That email is already registered. Please sign in instead.");
              } else if (errorCode === 'auth/weak-password') {
                  alert("Password should be at least 6 characters.");
              } else {
                  alert("Error: " + errorMessage);
              }
          });
  });
}