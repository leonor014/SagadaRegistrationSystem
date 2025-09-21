import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js"; 
import {
  getFirestore,
  collection,
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
const db = getFirestore(app);

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
  if (!ageOrDob) return "Unknown";
  
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
    console.log(`Document ${index}:`, data);
    
    const site = data.site || "Unknown Site";
    const ts = getDateFromField(data, "timestamp");
    const groupCountry = data.country || data.groupCountry || "Unknown";
    const groupRegion = data.region || data.groupRegion || "Unknown";

    console.log(`Site: ${site}, Timestamp: ${ts}, Group Country: ${groupCountry}, Group Region: ${groupRegion}`);

    if (data.registrationType === "group" && Array.isArray(data.groupMembers)) {
      console.log(`Found group with ${data.groupMembers.length} members`);
      
      data.groupMembers.forEach((m, memberIndex) => {
        const nationality = m.nationality || m.memberNationality || groupCountry || "Unknown";
        const region = m.region || m.memberRegion || groupRegion || "Unknown";
        const sex = m.sex || m.memberSex || "Unknown";
        const dob = m.age || m.dateOfBirth || m.memberDOB || null;
        
        console.log(`Member ${memberIndex}:`, {
          nationality,
          region,
          sex,
          dob,
          hasNationality: !!m.nationality,
          hasMemberNationality: !!m.memberNationality,
          hasRegion: !!m.region,
          hasMemberRegion: !!m.memberRegion,
          hasSex: !!m.sex,
          hasMemberSex: !!m.memberSex,
          hasAge: !!m.age,
          hasDOB: !!m.dateOfBirth,
          hasMemberDOB: !!m.memberDOB
        });

        expanded.push({
          site: site,
          timestamp: ts,
          nationality: nationality,
          region: region,
          sex: sex,
          dateOfBirth: dob
        });
      });
    } else {
      console.log("Single registration or no group members");
      expanded.push({
        site: site,
        timestamp: ts,
        nationality: data.nationality || data.country || "Unknown",
        region: data.region || "Unknown",
        sex: data.sex || "Unknown",
        dateOfBirth: data.dateOfBirth || null
      });
    }
  });
  
  console.log("=== EXPANDED DATA ===", expanded);
  return expanded;
}


