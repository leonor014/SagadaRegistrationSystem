// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  onSnapshot,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.firebaseapp.com",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load FAQs from Firestore
document.addEventListener("DOMContentLoaded", () => {
  const faqContainer = document.querySelector(".faq-container");
  faqContainer.innerHTML = "<h1>Frequently Asked Questions</h1>";

  const faqsCollection = collection(db, "faqs");

  onSnapshot(
    faqsCollection,
    (snapshot) => {
      // Clear previous content (but keep the heading)
      faqContainer.innerHTML = "<h1>Frequently Asked Questions</h1>";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const faqDiv = document.createElement("div");
        faqDiv.className = "faq-question";
        faqDiv.innerHTML = `
        <strong>Q: ${data.question}</strong>
        <p class="faq-answer">A: ${data.answer}</p>
      `;
        faqContainer.appendChild(faqDiv);
      });
    },
    (error) => {
      console.error("Error fetching real-time FAQs:", error);
      faqContainer.innerHTML += `<p>Error loading FAQs. Please try again later.</p>`;
    }
  );
});
