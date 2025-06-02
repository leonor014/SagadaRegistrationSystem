// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.appspot.com",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  loadGuidelines();
  loadFAQs();
});

function loadGuidelines() {
  const guidelinesContainer = document.getElementById(
    "guidelines-sections-container"
  );
  const guidelinesQuery = query(
    collection(db, "tourist-guidelines"),
    orderBy("name")
  );

  onSnapshot(
    guidelinesQuery,
    (snapshot) => {
      guidelinesContainer.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const key = `guidelines-${data.name
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        const section = document.createElement("section");
        section.innerHTML = `<h2>${data.name.toUpperCase()}</h2><ul id="${key}-list"></ul>`;
        guidelinesContainer.appendChild(section);

        const list = document.getElementById(`${key}-list`);
        list.innerHTML = data.guidelines
          .map((item, index) => `<li id="${key}-${index}">${item}</li>`)
          .join("");
      });
    },
    (error) => {
      console.error("Failed to load guidelines:", error);
      guidelinesContainer.innerHTML =
        "<p>Error loading guidelines. Please try again later.</p>";
    }
  );
}

function loadFAQs() {
  const faqContainer = document.getElementById("faq-sections-container");
  const faqsCollection = collection(db, "faqs");

  onSnapshot(
    faqsCollection,
    (snapshot) => {
      faqContainer.innerHTML = "";
      const section = document.createElement("section");
      /* section.innerHTML = `<h2>GENERAL</h2><ul id="faq-general-list"></ul>`; */
      section.innerHTML = `<ul id="faq-general-list"></ul>`;
      faqContainer.appendChild(section);

      const list = document.getElementById("faq-general-list");

      snapshot.forEach((doc, index) => {
        const data = doc.data();
        list.innerHTML += `
          <li id="faq-${index}">
            <strong>Q: ${data.question}</strong>
            <p>A: ${data.answer}</p>
          </li>
        `;
      });
    },
    (error) => {
      console.error("Failed to load FAQs:", error);
      faqContainer.innerHTML =
        "<p>Error loading FAQs. Please try again later.</p>";
    }
  );
}
