import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// Utility: Capitalize string
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Sort months if needed
const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Color helper
function getColorPalette(n) {
  const palette = [
    "#1e90ff",
    "#ff6384",
    "#36a2eb",
    "#cc65fe",
    "#ffce56",
    "#32CD32",
    "#98FB98",
    "#006400",
    "#00FF00",
    "#228B22",
    "#ff4f58",
    "#ff7f6d",
    "#ffb3b3",
    "#ff99cc",
    "#ff6384",
  ];
  return palette.slice(0, n);
}

const container = document.getElementById("analytics-dynamic-section");
const chartInstances = {};

const q = query(collection(db, "analytics"), orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const doc = change.doc;
    const id = doc.id;
    const { title, type, data, description } = doc.data();

    if (!title || !type || !data) return;

    const labels = Object.keys(data);
    const isMonthly = monthOrder.includes(labels[0]);
    const sortedLabels = isMonthly ? monthOrder : labels;
    const values = sortedLabels.map((k) => data[k] ?? 0);

    // Remove existing chart if present
    let wrapper = document.getElementById(`chart-wrapper-${id}`);
    if (wrapper && chartInstances[id]) {
      chartInstances[id].destroy();
    }

    if (!wrapper) {
      // Create wrapper
      wrapper = document.createElement("div");
      wrapper.id = `chart-wrapper-${id}`;
      wrapper.className = "chart-wrapper";

      // Create header (toggle)
      const header = document.createElement("h3");
      header.innerHTML = `<span>${title}</span> <i class="uil uil-angle-down toggle-icon"></i>`;
      header.className = "accordion-header";
      header.style.cursor = "pointer";

      // Description (optional)
      const desc = document.createElement("p");
      desc.textContent = description || "";
      desc.className = "chart-description";

      // Canvas container for accordion
      const canvasContainer = document.createElement("div");
      canvasContainer.id = `chart-container-${id}`;
      canvasContainer.className = "chart-container";
      canvasContainer.style.display = "none";

      const canvas = document.createElement("canvas");
      canvas.id = `chart-${id}`;
      canvasContainer.appendChild(desc);
      canvasContainer.appendChild(canvas);

      wrapper.appendChild(header);
      wrapper.appendChild(canvasContainer);
      container.appendChild(wrapper);

      // Accordion toggle
      header.addEventListener("click", () => {
        const isVisible = canvasContainer.style.display === "block";
        canvasContainer.style.display = isVisible ? "none" : "block";

        const icon = header.querySelector(".toggle-icon");
        icon.className = isVisible
          ? "uil uil-angle-down toggle-icon"
          : "uil uil-angle-up toggle-icon";
      });
    }

    const ctx = document.getElementById(`chart-${id}`).getContext("2d");
    const chart = new Chart(ctx, {
      type,
      data: {
        labels: sortedLabels,
        datasets: [
          {
            data: values,
            backgroundColor:
              type === "pie" || type === "bar"
                ? getColorPalette(labels.length)
                : "rgba(30, 144, 255, 0.2)",
            borderColor: type === "line" ? "#1e90ff" : undefined,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    chartInstances[id] = chart;
  });
});
