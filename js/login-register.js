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
  fetchSignInMethodsForEmail,
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
const adminValidated = localStorage.getItem("adminValidated") === "true";

onAuthStateChanged(auth, (user) => {
  if (user && adminValidated) {
    window.location.href = "./dashboard/";
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

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Full Name",
        text: "Please enter your full name (at least first and last name).",
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
      // Check if email is already in use
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        return Swal.fire({
          icon: "error",
          title: "Email Already Registered",
          text: "This email is already in use. Please log in instead.",
        });
      }

      // Validate registration code in both collections
      const regCodeQuery = query(
        collection(db, "registration-code"),
        where("regCode", "==", regCode)
      );
      const regCodeSnapshot = await getDocs(regCodeQuery);

      const superAdminCodeQuery = query(
        collection(db, "superadmin-code"),
        where("regCode", "==", regCode)
      );
      const superAdminCodeSnapshot = await getDocs(superAdminCodeQuery);

      let userCredential;
      let user;

      // Check if regCode exists in "registration-code"
      if (!regCodeSnapshot.empty) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = userCredential.user;

        await setDoc(doc(db, "admins", user.uid), {
          uid: user.uid,
          name,
          email,
          role: "Admin", // optional, for clarity
          createdAt: serverTimestamp(),
        });

        await Swal.fire({
          icon: "success",
          title: "Admin Registration Successful",
        });
      }

      // Check if regCode exists in "superadmin-code"
      else if (!superAdminCodeSnapshot.empty) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = userCredential.user;

        await setDoc(doc(db, "admins", user.uid), {
          uid: user.uid,
          name,
          email,
          role: "Super Admin",
          createdAt: serverTimestamp(),
        });

        await Swal.fire({
          icon: "success",
          title: "Super Admin Registration Successful",
        });
      }

      // If not found in either collection
      else {
        return Swal.fire({
          icon: "error",
          title: "Invalid Registration Code",
          text: "The provided registration code is not valid.",
        });
      }

      signupForm.reset();
      document
        .getElementById("container")
        .classList.remove("right-panel-active");
    } catch (error) {
      console.error("Error saving admin:", error);
      if (error.code === "auth/email-already-in-use") {
        Swal.fire({
          icon: "error",
          title: "Email Already Registered",
          text: "This email is already in use. Please log in instead.",
        });
      } else if (error.code === "auth/invalid-email") {
        Swal.fire({
          icon: "error",
          title: "Invalid Email Format",
          text: "Please enter a valid email address.",
        });
      } else if (error.code === "auth/weak-password") {
        Swal.fire({
          icon: "error",
          title: "Weak Password",
          text: "Password should be at least 6 characters long.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
        });
      }
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
        title: "Sign In Successful",
        text: "Welcome!",
      }).then(() => {
        localStorage.setItem("adminValidated", "true");
        signinForm.reset();
        window.location.href = "./dashboard/";
      });
    } catch (error) {
      console.error("Sign In error:", error);
      Swal.fire({
        icon: "error",
        title: "Invalid Sign In",
        text: "Incorrect email or password.",
      });
    }
  });
});
