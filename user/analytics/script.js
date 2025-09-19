// script.js - Updated to separate data sources for general analytics and tourist spots
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

const siteDropdown = document.getElementById("site-dropdown");
const monthInput = document.getElementById("month-filter");
const applyBtn = document.getElementById("apply-filters");
const kpiSection = document.getElementById("kpi-section");
const chartsArea = document.getElementById("charts-area");
const sidebarItems = document.querySelectorAll(".sidebar ul li");

// Add filter type selector for Monthly / Yearly
const filterType = document.createElement("select");
filterType.id = "filter-type";
filterType.innerHTML = `
  <option value="month">Monthly</option>
  <option value="year">Yearly</option>
`;
document.querySelector(".filters-left").insertBefore(filterType, monthInput);

let registrations = [];
let attendance = [];
let sites = [];
let charts = {};
let currentView = "general"; // "general" or "tourist"

// ------------------ Helpers ------------------
function getDateFromDoc(doc) {
  const d = doc.timestamp || doc.dateOfRegistration || doc.createdAt || doc.date;
  if (!d) return null;
  if (typeof d.toDate === "function") return d.toDate();
  const date = new Date(d);
  return isNaN(date) ? null : date;
}

function computeAge(dob, visitDate = new Date()) {
  if (!dob) return null;
  let birth = dob;
  if (typeof dob.toDate === "function") birth = dob.toDate();
  const b = new Date(birth);
  if (isNaN(b)) return null;
  let age = visitDate.getFullYear() - b.getFullYear();
  const m = visitDate.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && visitDate.getDate() < b.getDate())) age--;
  return age;
}

function topNFromMap(map, n = 10) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// Expand group + individual docs into uniform records
function expandDocs(docs, isRegistration = true) {
  const expanded = [];
  docs.forEach(doc => {
    if (doc.registrationType === "group" && Array.isArray(doc.groupMembers)) {
      doc.groupMembers.forEach(m => {
        expanded.push({
          site: isRegistration ? (doc.site || doc.groupName || "Unknown Site") : doc.site,
          nationality: isRegistration ? (doc.groupCountry || "Unknown") : (doc.country || "Unknown"),
          region: isRegistration ? (doc.groupRegion || "Unknown") : (doc.region || "Unknown"),
          sex: m.memberSex || "Unknown",
          dateOfBirth: m.memberDOB || null,
          timestamp: doc.dateOfRegistration || null,
          type: doc.registrationType || "individual",
          source: isRegistration ? "registration" : "attendance"
        });
      });
    } else {
      expanded.push({
        site: isRegistration ? (doc.site || "Unknown Site") : doc.site,
        nationality: isRegistration ? (doc.country || "Unknown") : (doc.country || "Unknown"),
        region: isRegistration ? (doc.region || "Unknown") : (doc.region || "Unknown"),
        sex: doc.sex || "Unknown",
        dateOfBirth: doc.dateOfBirth || null,
        timestamp: doc.dateOfRegistration || null,
        type: doc.registrationType || "individual",
        source: isRegistration ? "registration" : "attendance"
      });
    }
  });
  return expanded;
}

