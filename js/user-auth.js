import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.firebasestorage.app",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔑 Helper: hash password
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 🔑 Helper: get next userId
async function getNextUserId() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("userId", "desc"), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return 1; // first user
  } else {
    const lastUser = snapshot.docs[0].data();
    return (lastUser.userId || 0) + 1;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const userValidated = localStorage.getItem("userValidated") === "true";

  if (!userValidated) {
    document.getElementById("body").style.visibility = "visible";
  } else {
    window.location.href = "/SagadaRegistrationSystem/index.html";
  }

  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");

  // 🔹 SIGNUP
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;

    if (!name || !email || !password || !confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill in all the required fields.",
      });
    }

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match.",
      });
    }

    try {
      // check if user already exists
      const existingUser = await getDoc(doc(db, "users", email));
      if (existingUser.exists()) {
        return Swal.fire({
          icon: "error",
          title: "Already Registered",
          text: "This email is already in use. Please log in.",
        });
      }

      // hash password
      const hashedPassword = await hashPassword(password);

      // get new userId
      const userId = await getNextUserId();

      // save in Firestore
      await setDoc(doc(db, "users", email), {
        userId,
        name,
        email,
        password: hashedPassword,
        createdAt: serverTimestamp(),
      });

      await Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: `Your account has been created.`,
      });

      signupForm.reset();
    } catch (error) {
      console.error("Error saving user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  });

  // 🔹 SIGNIN
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signinEmail").value.trim();
    const password = document.getElementById("signinPassword").value;

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Missing Credentials",
        text: "Please enter both email and password.",
      });
      return;
    }

    try {
      // check Firestore for user
      const userDoc = await getDoc(doc(db, "users", email));
      if (!userDoc.exists()) {
        return Swal.fire({
          icon: "error",
          title: "Invalid Login",
          text: "User not found.",
        });
      }

      const user = userDoc.data();

      // verify password
      const hashedPassword = await hashPassword(password);
      if (user.password !== hashedPassword) {
        return Swal.fire({
          icon: "error",
          title: "Invalid Login",
          text: "Incorrect password.",
        });
      }

      // success
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome!",
      }).then(() => {
        localStorage.setItem("userValidated", "true");
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("userEmail", user.email);
        signinForm.reset();
        window.location.href = "/SagadaRegistrationSystem/user/profile/index.html";
      });
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Invalid Login",
        text: "Something went wrong.",
      });
    }
  });
});