// --- Filter ---
function filterByPeriod(docs, value, type, field) {
  if (!value) return docs;
  return docs.filter(doc => {
    const dt = getDateFromField(doc, field);
    if (!dt) return false;
    if (type === "month") {
      const [y, m] = value.split("-");
      return dt.getFullYear() === +y && dt.getMonth() === +m - 1;
    }
    if (type === "year") return dt.getFullYear() === +value;
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
  let data = site === "__all" ? docs : docs.filter(d => d.site === site);
  const total = data.length;
  
  if (total === 0) {
    kpiSection.innerHTML = `
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
  
  kpiSection.innerHTML = `
    <div class="kpi-card"><h2>${total}</h2><p>Total visits</p></div>
    <div class="kpi-card"><h2>${[...genderMap].map(([g, v]) => `${g}: ${v}`).join(", ") || "No data"}</h2><p>Gender counts</p></div>
    <div class="kpi-card"><h2>${topN(natMap).map(x => x[0]).join(", ") || "No data"}</h2><p>Top Non-Filipino</p></div>
    <div class="kpi-card"><h2>${topN(regionMap).map(x => x[0]).join(", ") || "No data"}</h2><p>Top Regions</p></div>
  `;
}

// --- Charts ---
function clearCharts() {
  Object.values(charts).forEach(c => c.destroy && c.destroy());
  charts = {};
  chartsArea.innerHTML = "";
}
function createChartCanvas(id, title) {
  const div = document.createElement("div");
  div.className = "chart-wrapper";
  div.innerHTML = `<h3>${title}</h3><canvas id="${id}"></canvas>`;
  chartsArea.appendChild(div);
  return div.querySelector("canvas");
}
function drawBarChart(id, title, labels, values) {
  const ctx = createChartCanvas(id, title).getContext("2d");
  charts[id] = new Chart(ctx, { type: "bar", data: { labels, datasets: [{ label: title, data: values }] }});
}
function drawPieChart(id, title, labels, values) {
  const ctx = createChartCanvas(id, title).getContext("2d");
  charts[id] = new Chart(ctx, { type: "pie", data: { labels, datasets: [{ data: values }] }});
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

// --- Analytics Rendering ---
function renderGeneralAnalytics(docs) {
  clearCharts();
  const dayMap = new Map();
  docs.forEach(d => {
    const dt = getDateFromField(d,"dateOfRegistration");
    if (!dt) return;
    const day = dt.getDate();
    dayMap.set(day,(dayMap.get(day)||0)+1);
  });
  const days = [...dayMap.keys()].sort((a,b)=>a-b);
  drawBarChart("visits-day","Visits by Day",days.map(d=>"Day "+d),days.map(d=>dayMap.get(d)));

  const genderMap = new Map();
  docs.forEach(d=>genderMap.set(d.sex,(genderMap.get(d.sex)||0)+1));
  drawPieChart("gender","Gender",[...genderMap.keys()],[...genderMap.values()]);
}

function renderTouristSpotAnalytics(selectedSite, docs) {
  console.log(`Rendering analytics for ${selectedSite} with ${docs.length} documents`);
  
  if (docs.length === 0) {
    console.log("No documents found for the selected site and period");
    // Display a message to the user
    chartsArea.innerHTML = `<div class="no-data-message">No data available for ${selectedSite} in the selected period</div>`;
    return;
  }

  clearCharts();

  // Filter data by selected site if not "All Sites"
  let siteData = selectedSite === "__all" 
    ? docs 
    : docs.filter(d => d.site === selectedSite);

  // Add age category to each document for easier processing
  siteData = siteData.map(d => ({
    ...d,
    ageCategory: getAgeCategory(d.dateOfBirth)
  }));

  // === 1. Total visits per month ===
  const monthlyVisits = new Map();
  siteData.forEach(d => {
    const dt = getDateFromField(d, "timestamp");
    if (!dt) return;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    monthlyVisits.set(key, (monthlyVisits.get(key) || 0) + 1);
  });
  
  const sortedMonths = [...monthlyVisits.entries()].sort((a, b) => {
    const [ay, am] = a[0].split("-").map(Number);
    const [by, bm] = b[0].split("-").map(Number);
    return ay - by || am - bm;
  });
  
  drawBarChart("monthlyVisits", `Monthly Visits - ${selectedSite === "__all" ? "All Sites" : selectedSite}`, 
               sortedMonths.map(x => x[0]), sortedMonths.map(x => x[1]));

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
  
  drawBarChart("ageCategories", `Age Distribution - ${selectedSite === "__all" ? "All Sites" : selectedSite}`, 
               Object.keys(ageCounts), Object.values(ageCounts));

  // === 3. Gender Distribution ===
  const genderCounts = new Map();
  siteData.forEach(d => genderCounts.set(d.sex, (genderCounts.get(d.sex) || 0) + 1));
  
  drawPieChart("genderDist", `Gender Distribution - ${selectedSite === "__all" ? "All Sites" : selectedSite}`, 
               [...genderCounts.keys()], [...genderCounts.values()]);

  // === 4. Regions in the Philippines ===
  const regionCounts = new Map();
  siteData.forEach(d => {
    const region = d.region || "Unknown";
    regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
  });
  
  const topRegions = [...regionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  drawBarChart("regions", `Top Regions - ${selectedSite === "__all" ? "All Sites" : selectedSite}`, 
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
  drawBarChart("nonFilipino", `Top 10 Non-Filipino Visitors - ${selectedSite === "__all" ? "All Sites" : selectedSite}`, 
               topNats.map(n => n[0]), topNats.map(n => n[1]));
}


// --- Main Render ---
function recomputeAndRender() {
  let value = monthInput.value;
  const type = filterType.value;
  if (type === "year" && value.includes("-")) value = value.split("-")[0];
  const site = siteDropdown.value || "__all";

  console.log(`Recomputing with: type=${currentReportType}, site=${site}, period=${value}, filterType=${type}`);

  if (currentReportType === "general") {
    const expanded = expandRegistrationDocs(registrations);
    console.log("General analytics expanded data:", expanded);
    
    const filtered = filterByPeriod(expanded, value, type, "dateOfRegistration");
    console.log("General analytics filtered data:", filtered);
    
    renderKPIs(filtered);
    renderGeneralAnalytics(filtered);
  } else {
    const expanded = expandAttendanceDocs(attendance);
    console.log("Tourist spot expanded data:", expanded);
    
    const filtered = filterByPeriod(expanded, value, type, "timestamp");
    console.log("Tourist spot filtered data:", filtered);
    
    const siteData = site === "__all" ? filtered : filtered.filter(d => d.site === site);
    console.log(`Site data for ${site}:`, siteData);
    
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

// --- Default Month ---
(function(){
  const now=new Date();
  monthInput.value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
})();
