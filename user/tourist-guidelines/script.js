// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.appspot.com",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const sectionsContainer = document.getElementById("sections-container");

  // Query guidelines collection ordered by name
  const guidelinesQuery = query(
    collection(db, "tourist-guidelines"),
    orderBy("name")
  );

  onSnapshot(
    guidelinesQuery,
    (snapshot) => {
      Array.from(sectionsContainer.children).forEach((child) => {
        if (child.tagName.toLowerCase() !== "h1") {
          sectionsContainer.removeChild(child);
        }
      });

      snapshot.forEach((doc) => {
        const guidelineData = doc.data();
        const sectionDiv = document.createElement("section");

        sectionDiv.innerHTML = `
          <h2>${guidelineData.name}</h2>
          <ul>
            ${guidelineData.guidelines
              .map((item) => `<li>${item}</li>`)
              .join("")}
          </ul>
        `;

        sectionsContainer.appendChild(sectionDiv);
      });
    },
    (error) => {
      console.error("Error loading guidelines:", error);
      sectionsContainer.innerHTML += `<p>Error loading guidelines. Please try again later.</p>`;
    }
  );
});
