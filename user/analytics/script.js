// script.js - cleaned for Tourist Spot Analytics only

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- Firebase Init (keep your config) ---
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

// --- DOM Elements ---
const siteDropdown = document.getElementById("site-dropdown");
const monthInput = document.getElementById("month-filter");
const applyBtn = document.getElementById("apply-filters");
const filterType = document.getElementById("filter-type");
const top5TilesContainer = document.getElementById("top5-tiles");
const touristChartsArea = document.getElementById("tourist-charts-area");

// --- Data holders ---
let attendance = []; // raw attendance snapshot
let sites = []; // site collection
let charts = {}; // Chart.js instances

// --- Utilities ---
function getDateFromField(doc, fieldName) {
  if (!doc) return null;
  const value = doc[fieldName];
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) return value;
  return null;
}

function getAgeCategory(ageOrDob) {
  if (ageOrDob === null || ageOrDob === undefined || ageOrDob === "") return "Unknown";
  let age = null;
  if (typeof ageOrDob === "number") age = ageOrDob;
  else if (typeof ageOrDob === "string" && !isNaN(ageOrDob)) age = parseInt(ageOrDob);
  else {
    const d = new Date(ageOrDob);
    if (!isNaN(d.getTime())) {
      age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    } else {
      age = null;
    }
  }
  //if (age === null || isNaN(age)) return "Unknown";
  if (age <= 12) return "Children";
  if (age <= 19) return "Teenager";
  if (age <= 39) return "Young Adult";
  if (age <= 59) return "Middle Aged Adult";
  return "Senior";
}

// --- Chart helpers ---
function clearCharts() {
  for (const id in charts) {
    try { charts[id].destroy(); } catch (e) {}
  }
  charts = {};
  touristChartsArea.innerHTML = "";
}

function createChartCanvas(id, title) {
  // create container
  const container = document.createElement("div");
  container.className = "chart-container";
  container.id = id + "-container";

  const titleEl = document.createElement("h3");
  titleEl.innerText = title;
  container.appendChild(titleEl);

  const canvas = document.createElement("canvas");
  canvas.id = id;
  container.appendChild(canvas);

  return { container, canvas };
}

// reuse color helpers (small set)
const creativeColors = {
  vibrant: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3", "#54A0FF"]
};

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return "#" + (0x1000000 + ((R < 255 ? (R < 0 ? 0 : R) : 255) << 16) + ((G < 255 ? (G < 0 ? 0 : G) : 255) << 8) + (B < 255 ? (B < 0 ? 0 : B) : 255)).toString(16).slice(1);
}

// Draw bar chart
function drawBarChart(canvasId, title, labels, data) {
  const { container, canvas } = createChartCanvas(canvasId, title);
  touristChartsArea.appendChild(container);
  const ctx = canvas.getContext("2d");

  const backgroundColor = labels.map((_, i) => creativeColors.vibrant[i % creativeColors.vibrant.length]);
  const borderColor = backgroundColor.map((c) => darkenColor(c, 20));

  charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: title, data, backgroundColor, borderColor, borderWidth: 1, borderRadius: 6 }]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

