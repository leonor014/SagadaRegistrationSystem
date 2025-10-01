import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js"; 

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- Firebase Init ---
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.firebasestorage.app",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login-register.html";
  } else {
    document.getElementById("container").style.visibility = "visible";
    try {
      const docRef = doc(db, "admins", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const displayName = userData.name || "Name";
        const nameElement = document.getElementById("userNameDisplay");
        const userAvatar = document.getElementById("userAvatar");
        if (nameElement) {
          nameElement.textContent = displayName;
        }
        if (userAvatar) {
          userAvatar.src = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
            displayName
          )}`;
        }
        subscribeToDocumentCounts();
      } else {
        console.log("User document not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
});

// --- DOM Elements ---
const siteDropdown = document.getElementById("site-dropdown");
const monthInput = document.getElementById("month-filter");
const applyBtn = document.getElementById("apply-filters");
const kpiSection = document.getElementById("kpi-section");
const chartsArea = document.getElementById("charts-area");
const reportType = document.getElementById("report-type");
const analyticsTitle = document.getElementById("analytics-title");
const dateFilterLabel = document.getElementById("date-filter-label");
const filterType = document.getElementById("filter-type");
const siteSelectorContainer = document.getElementById("site-selector-container");

// --- Data holders ---
let registrations = [];
let attendance = [];
let sites = [];
let charts = {};
let currentReportType = "general";

// --- Helpers ---
function getDateFromField(doc, field) {
  if (!doc || !field) return null;
  
  const value = doc[field];
  if (!value) return null;
  
  // If it's a Firestore Timestamp
  if (typeof value.toDate === "function") return value.toDate();
  
  // If it's a string that can be parsed as date
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's already a Date object
  if (value instanceof Date) return value;
  
  return null;
}

function getAgeCategory(ageOrDob) {
  if (ageOrDob === null || ageOrDob === undefined || ageOrDob === "") {
    return "Unknown";
  }
  
  try {
    let age;
    
    // If it's a number (age field), use it directly
    if (typeof ageOrDob === 'number') {
      age = ageOrDob;
    } 
    // If it's a string that can be parsed as a number
    else if (typeof ageOrDob === 'string' && !isNaN(ageOrDob)) {
      age = parseInt(ageOrDob);
    }
    // If it's a date string, calculate age from date of birth
    else if (typeof ageOrDob === 'string' || ageOrDob instanceof Date) {
      const birthDate = new Date(ageOrDob);
      if (isNaN(birthDate.getTime())) return "Unknown";
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    // If it's already an age value in some other format
    else {
      age = Number(ageOrDob);
      if (isNaN(age)) return "Unknown";
    }
    
    // Updated age categories based on your requirements
    if (age <= 12) return "Children";
    if (age <= 19) return "Teenager";
    if (age <= 39) return "Young Adult";
    if (age <= 59) return "Middle Aged Adult";
    return "Senior";
  } catch (e) {
    console.error("Error calculating age category:", e);
    return "Unknown";
  }
}


// Add this function for debugging
function logDataStructure(docs, sampleSize = 2) {
  console.log("=== DATA STRUCTURE ANALYSIS ===");
  console.log(`Total documents: ${docs.length}`);
  
  // Log sample documents
  for (let i = 0; i < Math.min(sampleSize, docs.length); i++) {
    console.log(`Document ${i}:`, docs[i]);
    
    if (docs[i].registrationType === "group" && Array.isArray(docs[i].groupMembers)) {
      console.log(`Group members in document ${i}:`, docs[i].groupMembers);
    }
  }
  console.log("=== END ANALYSIS ===");
}

// Add this function to handle report type switching
function switchReportType() {
  currentReportType = reportType.value;
  
  // Hide all report sections first
  document.querySelectorAll('.report-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show the active report section
  const activeSection = document.getElementById(`${currentReportType}-analytics`);
  if (activeSection) {
    activeSection.style.display = 'block';
  }
  
  // Update analytics title
  analyticsTitle.textContent = currentReportType === "general" ? "General Analytics" : "Tourist Spot Analytics";
  siteSelectorContainer.style.display = currentReportType === "general" ? "none" : "flex";
  
  recomputeAndRender();
}

// Update the attendance listener to include debugging
onSnapshot(query(collection(db,"attendance"),orderBy("timestamp","desc")),snap=>{
  attendance=snap.docs.map(d=>({id:d.id,...d.data()}));
  console.log("Raw attendance data:", attendance);
  logDataStructure(attendance); // Debug the structure
  recomputeAndRender();
});

// --- Expand Docs ---
function expandRegistrationDocs(docs) {
  const expanded = [];
  docs.forEach(doc => {
    const data = doc.data ? doc.data() : doc;
    const baseDate = data.dateOfRegistration || new Date();
    const groupCountry = data.country || data.groupCountry || "Unknown";
    const groupRegion = data.region || data.groupRegion || "Unknown";
    
    if (data.registrationType === "group" && Array.isArray(data.groupMembers)) {
      data.groupMembers.forEach(m => {
        expanded.push({
          site: "All Sites",
          nationality: m.nationality || m.memberNationality || groupCountry || "Unknown",
          region: m.region || m.memberRegion || groupRegion || "Unknown",
          sex: m.sex || m.memberSex || "Unknown",
          dateOfBirth: m.age || m.dateOfBirth || m.memberDOB || null,
          dateOfRegistration: baseDate
        });
      });
    } else {
      expanded.push({
        site: "All Sites",
        nationality: data.nationality || data.country || "Unknown",
        region: data.region || "Unknown",
        sex: data.sex || "Unknown",
        dateOfBirth: data.dateOfBirth || null,
        dateOfRegistration: baseDate
      });
    }
  });
  return expanded;
}

function expandAttendanceDocs(docs) {
  const expanded = [];
  console.log("=== EXPANDING ATTENDANCE DOCS ===");
  
  docs.forEach((doc, index) => {
    const data = doc.data ? doc.data() : doc;
    const site = data.site || "Unknown Site";
    const ts = getDateFromField(data, "timestamp");
    const groupCountry = data.country || data.groupCountry || "Unknown";
    const groupRegion = data.region || data.groupRegion || "Unknown";

    if (data.registrationType === "group" && Array.isArray(data.groupMembers)) {
      console.log(`Found group with ${data.groupMembers.length} members`);
      
      data.groupMembers.forEach((m, memberIndex) => {
        expanded.push({
          site: site,
          timestamp: ts,
          nationality: m.nationality || m.memberNationality || groupCountry || "Unknown",
          region: m.region || m.memberRegion || groupRegion || "Unknown",
          sex: m.sex || m.memberSex || "Unknown",
          // store consistently as dateOfBirth so age works
          dateOfBirth: m.dateOfBirth || m.memberDOB || null,
          age: m.age !== undefined && m.age !== null ? Number(m.age) : null
        });
      });
    } else {
      expanded.push({
        site: site,
        timestamp: ts,
        nationality: data.nationality || data.country || "Unknown",
        region: data.region || "Unknown",
        sex: data.sex || "Unknown",
        dateOfBirth: data.dateOfBirth || null,
        age: data.age !== undefined && data.age !== null ? Number(data.age) : null
      });
    }
  });

  console.log("=== EXPANDED DATA ===", expanded);
  return expanded;
}



// --- Enhanced Filter Function ---
function filterByPeriod(docs, value, type, field) {
  if (!value) return docs;
  
  return docs.filter(doc => {
    const dt = getDateFromField(doc, field);
    if (!dt) return false;
    
    if (type === "month") {
      const [y, m] = value.split("-");
      return dt.getFullYear() === +y && dt.getMonth() === +m - 1;
    }
    
    if (type === "year") {
      return dt.getFullYear() === +value;
    }
    
    return true;
  });
}

// --- Populate Site Dropdown ---
function populateSiteDropdown() {
  siteDropdown.innerHTML = `<option value="__all">All Sites</option>`;
  
  // Predefined sites list
  const predefinedSites = [
    "Lumiang Cave", "Balangagan Cave", "Sumaguing Cave", "Bomod-ok Falls", 
    "Bokong Falls", "Pongas Falls", "Ubwa Blue Lagoon", 
    "Ticangan to Ubwa River Tracing, Bouldering and Swimming", "Ampacao", 
    "Nabas-ang to Ampacao", "Langsayan", "Marlboro", "Marlboro to Blue Soil", 
    "Blue Soil", "Paytokan Walk", "Hanging Coffins", "Lumiang Cave Entrance", 
    "Sumaguing Cave Entrance", "Dokiw Hanging Coffins", "Kapay-aw Rice Terraces"
  ];
  
  // Add predefined sites
  predefinedSites.forEach(site => {
    const opt = document.createElement("option");
    opt.value = site;
    opt.textContent = site;
    siteDropdown.appendChild(opt);
  });
  
  // Add sites from Firestore (if any)
  sites.sort((a, b) => a.name.localeCompare(b.name)).forEach(site => {
    // Avoid duplicates
    if (!predefinedSites.includes(site.name)) {
      const opt = document.createElement("option");
      opt.value = site.name;
      opt.textContent = site.name;
      siteDropdown.appendChild(opt);
    }
  });
}

// --- KPI Cards ---
function renderKPIs(docs, site = "__all") {
  // Determine which KPI section to use based on current report type
  const kpiSectionId = currentReportType === "general" ? "kpi-section" : "kpi-section-tourist";
  const kpiSectionElement = document.getElementById(kpiSectionId);
  
  if (!kpiSectionElement) {
    console.error(`Missing #${kpiSectionId} in HTML`);
    return;
  }

  let data = site === "__all" ? docs : docs.filter(d => d.site === site);
  const total = data.length;
  
  if (total === 0) {
    kpiSectionElement.innerHTML = `
      <div class="kpi-card"><h2>0</h2><p>Total visits</p></div>
      <div class="kpi-card"><h2>No data</h2><p>Gender counts</p></div>
      <div class="kpi-card"><h2>No data</h2><p>Top Non-Filipino</p></div>
      <div class="kpi-card"><h2>No data</h2><p>Top Regions</p></div>
    `;
    return;
  }

  const genderMap = new Map();
  const natMap = new Map();
  const regionMap = new Map();

  data.forEach(d => {
    const gender = d.sex && d.sex !== "Unknown" ? d.sex : "Unknown";
    genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
    
    const nat = (d.nationality || "Unknown").toLowerCase();
    if (!["philippines", "filipino", "ph"].includes(nat)) {
      natMap.set(d.nationality, (natMap.get(d.nationality) || 0) + 1);
    }
    
    const region = d.region && d.region !== "Unknown" ? d.region : "Unknown";
    regionMap.set(region, (regionMap.get(region) || 0) + 1);
  });

  const topN = (map, n = 5) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  
  kpiSectionElement.innerHTML = `
    <div class="kpi-card"><h2>${total}</h2><p>Total visits</p></div>
    <div class="kpi-card"><h2>${[...genderMap].map(([g, v]) => `${g}: ${v}`).join(", ") || "No data"}</h2><p>Gender counts</p></div>
    <div class="kpi-card"><h2>${topN(natMap).map(x => x[0]).join(", ") || "No data"}</h2><p>Top Non-Filipino</p></div>
    <div class="kpi-card"><h2>${topN(regionMap).map(x => x[0]).join(", ") || "No data"}</h2><p>Top Regions</p></div>
  `;
}