// Filter by month or year
function filterByPeriod(docs, value, type) {
  if (!value) return docs;
  return docs.filter(doc => {
    const dt = getDateFromDoc(doc);
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

// ------------------ UI Rendering ------------------
function populateSiteDropdown(docs) {
  const siteSet = new Set();
  
  // Add sites from documents
  docs.forEach(d => {
    if (d.site && d.site !== "Unknown Site") {
      siteSet.add(d.site);
    }
  });

  // Add sites from the sites collection
  sites.forEach(site => {
    if (site.name) siteSet.add(site.name);
  });
  
  siteDropdown.innerHTML = `<option value="__all">All Sites</option>`;
  [...siteSet].sort().forEach(site => {
    const opt = document.createElement("option");
    opt.value = site;
    opt.textContent = site;
    siteDropdown.appendChild(opt);
  });
}

function renderKPIs(docs) {
  const total = docs.length;
  const genderMap = new Map();
  const natMap = new Map();
  const regionMap = new Map();

  docs.forEach(d => {
    genderMap.set(d.sex, (genderMap.get(d.sex) || 0) + 1);
    const nat = (d.nationality || "Unknown").toLowerCase();
    if (!["philippines", "filipino", "ph"].includes(nat)) {
      natMap.set(d.nationality, (natMap.get(d.nationality) || 0) + 1);
    }
    regionMap.set(d.region, (regionMap.get(d.region) || 0) + 1);
  });

  kpiSection.innerHTML = `
    <div class="kpi-card"><h2>${total}</h2><p>Total ${currentView === "general" ? "Registrations" : "Visits"}</p></div>
    <div class="kpi-card"><h2>${[...genderMap].map(([g,v])=>`${g}:${v}`).join(", ")}</h2><p>Gender counts</p></div>
    <div class="kpi-card"><h2>${topNFromMap(natMap,10).map(x=>x[0]).join(", ")||"No Data"}</h2><p>Top 10 Non-Filipino</p></div>
    <div class="kpi-card"><h2>${topNFromMap(regionMap,10).map(x=>x[0]).join(", ")||"No Data"}</h2><p>Top 10 Regions</p></div>
  `;
}

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
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { 
      labels, 
      datasets: [{ 
        label: title, 
        data: values, 
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }] 
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function drawPieChart(id, title, labels, values) {
  const ctx = createChartCanvas(id, title).getContext("2d");
  charts[id] = new Chart(ctx, {
    type: "pie",
    data: { 
      labels, 
      datasets: [{ 
        data: values, 
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }] 
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}


// Render charts for general analytics (using only registration data)
function renderGeneralAnalytics(docs, site="__all") {
  clearCharts();
  let data = site==="__all"? docs : docs.filter(d=>d.site===site);

  // Check if we have data
  if (data.length === 0) {
    chartsArea.innerHTML = `<div class="no-data">No registration data available for the selected filters</div>`;
    return;
  }

  // visits by day
  const dayMap = new Map();
  data.forEach(d=>{
    const dt = getDateFromDoc(d);
    if (!dt) return;
    const day = dt.getDate();
    dayMap.set(day, (dayMap.get(day)||0)+1);
  });
  const dayKeys = [...dayMap.keys()].sort((a,b)=>a-b);
  drawBarChart("visits-day","Registrations by Day", dayKeys.map(k=>"Day "+k), dayKeys.map(k=>dayMap.get(k)));

  // Fill in missing days with 0
  const daysInMonth = new Date(data[0].timestamp?.getFullYear(), data[0].timestamp?.getMonth() + 1, 0).getDate();
  const dayLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const dayValues = dayLabels.map(day => dayMap.get(day) || 0);
  
  drawBarChart("registrations-day", "Registrations by Day", dayLabels.map(k => "Day " + k), dayValues);


  // age distribution
  const ageBuckets = {"0-12":0,"13-19":0,"20-39":0,"40-59":0,"60+":0,"Unknown":0};
  data.forEach(d=>{
    const dt = getDateFromDoc(d) || new Date();
    const age = computeAge(d.dateOfBirth, dt);
    if (age==null) ageBuckets["Unknown"]++;
    else if (age<=12) ageBuckets["0-12"]++;
    else if (age<=19) ageBuckets["13-19"]++;
    else if (age<=39) ageBuckets["20-39"]++;
    else if (age<=59) ageBuckets["40-59"]++;
    else ageBuckets["60+"]++;
  });
  drawBarChart("age-dist","Age Distribution", Object.keys(ageBuckets), Object.values(ageBuckets));

  // gender
  const genderMap = new Map();
  data.forEach(d=> genderMap.set(d.sex,(genderMap.get(d.sex)||0)+1));
  drawPieChart("gender","Gender", [...genderMap.keys()], [...genderMap.values()]);

  // top regions
  const regionMap = new Map();
  data.forEach(d=> regionMap.set(d.region,(regionMap.get(d.region)||0)+1));
  const topRegions = topNFromMap(regionMap,10);
  drawBarChart("regions","Top 10 Regions", topRegions.map(x=>x[0]), topRegions.map(x=>x[1]));

  // top non-Filipino
  const natMap = new Map();
  data.forEach(d=>{
    const nat=(d.nationality||"Unknown").toLowerCase();
    if(!["philippines","filipino","ph"].includes(nat)){
      natMap.set(d.nationality,(natMap.get(d.nationality)||0)+1);
    }
  });
  const topNats = topNFromMap(natMap,10);
  drawBarChart("nats","Top 10 Non-Filipino", topNats.map(x=>x[0]), topNats.map(x=>x[1]));
}

// Render charts for tourist spots (using only attendance data)
function renderTouristSpots(docs, site="__all") {
  clearCharts();
  let data = site==="__all"? docs : docs.filter(d=>d.site===site);

  // Check if we have data
  if (data.length === 0) {
    chartsArea.innerHTML = `<div class="no-data">No attendance data available for the selected site</div>`;
    return;
  }

  // visits by day for selected site
  const dayMap = new Map();
  data.forEach(d=>{
    const dt = getDateFromDoc(d);
    if (!dt) return;
    const day = dt.getDate();
    dayMap.set(day, (dayMap.get(day)||0)+1);
  });
  const dayKeys = [...dayMap.keys()].sort((a,b)=>a-b);
  drawBarChart("visits-day","Visits by Day", dayKeys.map(k=>"Day "+k), dayKeys.map(k=>dayMap.get(k)));

  // Fill in missing days with 0
  const daysInMonth = new Date(data[0].timestamp?.getFullYear(), data[0].timestamp?.getMonth() + 1, 0).getDate();
  const dayLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const dayValues = dayLabels.map(day => dayMap.get(day) || 0);
  
  drawBarChart("visits-day", "Visits by Day", dayLabels.map(k => "Day " + k), dayValues);

  // Age distribution for tourist spots
  const ageBuckets = {"0-12":0, "13-19":0, "20-39":0, "40-59":0, "60+":0, "Unknown":0};
  data.forEach(d => {
    const dt = getDateFromDoc(d) || new Date();
    const age = computeAge(d.dateOfBirth, dt);
    if (age == null) ageBuckets["Unknown"]++;
    else if (age <= 12) ageBuckets["0-12"]++;
    else if (age <= 19) ageBuckets["13-19"]++;
    else if (age <= 39) ageBuckets["20-39"]++;
    else if (age <= 59) ageBuckets["40-59"]++;
    else ageBuckets["60+"]++;
  });
  drawBarChart("age-dist", "Age Distribution", Object.keys(ageBuckets), Object.values(ageBuckets));

  // visitor type (individual vs group)
  const typeMap = new Map();
  data.forEach(d=> typeMap.set(d.type,(typeMap.get(d.type)||0)+1));
  drawPieChart("visitor-type","Visitor Type", [...typeMap.keys()], [...typeMap.values()]);

  // gender distribution for selected site
  const genderMap = new Map();
  data.forEach(d=> genderMap.set(d.sex,(genderMap.get(d.sex)||0)+1));
  drawPieChart("gender","Gender", [...genderMap.keys()], [...genderMap.values()]);

  // nationality distribution for selected site
  const natMap = new Map();
  data.forEach(d=> natMap.set(d.nationality,(natMap.get(d.nationality)||0)+1));
  const topNats = topNFromMap(natMap,10);
  drawBarChart("nats","Top 10 Nationalities", topNats.map(x=>x[0]), topNats.map(x=>x[1]));
}

// ------------------ Main Logic ------------------
function recomputeAndRender() {
  let expanded = [];
  let value = monthInput.value;
  const type = filterType.value;
  
  if (type==="year" && value.includes("-")) value = value.split("-")[0];
  
  if (currentView === "general") {
    // Use only registration data for general analytics
    expanded = expandDocs(registrations, true);
    const filtered = filterByPeriod(expanded, value, type);
    populateSiteDropdown(filtered);
    renderKPIs(filtered);
    renderGeneralAnalytics(filtered, siteDropdown.value || "__all");
  } else {
    // Use only attendance data for tourist spots
    expanded = expandDocs(attendance, false);
    const filtered = filterByPeriod(expanded, value, type);
    populateSiteDropdown(filtered);
    renderKPIs(filtered);
    renderTouristSpots(filtered, siteDropdown.value || "__all");
  }
}

// ------------------ Firestore Listeners ------------------
const regsQuery = query(collection(db,"registrations"),orderBy("dateOfRegistration","desc"));
const attsQuery = query(collection(db,"attendance"),orderBy("dateOfRegistration","desc"));
const sitesQuery = collection(db, "sites");

onSnapshot(regsQuery, snap=>{
  registrations = snap.docs.map(d=>({id:d.id,...d.data()}));
  if (currentView === "general") recomputeAndRender();
});
onSnapshot(attsQuery, snap=>{
  attendance = snap.docs.map(d=>({id:d.id,...d.data()}));
  if (currentView === "tourist") recomputeAndRender();
});
onSnapshot(sitesQuery, snap=>{
  sites = snap.docs.map(d=>({id:d.id,...d.data()}));
});

// ------------------ UI Events ------------------
applyBtn.addEventListener("click", ()=> recomputeAndRender());
siteDropdown.addEventListener("change", ()=> recomputeAndRender());

// Sidebar navigation
sidebarItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    // Update active state
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    
    // Update current view
    if (index === 0) {
      currentView = "general";
      document.querySelector(".analytics-card h3").textContent = "General Analytics";
    } else {
      currentView = "tourist";
      document.querySelector(".analytics-card h3").textContent = "Tourist Spot Analytics";
    }
    
    recomputeAndRender();
  });
});

// set default month
(function(){
  const now = new Date();
  monthInput.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
})();