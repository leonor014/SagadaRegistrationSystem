import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.appspot.com",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("categorySelect");
  const container = document.getElementById("spotsContainer");

  let currentUnsubscribe = null;

  function renderSpots(snapshot) {
    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = `<p>No tourist spots found.</p>`;
      return;
    }

    const spotsByCategory = {};

    snapshot.forEach((doc) => {
      const spot = doc.data();
      console.log("Spot data:", spot); // <-- Add this
      const category = spot.category || "Uncategorized";
      if (!spotsByCategory[category]) {
        spotsByCategory[category] = [];
      }
      spotsByCategory[category].push(spot);
    });

    console.log("Grouped spotsByCategory:", spotsByCategory);

    Object.entries(spotsByCategory).forEach(([category, spots]) => {
      const spotDiv = document.createElement("div");
      spotDiv.classList.add("spot");

      const title = document.createElement("h2");
      title.textContent = category;
      spotDiv.appendChild(title);

      spots.forEach((spot) => {
        const content = document.createElement("div");
        content.classList.add("spot-content");

        content.innerHTML = `
        <img src="${spot.image}" alt="${spot.name}">
        <h2>${spot.name}</h2>
        <p>${spot.description}</p>
        ${
          spot.guideFee
            ? `<p><strong>Guide Fee:</strong> ${spot.guideFee}</p>`
            : ""
        }
        ${
          spot.shuttleFee
            ? `<p><strong>Shuttle Fee:</strong> ${spot.shuttleFee}</p>`
            : ""
        }
      `;

        spotDiv.appendChild(content);
      });

      container.appendChild(spotDiv);
    });
  }

  onSnapshot(collection(db, "categories"), (snapshot) => {
    console.log("Categories snapshot:", snapshot.size);
    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Category doc:", data);
      const name = data.name;
      categorySelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
    categorySelect.innerHTML += `<option value="view-all">View All</option>`;
    filterSpots("view-all");
  });

  function filterSpots(category) {
    const spotsRef = collection(db, "tourist-spots");

    if (typeof currentUnsubscribe === "function") {
      currentUnsubscribe();
    }

    let q;
    if (!category || category === "") {
      q = query(spotsRef, orderBy("name"));
    } else if (category === "view-all") {
      q = query(spotsRef, orderBy("name"));
    } else {
      q = query(spotsRef, where("category", "==", category));
    }

    currentUnsubscribe = onSnapshot(q, (snapshot) => {
      console.log(
        "Tourist spots snapshot:",
        snapshot.size,
        "for category:",
        category
      );
      renderSpots(snapshot);
    });
  }

  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    filterSpots(selectedCategory);
  });
});
