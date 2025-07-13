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
const categoryWrappers = {};

const q = query(collection(db, "analytics"), orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
  // Clear existing UI and state
  container.innerHTML = "";
  Object.keys(chartInstances).forEach((id) => chartInstances[id].destroy());
  Object.keys(chartInstances).length = 0;
  Object.keys(categoryWrappers).length = 0;

  const categorized = {};

  // Group by category
  snapshot.forEach((doc) => {
    const id = doc.id;
    const {
      title,
      type,
      data,
      description,
      category = "Uncategorized",
    } = doc.data();
    if (!title || !type || !Array.isArray(data)) return;

    if (!categorized[category]) categorized[category] = [];
    categorized[category].push({ id, title, type, data, description });
  });

  // Create UI per category
  Object.entries(categorized).forEach(([categoryName, analyticsList]) => {
    // Create category toggle section
    const categoryWrapper = document.createElement("div");
    categoryWrapper.className = "category-wrapper";

    const header = document.createElement("h2");
    header.className = "category-header";
    header.innerHTML = `<span>${categoryName}</span> <i class="uil uil-angle-down toggle-icon"></i>`;
    header.style.cursor = "pointer";

    const content = document.createElement("div");
    content.className = "category-content";
    content.style.display = "none";

    // Toggle behavior
    header.addEventListener("click", () => {
      const isVisible = content.style.display === "block";
      content.style.display = isVisible ? "none" : "block";
    });

    // For each analytic in category, build chart
    analyticsList.forEach(({ id, title, type, data, description }) => {
      const sortedData = data.slice().sort((a, b) => a.order - b.order);
      const labels = sortedData.map((item) => item.key);
      const values = sortedData.map((item) => item.value);

      const chartWrapper = document.createElement("div");
      chartWrapper.id = `chart-wrapper-${id}`;
      chartWrapper.className = "chart-wrapper";

      const chartTitle = document.createElement("h3");
      chartTitle.textContent = title;

      const desc = document.createElement("p");
      desc.textContent = description || "";
      desc.className = "chart-description";

      const canvas = document.createElement("canvas");
      canvas.id = `chart-${id}`;

      chartWrapper.appendChild(chartTitle);
      chartWrapper.appendChild(desc);
      chartWrapper.appendChild(canvas);
      content.appendChild(chartWrapper);

      // Create chart
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, {
        type,
        data: {
          labels,
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

    // Add header and content to wrapper
    categoryWrapper.appendChild(header);
    categoryWrapper.appendChild(content);
    container.appendChild(categoryWrapper);
  });
});