// Draw pie chart
function drawPieChart(canvasId, title, labels, data) {
  const { container, canvas } = createChartCanvas(canvasId, title);
  touristChartsArea.appendChild(container);
  const ctx = canvas.getContext("2d");

  const colors = labels.map((_, i) => creativeColors.vibrant[i % creativeColors.vibrant.length]);

  charts[canvasId] = new Chart(ctx, {
    type: "pie",
    data: { labels, datasets: [{ label: title, data, backgroundColor: colors, borderColor: colors.map(c => darkenColor(c, 30)), borderWidth: 2 }]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" }, title: { display: false } } }
  });
}

function updateTotalVisits(records) {
  const totalElement = document.getElementById("summary-total");

  // Determine count
  const total = records && records.length ? records.length : 0;

  // Reset immediately to 0 when no data
  if (total === 0) {
    totalElement.textContent = 0;
    return;
  }

  // Optional: smooth count animation
  let current = 0;
  const increment = Math.ceil(total / 30);
  const counter = setInterval(() => {
    current += increment;
    if (current >= total) {
      totalElement.textContent = total;
      clearInterval(counter);
    } else {
      totalElement.textContent = current;
    }
  }, 20);
}




// --- Data expansion (handle groups in attendance) ---
function expandAttendanceDocs(docs) {
  const expanded = [];
  docs.forEach((doc) => {
    const data = doc.data ? doc.data() : doc;
    const site = data.site || "Unknown Site";
    const ts = getDateFromField(data, "timestamp");
    if (data.registrationType === "group" && Array.isArray(data.groupMembers)) {
      data.groupMembers.forEach((m) => {
        expanded.push({
          site,
          timestamp: ts,
          dateOfBirth: m.dateOfBirth || m.memberDOB || null,
          age: m.age !== undefined && m.age !== null ? Number(m.age) : null,
          sex: m.sex || m.memberSex || "Unknown",
        });
      });
    } else {
      expanded.push({
        site,
        timestamp: ts,
        dateOfBirth: data.dateOfBirth || null,
        age: data.age !== undefined && data.age !== null ? Number(data.age) : null,
        sex: data.sex || "Unknown",
      });
    }
  });
  return expanded;
}

// --- UI Rendering ---
// populate site dropdown (predefined + sites from collection)
function populateSiteDropdown() {
  siteDropdown.innerHTML = `<option value="__all">All Tourist Spots</option>`;
  const predefinedSites = [
    "Lumiang Cave",
    "Balangagan Cave",
    "Sumaguing Cave",
    "Bomod-ok Falls",
    "Bokong Falls",
    "Pongas Falls",
    "Ubwa Blue Lagoon",
    "Ticangan to Ubwa River Tracing, Bouldering and Swimming",
    "Ampacao",
    "Nabas-ang to Ampacao",
    "Langsayan",
    "Marlboro",
    "Marlboro to Blue Soil",
    "Blue Soil",
    "Paytokan Walk",
    "Hanging Coffins",
    "Lumiang Cave Entrance",
    "Sumaguing Cave Entrance",
    "Dokiw Hanging Coffins",
    "Kapay-aw Rice Terraces",
  ];

  predefinedSites.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    siteDropdown.appendChild(opt);
  });

  sites.sort((a,b) => (a.name||"").localeCompare(b.name||"")).forEach((s) => {
    if (!predefinedSites.includes(s.name)) {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = s.name;
      siteDropdown.appendChild(opt);
    }
  });
}

// Render top 5 tiles from provided attendance (already filtered by period)
function renderTop5Tiles(filteredAttendance) {
  top5TilesContainer.innerHTML = "";

  const counts = {};
  filteredAttendance.forEach((a) => {
    const s = a.site || "Unknown Site";
    counts[s] = (counts[s] || 0) + 1;
  });

  const top5 = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);

  // if fewer than 5 distinct sites, fill with placeholder names (optional)
  top5.forEach(([siteName, count]) => {
    const tile = document.createElement("div");
    tile.className = "tile";

    tile.innerHTML = `<h4>${siteName}</h4>`;



    tile.addEventListener("click", () => {
      document.querySelectorAll(".tile").forEach(t => t.classList.remove("flipped"));
      tile.classList.add("flipped");
      // render charts for clicked spot using overall filteredAttendance
      renderSpotCharts(siteName, filteredAttendance);
      // set dropdown to this site
      siteDropdown.value = siteName;
    });

    top5TilesContainer.appendChild(tile);
  });

  // If there are no sites in attendance, show a message
  if (top5.length === 0) {
    top5TilesContainer.innerHTML = `<div class="no-data-message">No visits found for selected period.</div>`;
  }
}

