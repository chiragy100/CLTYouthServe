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

// We need a copy of the database here to cross-reference the saved IDs.
const opportunitiesData = [
    { id: 1, name: "Matthews Help Center", city: "Matthews, NC", commitment: "Weekly / Recurring" },
    { id: 2, name: "Indian Trail Parks & Rec", city: "Indian Trail, NC", commitment: "One-Time Event" },
    { id: 3, name: "Hope for Harvest", city: "Charlotte, NC", commitment: "Recurring" },
    { id: 4, name: "Union County Animal Services", city: "Monroe, NC", commitment: "Recurring" },
    { id: 5, name: "Senior Nutrition Program", city: "Monroe, NC", commitment: "Recurring" },
    { id: 6, name: "Union County Library", city: "Monroe, NC", commitment: "One-Time / Flexible" },
    { id: 7, name: "Teal Diva", city: "Matthews, NC", commitment: "Flexible / Projects" },
    { id: 8, name: "Greater Matthews Habitat for Humanity", city: "Matthews, NC", commitment: "Recurring" },
    { id: 9, name: "Common Heart", city: "Indian Trail, NC", commitment: "Recurring" },
    { id: 10, name: "Bright Blessings", city: "Matthews, NC", commitment: "Recurring" },
    { id: 11, name: "Heart For Monroe", city: "Monroe, NC", commitment: "Recurring / Flexible" },
    { id: 12, name: "Community Shelter of Union County", city: "Monroe, NC", commitment: "Recurring / Shifts" },
    { id: 13, name: "Humane Society of Union County", city: "Monroe, NC", commitment: "Flexible / Projects" },
    { id: 14, name: "Second Harvest Food Bank of Metrolina", city: "Charlotte, NC", commitment: "Recurring / Shifts" },
    { id: 15, name: "Habitat for Humanity of the Charlotte Region", city: "Charlotte, NC", commitment: "Recurring / Shifts" }
];

async function updateVerificationState(user) {
    await user.reload();
    const isVerified = user.emailVerified;
    const warningBanner = document.getElementById("verify-warning");
    if (warningBanner) warningBanner.style.display = isVerified ? "none" : "block";
    const actionLinks = document.querySelectorAll('a[href="opportunities.html"]');
    actionLinks.forEach((link) => {
        link.classList.toggle("verification-required", !isVerified);
        link.setAttribute("aria-label", isVerified ? "Find an opportunity" : "Verify your email to unlock opportunities");
    });
    return isVerified;
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await updateVerificationState(user);
        // --- Handle Email Verification Warning ---
        const warningBanner = document.getElementById("verify-warning");
        if (!user.emailVerified) {
            if(warningBanner) warningBanner.style.display = "block";
            const resendBtn = document.getElementById("resend-btn");
            if(resendBtn) {
                resendBtn.addEventListener("click", () => {
                    resendBtn.textContent = "Sending...";
                    resendBtn.style.opacity = "0.7";
                    resendBtn.disabled = true;

                    sendEmailVerification(user)
                    .then(() => {
                        const status = document.getElementById("verify-status");
                        if (status) status.textContent = "Link sent! Please check your inbox and spam folder.";
                        warningBanner.style.backgroundColor = "rgba(46, 204, 113, 0.1)"; 
                        warningBanner.style.color = "#27ae60"; 
                        warningBanner.style.borderColor = "#2ecc71";
                    })
                    .catch((error) => {
                        console.error("Error sending email:", error);
                        resendBtn.textContent = "Error. Try Again";
                        resendBtn.style.opacity = "1";
                        resendBtn.disabled = false;
                    });
                });
            }
        } else {
            if(warningBanner) warningBanner.style.display = "none";
        }

        const refreshBtn = document.getElementById("refresh-verification-btn");
        if (refreshBtn) refreshBtn.addEventListener("click", async () => {
            refreshBtn.disabled = true;
            await updateVerificationState(auth.currentUser);
            refreshBtn.disabled = false;
            if (auth.currentUser.emailVerified) window.location.reload();
        });
        
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

                // 4. RENDER STARRED OPPORTUNITIES
                const starredIds = userData.starredOpportunities || [];
                const starredCard = document.querySelector(".starred-card");
                
                if (starredIds.length > 0 && starredCard) {
                    // Match the IDs against our database
                    const savedItems = opportunitiesData.filter(opp => starredIds.includes(opp.id));
                    
                    // Build the HTML list
                    let listHTML = `<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">`;
                    savedItems.forEach(item => {
                        listHTML += `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
                                <div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; color: #1e293b;">${item.name}</h4>
                                    <p style="margin: 0; font-size: 0.75rem; color: #64748b;">📍 ${item.city} &nbsp;|&nbsp; 📅 ${item.commitment}</p>
                                </div>
                                <a href="opportunities.html" class="btn-card" style="padding: 6px 12px; font-size: 0.75rem; border: 1px solid var(--forest); color: var(--forest); text-decoration: none; border-radius: 6px; background: transparent;">View</a>
                            </div>
                        `;
                    });
                    listHTML += `</div>`;
                    
                    // Replace the empty state with the list
                    starredCard.innerHTML = `<h3>Starred Opportunities</h3>${listHTML}`;
                }

            } else {
                console.warn("No profile document found in Firestore for this user!");
                document.getElementById("greeting-name").textContent = "Volunteer";
                document.getElementById("user-name").textContent = "Profile Missing";
                document.getElementById("user-email").textContent = user.email;
                document.getElementById("join-date").textContent = "Unknown";
                document.getElementById("user-role").textContent = "UNREGISTERED";
            }
        }).catch((error) => {
            console.error("Error fetching Firestore document:", error);
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