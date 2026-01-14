import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
// 1. ADD FIRESTORE IMPORTS
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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
const db = getFirestore(app); // 2. INITIALIZE DB

// 3. Check Login Status & Fetch Data
onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- User is logged in ---
        console.log("Auth User ID:", user.uid);

        // A. Handle Verification Warning
        const warningBanner = document.getElementById("verify-warning");
        if (!user.emailVerified) {
            if(warningBanner) warningBanner.style.display = "block";
            
            const resendBtn = document.getElementById("resend-btn");
            if(resendBtn) {
                resendBtn.addEventListener("click", () => {
                    sendEmailVerification(user)
                    .then(() => alert("Verification email resent!"))
                    .catch((error) => console.error(error));
                });
            }
        } else {
            if(warningBanner) warningBanner.style.display = "none";
        }

        // B. FETCH USER DATA FROM FIRESTORE
        const docRef = doc(db, "users", user.uid); // Target the document with the User's ID
        
        getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("Database Data:", userData);

                // Update Name
                const nameSpan = document.getElementById("user-email"); // We are reusing the existing span
                if(nameSpan) {
                    // Display Name (or fallback to email if name is missing)
                    nameSpan.textContent = userData.fullName || user.email;
                }

                // Update Service Hours
                const hoursDisplay = document.getElementById("service-hours-display");
                if(hoursDisplay) {
                    const hours = userData.serviceHours || 0;
                    hoursDisplay.textContent = `${hours} Service hours logged`;
                }
            } else {
                console.log("No profile found in database!");
                // Fallback to just showing email
                document.getElementById("user-email").textContent = user.email;
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
        });

    } else {
        // --- User is NOT logged in ---
        window.location.href = "signin.html";
    }
});

// 4. Handle Logout
const logoutBtn = document.getElementById("logout-btn");
if(logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });
}