// Renders two charts for a site: visits (by day/month) and age distribution
function renderSpotCharts(siteName, filteredAttendance) {
  clearCharts();

  const viewType = filterType.value; // 'month' or 'year'
  const periodValue = monthInput.value || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;

  // filter for selected site
  const siteRecords = filteredAttendance.filter(d => d.site === siteName);
  if (siteRecords.length === 0) {
    touristChartsArea.innerHTML = `<div class="no-data-message">No data for ${siteName} in the selected period.</div>`;
    updateTotalVisits([]); // ✅ Reset total visits to 0
    return;
  }

  // Update total visits quick stat
  updateTotalVisits(siteRecords);

  // Visits over period
  const periodMap = new Map();
  if (viewType === "year") {
    // Prepopulate all 12 months with 0 visits
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i).toLocaleString("default", { month: "short" })
    );
    allMonths.forEach((m) => periodMap.set(m, 0));
  } else {
    // Prepopulate all days in the selected month with 0 visits
    const [year, month] = (monthInput.value || "").split("-").map(Number);
    if (year && month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        periodMap.set(`Day ${d}`, 0);
      }
    }
  }

  // Count visits
  siteRecords.forEach((r) => {
    const dt = r.timestamp instanceof Date
      ? r.timestamp
      : (r.timestamp && r.timestamp.toDate ? r.timestamp.toDate() : getDateFromField(r, "timestamp"));
    if (!dt || isNaN(dt)) return;

    if (viewType === "year") {
      const monthLabel = dt.toLocaleString("default", { month: "short" });
      periodMap.set(monthLabel, (periodMap.get(monthLabel) || 0) + 1);
    } else {
      const dayLabel = `Day ${dt.getDate()}`;
      periodMap.set(dayLabel, (periodMap.get(dayLabel) || 0) + 1);
    }
  });

  const visitLabels = [...periodMap.keys()];
  const visitValues = [...periodMap.values()];

  // Age distribution
  const ageBuckets = { Children:0, Teenager:0, "Young Adult":0, "Middle Aged Adult":0, Senior:0, Unknown:0 };
  siteRecords.forEach(r => {
    const cat = getAgeCategory(r.age ?? r.dateOfBirth);
    ageBuckets[cat] = (ageBuckets[cat] || 0) + 1;
  });

  // Draw charts side by side
  drawBarChart(`visits-${siteName}`, `Visits - ${siteName} (${periodValue})`, visitLabels, visitValues);
  drawBarChart(`age-${siteName}`, `Age Distribution - ${siteName}`, Object.keys(ageBuckets), Object.values(ageBuckets));

  
}

// --- Period filtering ---
function filterByPeriod(docs, periodValue, type) {
  if (!periodValue) return docs;
  return docs.filter((d) => {
    const dt = getDateFromField(d, "timestamp");
    if (!dt) return false;
    if (type === "month") {
      const [y,m] = periodValue.split("-");
      return dt.getFullYear() === +y && dt.getMonth() === +m - 1;
    } else if (type === "year") {
      const year = periodValue.includes("-") ? periodValue.split("-")[0] : periodValue;
      return dt.getFullYear() === +year;
    }
    return true;
  });
}

// --- Main render orchestration ---
function recomputeAndRender() {
  // ensure monthInput has a value
  let value = monthInput.value;
  const type = filterType.value;
  if (!value) {
    const now = new Date();
    value = type === "year" ? String(now.getFullYear()) : `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    monthInput.value = value;
  }
  // normalize year input
  if (type === "year" && value.includes("-")) value = value.split("-")[0];

  // expand groups in attendance
  const expanded = expandAttendanceDocs(attendance);
  const filtered = filterByPeriod(expanded, value, type);

  // populate top5 based on filtered
  renderTop5Tiles(filtered);

  // if dropdown selected a site (not __all), render charts for it; otherwise auto-render first top5 if exists
  const selectedSite = siteDropdown.value || "__all";
  if (selectedSite === "__all") {
    updateTotalVisits(filtered); // total across all sites
    clearCharts();
    touristChartsArea.innerHTML = `<div class="no-data-message">Select a tourist spot to view detailed charts.</div>`;
  } else {
    renderSpotCharts(selectedSite, filtered);
  }

}

// --- Firestore listeners ---
onSnapshot(query(collection(db, "site"), orderBy("name", "asc")), (snap) => {
  sites = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  populateSiteDropdown();
});

// Attendance listener - keep latest attendance and re-render on change
onSnapshot(query(collection(db, "attendance"), orderBy("timestamp", "desc")), (snap) => {
  attendance = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  recomputeAndRender();
});

// --- UI events ---
applyBtn.addEventListener("click", recomputeAndRender);

siteDropdown.addEventListener("change", () => {
  recomputeAndRender();
});

filterType.addEventListener("change", () => {
  document.getElementById("date-filter-label").textContent = filterType.value === "month" ? "Month" : "Year";
  monthInput.type = filterType.value === "month" ? "month" : "number";
  if (filterType.value === "year") {
    monthInput.min = "2020";
    monthInput.max = "2030";
    monthInput.value = new Date().getFullYear();
  }
  recomputeAndRender();
});