// --- Clear charts before rendering new ones ---
function clearCharts() {
  for (let chartId in charts) {
    if (charts[chartId]) charts[chartId].destroy();
  }
  charts = {};
}

// --- Create chart container if not present ---
function createChartCanvas(canvasId, title) {
  // Determine which charts area to use based on current report type
  const chartsAreaId = currentReportType === "general" ? "general-charts-area" : "tourist-charts-area";
  const chartsArea = document.getElementById(chartsAreaId);
  
  if (!chartsArea) {
    console.error(`Missing #${chartsAreaId} in HTML`);
    return null;
  }

  let container = document.getElementById(canvasId + "-container");
  if (!container) {
    container = document.createElement("div");
    container.id = canvasId + "-container";
    container.classList.add("chart-container");

    const titleEl = document.createElement("h3");
    titleEl.innerText = title;
    container.appendChild(titleEl);

    const canvas = document.createElement("canvas");
    canvas.id = canvasId;
    container.appendChild(canvas);

    chartsArea.appendChild(container);
  }

  return document.getElementById(canvasId);
}

// Enhanced Creative color schemes
const creativeColors = {
  primary: ['#2e7d32', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9'],
  vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#FF6B9D', '#A3DE83'],
  earth: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3', '#D2B48C', '#BC8F8F', '#D2691E'],
  ocean: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#1E40AF', '#3730A3'],
  pastel: ['#FFD1DC', '#C4F0FF', '#D1FFBD', '#FFE4B5', '#E6CCFF', '#B5F4FF', '#FFCCCC', '#CCFFCC'],
  jewel: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#FF6B9D', '#A3DE83']
};

// --- Enhanced Bar Chart Function (Always Different Colors) ---
function drawBarChart(canvasId, title, labels, data, useDifferentColors = true, customColors = []) {
  const ctx = createChartCanvas(canvasId, title)?.getContext("2d");
  if (!ctx) return;

  let backgroundColor;
  let borderColor;
  
  if (customColors.length > 0) {
    backgroundColor = customColors;
    borderColor = customColors.map(color => darkenColor(color, 20));
  } else if (useDifferentColors) {
    // Use creative color scheme - assign different colors to each bar
    const colorScheme = creativeColors.vibrant;
    backgroundColor = labels.map((_, i) => colorScheme[i % colorScheme.length]);
    borderColor = backgroundColor.map(color => darkenColor(color, 20));
  } else {
    // Single gradient color for all bars (fallback)
    const gradientColor = createGradient(ctx, '#2e7d32', '#4caf50');
    backgroundColor = gradientColor;
    borderColor = darkenColor('#2e7d32', 20);
  }

  charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: false, // Hide legend for bar charts since each bar is different
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: "'Arial', sans-serif"
            }
          }
        },
        title: { 
          display: true, 
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 12
          },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: { 
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

// --- Enhanced Pie Chart Function (Different Colors for Each Slice) ---
function drawPieChart(canvasId, title, labels, data, customColors = []) {
  const ctx = createChartCanvas(canvasId, title, 'pie')?.getContext("2d");
  if (!ctx) return;

  // Use custom colors if provided, otherwise generate different colors for each slice
  let colors;
  if (customColors.length > 0) {
    colors = customColors;
  } else {
    // Use different colors from the vibrant scheme for each slice
    colors = labels.map((_, i) => {
      const colorSchemes = [creativeColors.vibrant, creativeColors.earth, creativeColors.ocean];
      const scheme = colorSchemes[i % colorSchemes.length];
      return scheme[i % scheme.length];
    });
  }

  charts[canvasId] = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(color => darkenColor(color, 30)),
        borderWidth: 3,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: "right",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: "'Arial', sans-serif"
            }
          }
        },
        title: { 
          display: true, 
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

// Helper function to create gradients
function createGradient(ctx, color1, color2) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

// Helper function to darken colors
function darkenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// --- Site Summary Table ---
function renderSiteSummary(docs) {
  const siteMap = new Map();
  docs.forEach(d => {
    if (!siteMap.has(d.site))
      siteMap.set(d.site, { 
        total: 0, 
        age: {Children: 0, Teenager: 0, "Young Adult": 0, "Middle Aged Adult": 0, Senior: 0}, 
        sex: {Male: 0, Female: 0, Unknown: 0}, 
        countries: {}, 
        regions: {} 
      });

    const s = siteMap.get(d.site);
    s.total++;
    s.age[d.ageCategory] = (s.age[d.ageCategory]||0)+1;
    s.sex[d.sex] = (s.sex[d.sex]||0)+1;
    s.countries[d.nationality] = (s.countries[d.nationality]||0)+1;
    s.regions[d.region] = (s.regions[d.region]||0)+1;
  });

  const container = document.createElement("div");
  container.className = "site-summary";
  container.innerHTML = `
  <h3>Site-wise Visitor Summary</h3>
  <table>
    <thead>
      <tr>
        <th>Site</th>
        <th>Total</th>
        <th>Children</th>
        <th>Teenager</th>
        <th>Young Adult</th>
        <th>Middle Aged</th>
        <th>Senior</th>
        <th>Male</th>
        <th>Female</th>
        <th>Unknown</th>
        <th>Top Countries</th>
        <th>Top Regions</th>
      </tr>
    </thead>
    <tbody>
      ${[...siteMap.keys()].map(site => {
        const s = siteMap.get(site);
        const topC = Object.entries(s.countries).sort((a,b) => b[1] - a[1]).slice(0,3).map(c => c[0] + "(" + c[1] + ")").join(", ");
        const topR = Object.entries(s.regions).sort((a,b) => b[1] - a[1]).slice(0,3).map(r => r[0] + "(" + r[1] + ")").join(", ");
        return `
          <tr>
            <td>${site}</td>
            <td>${s.total}</td>
            <td>${s.age.Children}</td>
            <td>${s.age.Teenager}</td>
            <td>${s.age["Young Adult"]}</td>
            <td>${s.age["Middle Aged Adult"]}</td>
            <td>${s.age.Senior}</td>
            <td>${s.sex.Male}</td>
            <td>${s.sex.Female}</td>
            <td>${s.sex.Unknown}</td>
            <td>${topC || "N/A"}</td>
            <td>${topR || "N/A"}</td>
          </tr>`;
      }).join("")}
    </tbody>
  </table>
`;
  chartsArea.appendChild(container);
}

function renderGeneralAnalytics(docs) {
  clearCharts();

  const type = filterType.value;
  const periodValue = monthInput.value;
  const isYearly = type === "year";
  
  // Visits by Day/Month based on filter type
  if (isYearly) {
    // Yearly view: Show monthly totals from Jan to Dec
    const monthMap = new Map();
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthMap.set(i, 0);
    }
    
    docs.forEach(d => {
      const dt = getDateFromField(d, "dateOfRegistration");
      if (!dt) return;
      const month = dt.getMonth();
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = [...monthMap.keys()].sort((a, b) => a - b);
    drawBarChart("visits-month", `Monthly Visits - ${periodValue}`, 
                 months.map(m => monthNames[m]), months.map(m => monthMap.get(m)), true);
  } else {
    // Monthly view: Show daily totals
    const dayMap = new Map();
    docs.forEach(d => {
      const dt = getDateFromField(d, "dateOfRegistration");
      if (!dt) return;
      const day = dt.getDate();
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    const days = [...dayMap.keys()].sort((a, b) => a - b);
    drawBarChart("visits-day", `Daily Visits - ${periodValue}`, 
                 days.map(d => "Day " + d), days.map(d => dayMap.get(d)), true);
  }

  // Gender Chart (always shows totals for selected period)
  const genderMap = new Map();
  docs.forEach(d => genderMap.set(d.sex, (genderMap.get(d.sex) || 0) + 1));
  drawPieChart("gender", `Gender Distribution - ${isYearly ? periodValue : periodValue.split('-')[0]}`, 
               [...genderMap.keys()], [...genderMap.values()]);

  // Region Chart (always shows totals for selected period)
  const regionMap = new Map();
  docs.forEach(d => regionMap.set(d.region || "Unknown", (regionMap.get(d.region || "Unknown") || 0) + 1));
  const regions = [...regionMap.entries()].sort((a, b) => b[1] - a[1]);
  
  if (isYearly) {
    // Show top regions for the year
    const topRegions = regions.slice(0, 10);
    drawBarChart("region-chart", `Top Regions - ${periodValue}`, 
                 topRegions.map(r => r[0]), topRegions.map(r => r[1]), true);
  } else {
    // Show all regions for the month
    drawBarChart("region-chart", `Visits by Region - ${periodValue}`, 
                 regions.map(r => r[0]), regions.map(r => r[1]), true);
  }

  // Nationality Chart (always shows totals for selected period)
  const nationalityMap = new Map();
  docs.forEach(d => nationalityMap.set(d.nationality || "Unknown", (nationalityMap.get(d.nationality || "Unknown") || 0) + 1));
  
  if (isYearly) {
    // Show top nationalities for the year
    const topNationalities = [...nationalityMap.entries()].slice(0, 10);
    drawBarChart("nationality-chart", `Top Nationalities - ${periodValue}`, 
                 topNationalities.map(n => n[0]), topNationalities.map(n => n[1]), true);
  } else {
    // Show all nationalities for the month
    drawBarChart("nationality-chart", `Nationalities - ${periodValue}`, 
                 [...nationalityMap.keys()], [...nationalityMap.values()], true);
  }

  // Top 10 Non-Filipino Nationalities (always top 10 regardless of period)
  const nonFilipino = [...nationalityMap.entries()]
    .filter(([nat]) => !["philippines", "filipino", "ph"].includes(nat.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  drawBarChart("non-filipino-summary", `Top 10 Non-Filipino Nationalities - ${isYearly ? periodValue : periodValue.split('-')[0]}`, 
               nonFilipino.map(n => n[0]), nonFilipino.map(n => n[1]), true);
}

function renderTouristSpotAnalytics(selectedSite, docs) {
  console.log(`Rendering analytics for ${selectedSite} with ${docs.length} documents`);
  
  if (docs.length === 0) {
    console.log("No documents found for the selected site and period");
    const chartsAreaId = currentReportType === "general" ? "general-charts-area" : "tourist-charts-area";
    const chartsArea = document.getElementById(chartsAreaId);
    if (chartsArea) {
      chartsArea.innerHTML = `<div class="no-data-message">No data available for ${selectedSite === "__all" ? "All Sites" : selectedSite} in the selected period</div>`;
    }
    return;
  }

  clearCharts();

  const type = filterType.value;
  const periodValue = monthInput.value;
  const isYearly = type === "year";
  const siteLabel = selectedSite === "__all" ? "All Sites" : selectedSite;

  // Filter data by selected site if not "All Sites"
  let siteData = selectedSite === "__all" ? docs : docs.filter(d => d.site === selectedSite);

  // Add age category to each document for easier processing
  siteData = siteData.map(d => ({
    ...d,
    ageCategory: getAgeCategory(d.age ?? d.dateOfBirth)
  }));

  // === 1. Visits per period ===
  let periodLabels = [];
  let periodData = [];
  
  if (isYearly) {
    // Yearly view: Show monthly totals from Jan to Dec
    const monthMap = new Map();
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthMap.set(i, 0);
    }
    
    siteData.forEach(d => {
      const dt = getDateFromField(d, "timestamp");
      if (!dt) return;
      const month = dt.getMonth();
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    periodLabels = monthNames;
    periodData = [...monthMap.values()];
  } else {
    // Monthly view: Show daily totals
    const dayMap = new Map();
    siteData.forEach(d => {
      const dt = getDateFromField(d, "timestamp");
      if (!dt) return;
      const day = dt.getDate();
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    
    // Sort days and create labels
    const sortedDays = [...dayMap.entries()].sort((a, b) => a[0] - b[0]);
    periodLabels = sortedDays.map(([day]) => "Day " + day);
    periodData = sortedDays.map(([, count]) => count);
  }
  
  // Draw the period visits chart
  drawBarChart("periodVisits", `${isYearly ? 'Monthly' : 'Daily'} Visits - ${siteLabel} (${periodValue})`, 
               periodLabels, periodData);

  // === 2. Age Categories ===
  const ageCounts = { 
    Children: 0, 
    Teenager: 0, 
    "Young Adult": 0, 
    "Middle Aged Adult": 0, 
    Senior: 0, 
    Unknown: 0 
  };
  siteData.forEach(d => {
    ageCounts[d.ageCategory] = (ageCounts[d.ageCategory] || 0) + 1;
  });
  
  drawBarChart("ageCategories", `Age Distribution - ${siteLabel} (${isYearly ? periodValue : periodValue.split('-')[0]})`, 
               Object.keys(ageCounts), Object.values(ageCounts));

  // === 3. Gender Distribution ===
  const genderCounts = new Map();
  siteData.forEach(d => genderCounts.set(d.sex, (genderCounts.get(d.sex) || 0) + 1));
  
  drawPieChart("genderDist", `Gender Distribution - ${siteLabel} (${isYearly ? periodValue : periodValue.split('-')[0]})`, 
               [...genderCounts.keys()], [...genderCounts.values()]);

  // === 4. Regions ===
  const regionCounts = new Map();
  siteData.forEach(d => {
    const region = d.region || "Unknown";
    regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
  });
  
  const topRegions = [...regionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  drawBarChart("regions", `Top Regions - ${siteLabel} (${isYearly ? periodValue : periodValue.split('-')[0]})`, 
               topRegions.map(r => r[0]), topRegions.map(r => r[1]));

  // === 5. Top 10 Non-Filipino Nationalities ===
  const natCounts = new Map();
  siteData.forEach(d => {
    const nat = (d.nationality || "Unknown").toLowerCase();
    if (!["philippines", "filipino", "ph"].includes(nat)) {
      natCounts.set(d.nationality, (natCounts.get(d.nationality) || 0) + 1);
    }
  });
  
  const topNats = [...natCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  drawBarChart("nonFilipino", `Top 10 Non-Filipino Visitors - ${siteLabel} (${isYearly ? periodValue : periodValue.split('-')[0]})`, 
               topNats.map(n => n[0]), topNats.map(n => n[1]));
}

function recomputeAndRender() {
  let value = monthInput.value;
  const type = filterType.value;

  // Clear previous charts and "no data available" messages
  const generalArea = document.getElementById("general-charts-area");
  const touristArea = document.getElementById("tourist-charts-area");
  if (generalArea) generalArea.innerHTML = "";
  if (touristArea) touristArea.innerHTML = "";

  // Handle empty period value
  if (!value) {
    const now = new Date();
    if (type === "year") {
      value = now.getFullYear().toString();
    } else {
      value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    monthInput.value = value; // Update the input field
  }

  
  // Handle year-only input
  if (type === "year") {
    if (value.includes("-")) {
      value = value.split("-")[0];
    }
    // Ensure we have a valid year
    if (!value || value.length !== 4) {
      value = new Date().getFullYear().toString();
    }
  }
  
  const site = siteDropdown.value || "__all";

  console.log(`Recomputing with: type=${currentReportType}, site=${site}, period=${value}, filterType=${type}`);

  // Clear previous charts
  clearCharts();

  if (currentReportType === "general") {
    const expanded = expandRegistrationDocs(registrations);
    const filtered = filterByPeriod(expanded, value, type, "dateOfRegistration");
    renderKPIs(filtered);
    renderGeneralAnalytics(filtered);
  } else {
    const expanded = expandAttendanceDocs(attendance);
    const filtered = filterByPeriod(expanded, value, type, "timestamp");
    const siteData = site === "__all" ? filtered : filtered.filter(d => d.site === site);
    renderKPIs(siteData, site);
    renderTouristSpotAnalytics(site, siteData);
  }
}  



// --- Firestore Listeners ---
onSnapshot(query(collection(db,"site"),orderBy("name","asc")),snap=>{
  sites=snap.docs.map(d=>({id:d.id,...d.data()}));
  populateSiteDropdown();
});
onSnapshot(query(collection(db,"registrations"),orderBy("dateOfRegistration","desc")),snap=>{
  registrations=snap.docs.map(d=>({id:d.id,...d.data()}));
  recomputeAndRender();
});
onSnapshot(query(collection(db,"attendance"),orderBy("timestamp","desc")),snap=>{
  attendance=snap.docs.map(d=>({id:d.id,...d.data()}));
  // console.log("Raw attendance data:", attendance); // Comment out
  // logDataStructure(attendance); // Comment out
  recomputeAndRender();
});

// --- UI Events ---
applyBtn.addEventListener("click",recomputeAndRender);
siteDropdown.addEventListener("change",recomputeAndRender);
reportType.addEventListener("change",()=>{
  currentReportType=reportType.value;
  analyticsTitle.textContent=currentReportType==="general"?"General Analytics":"Tourist Spot Analytics";
  siteSelectorContainer.style.display=currentReportType==="general"?"none":"flex";
  recomputeAndRender();
});
filterType.addEventListener("change",()=>{
  dateFilterLabel.textContent=filterType.value==="month"?"Month":"Year";
  monthInput.type=filterType.value==="month"?"month":"number";
  if (filterType.value==="year") {
    monthInput.min="2020"; monthInput.max="2030"; monthInput.value=new Date().getFullYear();
  }
  recomputeAndRender();
});

// Update event listeners
reportType.addEventListener("change", switchReportType);

// Initialize report type on load
document.addEventListener('DOMContentLoaded', function() {
  switchReportType(); // Set initial state
});

// --- Default Month ---
(function(){
  const now=new Date();
  monthInput.value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
})();