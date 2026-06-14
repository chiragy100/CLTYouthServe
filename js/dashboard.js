import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
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
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- Handle Email Verification Warning ---
        const warningBanner = document.getElementById("verify-warning");
        if (!user.emailVerified) {
            if(warningBanner) warningBanner.style.display = "block";
            const resendBtn = document.getElementById("resend-btn");
            if(resendBtn) {
                resendBtn.addEventListener("click", () => {
                    sendEmailVerification(user)
                    .then(() => alert("Verification email resent! Check your inbox/spam."))
                    .catch((error) => console.error(error));
                });
            }
        } else {
            if(warningBanner) warningBanner.style.display = "none";
        }
        
       // --- Fetch User Data from Firestore ---
        const docRef = doc(db, "users", user.uid);
        
        getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                
                // 1. Update Names & Greetings
                const firstName = userData.fullName ? userData.fullName.split(" ")[0] : "Volunteer";
                document.getElementById("greeting-name").textContent = firstName;
                document.getElementById("user-name").textContent = userData.fullName || "Not provided";
                document.getElementById("user-email").textContent = userData.email || user.email;
                
                // 2. Format Join Date
                if (userData.joinedAt) {
                    const dateObj = new Date(userData.joinedAt);
                    document.getElementById("join-date").textContent = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
                } else {
                    document.getElementById("join-date").textContent = "Recently";
                }

                // 3. Update Role Badge
                const roleBadge = document.getElementById("user-role");
                roleBadge.textContent = (userData.role || "Student").toUpperCase();

            } else {
                console.warn("No profile document found in Firestore for this user!");
                
                // UI Fallbacks so it doesn't get stuck on "Loading..."
                document.getElementById("greeting-name").textContent = "Volunteer";
                document.getElementById("user-name").textContent = "Profile Missing";
                document.getElementById("user-email").textContent = user.email;
                document.getElementById("join-date").textContent = "Unknown";
                document.getElementById("user-role").textContent = "UNREGISTERED";
            }
        }).catch((error) => {
            console.error("Error fetching Firestore document:", error);
            
            // UI Fallbacks for network/permission errors
            document.getElementById("user-name").textContent = "Error loading data";
            document.getElementById("user-email").textContent = "Error loading data";
            document.getElementById("join-date").textContent = "Error loading data";
            document.getElementById("user-role").textContent = "ERROR";
        });
    } else {
        window.location.href = "login.html"; // Redirect if not logged in
    }
});

// --- Handle Logout ---
const logoutBtn = document.getElementById("logout-btn");
if(logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });
}