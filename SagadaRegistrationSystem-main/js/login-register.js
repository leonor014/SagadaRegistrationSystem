import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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
const auth = getAuth(app);
const userValidated = localStorage.getItem("userValidated") === "true";


onAuthStateChanged(auth, (user) => {
  if (user && userValidated) {
    window.location.href = "./admin/dashboard/";
  } else {
    document.getElementById("container").style.visibility = "visible";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;
    const regCode = document.getElementById("signupRegCode").value.trim();

    if (!name || !email || !password || !confirmPassword || !regCode) {
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
      // Validate registration code
      const regCodeQuery = query(
        collection(db, "registration-code"),
        where("regCode", "==", regCode)
      );
      const regCodeSnapshot = await getDocs(regCodeQuery);

      if (regCodeSnapshot.empty) {
        return Swal.fire({
          icon: "error",
          title: "Invalid Registration Code",
          text: "The provided registration code is not valid.",
        });
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "admins", user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      });

      await Swal.fire({
        icon: "success",
        title: "Registration Successful",
      });

      signupForm.reset();
      document
        .getElementById("container")
        .classList.remove("right-panel-active");
    } catch (error) {
      console.error("Error saving admin:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  });

  // Handle Sign-In
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
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome!",
      }).then(() => {
        localStorage.setItem("userValidated", "true");
        signinForm.reset();
        window.location.href = "./admin/dashboard/";
      });
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Invalid Login",
        text: "Incorrect email or password.",
      });
    }
  });
});
