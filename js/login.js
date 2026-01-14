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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
    loginBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Stop page reload

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Basic validation
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        // Firebase Sign In
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in successfully
                const user = userCredential.user;
                console.log("Logged in:", user.email);
                
                // Redirect to dashboard
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Login Error:", errorCode);

                // Specific Error Handling
                if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                    alert("Incorrect email or password. Please try again.");
                } else if (errorCode === 'auth/too-many-requests') {
                    alert("Too many failed attempts. Please wait a moment before trying again.");
                } else {
                    alert("Error: " + errorMessage);
                }
            });
    });
}