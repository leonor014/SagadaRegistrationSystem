import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  query,
  where,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase config
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

const countries = [
  { name: "Afghanistan", code: "AF", dial: "+93" },
  { name: "Albania", code: "AL", dial: "+355" },
  { name: "Algeria", code: "DZ", dial: "+213" },
  { name: "Andorra", code: "AD", dial: "+376" },
  { name: "Angola", code: "AO", dial: "+244" },
  { name: "Antigua and Barbuda", code: "AG", dial: "+1-268" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Armenia", code: "AM", dial: "+374" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Austria", code: "AT", dial: "+43" },
  { name: "Azerbaijan", code: "AZ", dial: "+994" },
  { name: "Bahamas, The", code: "BS", dial: "+1-242" },
  { name: "Bahrain", code: "BH", dial: "+973" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Barbados", code: "BB", dial: "+1-246" },
  { name: "Belarus", code: "BY", dial: "+375" },
  { name: "Belgium", code: "BE", dial: "+32" },
  { name: "Belize", code: "BZ", dial: "+501" },
  { name: "Benin", code: "BJ", dial: "+229" },
  { name: "Bolivia", code: "BO", dial: "+591" },
  { name: "Bosnia and Herzegovina", code: "BA", dial: "+387" },
  { name: "Botswana", code: "BW", dial: "+267" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Brunei", code: "BN", dial: "+673" },
  { name: "Bulgaria", code: "BG", dial: "+359" },
  { name: "Burkina Faso", code: "BF", dial: "+226" },
  { name: "Burundi", code: "BI", dial: "+257" },
  { name: "Cabo Verde", code: "CV", dial: "+238" },
  { name: "Cambodia", code: "KH", dial: "+855" },
  { name: "Cameroon", code: "CM", dial: "+237" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Central African Republic", code: "CF", dial: "+236" },
  { name: "Chad", code: "TD", dial: "+235" },
  { name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Colombia", code: "CO", dial: "+57" },
  { name: "Comoros", code: "KM", dial: "+269" },
  { name: "Congo, Democratic Republic of (DRC)", code: "CD", dial: "+243" },
  { name: "Congo, Republic of", code: "CG", dial: "+242" },
  { name: "Costa Rica", code: "CR", dial: "+506" },
  { name: "Côte d’Ivoire", code: "CI", dial: "+225" },
  { name: "Croatia", code: "HR", dial: "+385" },
  { name: "Cuba", code: "CU", dial: "+53" },
  { name: "Cyprus", code: "CY", dial: "+357" },
  { name: "Czech Republic (Czechia)", code: "CZ", dial: "+420" },
  { name: "Denmark", code: "DK", dial: "+45" },
  { name: "Djibouti", code: "DJ", dial: "+253" },
  { name: "Dominica", code: "DM", dial: "+1-767" },
  { name: "Dominican Republic", code: "DO", dial: "+1-809" },
  { name: "Ecuador", code: "EC", dial: "+593" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "El Salvador", code: "SV", dial: "+503" },
  { name: "Equatorial Guinea", code: "GQ", dial: "+240" },
  { name: "Eritrea", code: "ER", dial: "+291" },
  { name: "Estonia", code: "EE", dial: "+372" },
  { name: "Eswatini (Swaziland)", code: "SZ", dial: "+268" },
  { name: "Ethiopia", code: "ET", dial: "+251" },
  { name: "Fiji", code: "FJ", dial: "+679" },
  { name: "Finland", code: "FI", dial: "+358" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Gabon", code: "GA", dial: "+241" },
  { name: "Gambia, The", code: "GM", dial: "+220" },
  { name: "Georgia", code: "GE", dial: "+995" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Greece", code: "GR", dial: "+30" },
  { name: "Grenada", code: "GD", dial: "+1-473" },
  { name: "Guatemala", code: "GT", dial: "+502" },
  { name: "Guinea", code: "GN", dial: "+224" },
  { name: "Guinea-Bissau", code: "GW", dial: "+245" },
  { name: "Guyana", code: "GY", dial: "+592" },
  { name: "Haiti", code: "HT", dial: "+509" },
  { name: "Honduras", code: "HN", dial: "+504" },
  { name: "Hungary", code: "HU", dial: "+36" },
  { name: "Iceland", code: "IS", dial: "+354" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Iran", code: "IR", dial: "+98" },
  { name: "Iraq", code: "IQ", dial: "+964" },
  { name: "Ireland", code: "IE", dial: "+353" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Jamaica", code: "JM", dial: "+1-876" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Jordan", code: "JO", dial: "+962" },
  { name: "Kazakhstan", code: "KZ", dial: "+7" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kiribati", code: "KI", dial: "+686" },
  { name: "Korea, North", code: "KP", dial: "+850" },
  { name: "Korea, South", code: "KR", dial: "+82" },
  { name: "Kuwait", code: "KW", dial: "+965" },
  { name: "Kyrgyzstan", code: "KG", dial: "+996" },
  { name: "Laos", code: "LA", dial: "+856" },
  { name: "Latvia", code: "LV", dial: "+371" },
  { name: "Lebanon", code: "LB", dial: "+961" },
  { name: "Lesotho", code: "LS", dial: "+266" },
  { name: "Liberia", code: "LR", dial: "+231" },
  { name: "Libya", code: "LY", dial: "+218" },
  { name: "Liechtenstein", code: "LI", dial: "+423" },
  { name: "Lithuania", code: "LT", dial: "+370" },
  { name: "Luxembourg", code: "LU", dial: "+352" },
  { name: "Madagascar", code: "MG", dial: "+261" },
  { name: "Malawi", code: "MW", dial: "+265" },
  { name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Maldives", code: "MV", dial: "+960" },
  { name: "Mali", code: "ML", dial: "+223" },
  { name: "Malta", code: "MT", dial: "+356" },
  { name: "Marshall Islands", code: "MH", dial: "+692" },
  { name: "Mauritania", code: "MR", dial: "+222" },
  { name: "Mauritius", code: "MU", dial: "+230" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Micronesia, Federated States of", code: "FM", dial: "+691" },
  { name: "Moldova", code: "MD", dial: "+373" },
  { name: "Monaco", code: "MC", dial: "+377" },
  { name: "Mongolia", code: "MN", dial: "+976" },
  { name: "Montenegro", code: "ME", dial: "+382" },
  { name: "Morocco", code: "MA", dial: "+212" },
  { name: "Mozambique", code: "MZ", dial: "+258" },
  { name: "Namibia", code: "NA", dial: "+264" },
  { name: "Nauru", code: "NR", dial: "+674" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Nicaragua", code: "NI", dial: "+505" },
  { name: "Niger", code: "NE", dial: "+227" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Norway", code: "NO", dial: "+47" },
  { name: "Oman", code: "OM", dial: "+968" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Palau", code: "PW", dial: "+680" },
  { name: "Panama", code: "PA", dial: "+507" },
  { name: "Papua New Guinea", code: "PG", dial: "+675" },
  { name: "Paraguay", code: "PY", dial: "+595" },
  { name: "Peru", code: "PE", dial: "+51" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Poland", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Qatar", code: "QA", dial: "+974" },
  { name: "Romania", code: "RO", dial: "+40" },
  { name: "Russia", code: "RU", dial: "+7" },
  { name: "Rwanda", code: "RW", dial: "+250" },
  { name: "Saint Kitts and Nevis", code: "KN", dial: "+1-869" },
  { name: "Saint Lucia", code: "LC", dial: "+1-758" },
  { name: "Saint Vincent and the Grenadines", code: "VC", dial: "+1-784" },
  { name: "Samoa", code: "WS", dial: "+685" },
  { name: "San Marino", code: "SM", dial: "+378" },
  { name: "Sao Tome and Principe", code: "ST", dial: "+239" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "Senegal", code: "SN", dial: "+221" },
  { name: "Serbia", code: "RS", dial: "+381" },
  { name: "Seychelles", code: "SC", dial: "+248" },
  { name: "Sierra Leone", code: "SL", dial: "+232" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "Slovakia", code: "SK", dial: "+421" },
  { name: "Slovenia", code: "SI", dial: "+386" },
  { name: "Solomon Islands", code: "SB", dial: "+677" },
  { name: "Somalia", code: "SO", dial: "+252" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "South Sudan", code: "SS", dial: "+211" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Sudan", code: "SD", dial: "+249" },
  { name: "Suriname", code: "SR", dial: "+597" },
  { name: "Sweden", code: "SE", dial: "+46" },
  { name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Syria", code: "SY", dial: "+963" },
  { name: "Taiwan", code: "TW", dial: "+886" },
  { name: "Tajikistan", code: "TJ", dial: "+992" },
  { name: "Tanzania", code: "TZ", dial: "+255" },
  { name: "Thailand", code: "TH", dial: "+66" },
  { name: "Timor-Leste", code: "TL", dial: "+670" },
  { name: "Togo", code: "TG", dial: "+228" },
  { name: "Tonga", code: "TO", dial: "+676" },
  { name: "Trinidad and Tobago", code: "TT", dial: "+1-868" },
  { name: "Tunisia", code: "TN", dial: "+216" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "Turkmenistan", code: "TM", dial: "+993" },
  { name: "Tuvalu", code: "TV", dial: "+688" },
  { name: "Uganda", code: "UG", dial: "+256" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "Uruguay", code: "UY", dial: "+598" },
  { name: "Uzbekistan", code: "UZ", dial: "+998" },
  { name: "Vanuatu", code: "VU", dial: "+678" },
  { name: "Vatican City (Holy See)", code: "VA", dial: "+379" },
  { name: "Venezuela", code: "VE", dial: "+58" },
  { name: "Vietnam", code: "VN", dial: "+84" },
  { name: "Yemen", code: "YE", dial: "+967" },
  { name: "Zambia", code: "ZM", dial: "+260" },
  { name: "Zimbabwe", code: "ZW", dial: "+263" },
];

const philippinesRegions = [
  "Region I",
  "Region II",
  "Region III",
  "Region IV",
  "Region V",
  "Region VI",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "NCR",
  "CAR",
  "BARMM",
  "MIMAROPA",
];

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const noticeModal = document.getElementById("noticeModal");
  const acknowledgeButton = document.getElementById("acknowledgeButton");
  const successModal = document.getElementById("successModal");
  const successModalContent = document.getElementById("successModalContent");
  const loadingModal = document.getElementById("loadingModal");
  const warningModal = document.getElementById("warningModal");
  const goToProfileBtn = document.getElementById("goToProfileBtn");

  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    console.error("User email not found in localStorage.");
    return;
  }

  try {
    // Fetch user document from Firestore
    const userDocRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.error("No user document found for:", userEmail);
      return;
    }

    const userData = userSnap.data();

    // Get personal details and groups
    const personalDetails = userData.personalDetails || {};
    const groups = Array.isArray(userData.groups) ? userData.groups : [];

    // Check if personal details or groups are empty
    const isPersonalEmpty = Object.values(personalDetails).every((val) => !val);
    const isGroupsEmpty = groups.length === 0;

    if (isPersonalEmpty) {
      // Show warning modal
      warningModal.style.display = "flex";
      document.body.style.overflow = "hidden"; // prevent background scroll
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    // Optionally, show warning if fetch fails
    warningModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  // Redirect button
  goToProfileBtn?.addEventListener("click", () => {
    window.location.href = "/SagadaRegistrationSystem/user/profile/index.html";
  });

  // Show notice modal on load **only if warningModal is NOT visible**
  if (noticeModal && warningModal.style.display !== "flex") {
    noticeModal.style.display = "block";
  }

  // Close notice modal and initialize registration
  acknowledgeButton?.addEventListener("click", () => {
    if (noticeModal) noticeModal.style.display = "none";
    initializeRegistration();
  });

  // Also close notice modal when clicking the close button or outside
  const closeBtn = document.querySelector(".close");
  closeBtn?.addEventListener(
    "click",
    () => (noticeModal.style.display = "none")
  );
  window.addEventListener("click", (ev) => {
    if (ev.target === noticeModal) noticeModal.style.display = "none";
  });

  // Keep track of currently selected group object for submission
  let selectedGroupGlobal = null;

  async function initializeRegistration() {
    const groupRegistration = document.getElementById("groupRegistration");
    const individualForm = document.getElementById("individualForm");
    const groupForm = document.getElementById("groupForm");
    const existingGroupSelect = document.getElementById("existingGroupSelect");
    const groupMembersContainer = document.getElementById(
      "groupMembersContainer"
    );
    const groupCountryEl = document.getElementById("groupCountry");
    const groupRegionEl = document.getElementById("groupRegion");
    const groupPhoneEl = document.getElementById("groupPhone");
    const groupEmailEl = document.getElementById("groupEmail");
    const groupDateEl = document.getElementById("groupDateOfRegistration");

    const countryEl = document.getElementById("country");
    const regionEl = document.getElementById("region");
    const phoneEl = document.getElementById("phone");
    const dobEl = document.getElementById("dateOfBirth");

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      // Not logged in
      window.location.href = "/SagadaRegistrationSystem/user/user-auth.html";
      return;
    }

    // Fetch user data
    const userDocRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      console.error("No user document found for:", userEmail);
      return;
    }
    const userData = userSnap.data();

    // set min dates for registration inputs
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("dateOfRegistration")?.setAttribute("min", today);
    document
      .getElementById("groupDateOfRegistration")
      ?.setAttribute("min", today);
    // Restrict DOB max date to today
    const dobInput = document.getElementById("dateOfBirth");
    if (dobInput) {
      dobInput.setAttribute("max", today);
    }

    // prepare user info
    const individualData = {
      fullName: userData.name || "",
      dateOfBirth: userData.personalDetails?.dob || "",
      sex: userData.personalDetails?.sex || "",
      country: userData.personalDetails?.country || "",
      region: userData.personalDetails?.region || "",
      phone: userData.personalDetails?.phone || "",
      email: userData.email || "",
    };

    // populate individual fields if individual already selected or when showing
    function fillIndividualFields() {
      document.getElementById("fullName").value = individualData.fullName;
      document.getElementById("dateOfBirth").value = individualData.dateOfBirth;
      document.getElementById("sex").value = individualData.sex;
      document.getElementById("country").value = individualData.country;
      document.getElementById("region").value = individualData.region;
      document.getElementById("phone").value = individualData.phone;
      document.getElementById("email").value = individualData.email;

      handleCountryChange(individualData.region, individualData.phone);
    }

    fillIndividualFields();

    // groups from user doc
    const groups = Array.isArray(userData.groups) ? userData.groups : [];

    // populate group dropdown
    existingGroupSelect.innerHTML = `<option value="">Select a group</option>`;
    groups.forEach((g, idx) => {
      const opt = document.createElement("option");
      // use index as value to avoid name collisions and to easily map to array
      opt.value = String(idx);
      opt.textContent = g.groupName || `Group ${idx + 1}`;
      existingGroupSelect.appendChild(opt);
    });

    // keep group contact synced to user's personal details
    function syncGroupContactInfo() {
      if (!groupCountryEl || !groupRegionEl || !groupPhoneEl || !groupEmailEl)
        return;
      groupCountryEl.value = individualData.country || "";
      groupRegionEl.value = individualData.region || "";
      groupPhoneEl.value = individualData.phone || "";
      groupEmailEl.value = individualData.email || "";
    }

    function populateGroupCountryAndRegion(
      savedCountry = null,
      savedRegion = null,
      savedPhone = null,
      savedEmail = null
    ) {
      if (!groupCountryEl || !groupRegionEl || !groupPhoneEl || !groupEmailEl)
        return;

      // Populate country options if empty
      if (!groupCountryEl.options.length) {
        groupCountryEl.innerHTML = `<option value="">Select Country</option>`;
        countries.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.name;
          opt.textContent = c.name;
          groupCountryEl.appendChild(opt);
        });
      }

      // Set country
      groupCountryEl.value = savedCountry || individualData.country || "";

      const selectedCountry = countries.find(
        (c) => c.name === groupCountryEl.value
      );

      // Populate region based on country
      groupRegionEl.innerHTML = "";
      if (selectedCountry?.name === "Philippines") {
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "Select Region";
        groupRegionEl.appendChild(defaultOpt);
        philippinesRegions.forEach((r) => {
          const opt = document.createElement("option");
          opt.value = r;
          opt.textContent = r;
          groupRegionEl.appendChild(opt);
        });
        groupRegionEl.disabled = false;
        groupRegionEl.required = true;
      } else {
        const opt = document.createElement("option");
        opt.value = "N/A";
        opt.textContent = "N/A";
        groupRegionEl.appendChild(opt);
        groupRegionEl.disabled = true;
      }

      // Set saved region and phone
      if (savedRegion) groupRegionEl.value = savedRegion;
      groupPhoneEl.value = savedPhone || individualData.phone || "";
      groupEmailEl.value = savedEmail || individualData.email || "";
    }

    function showGroupRequiredModal() {
      const modal = document.getElementById("groupRequiredModal");
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";

      document.getElementById("closeGroupRequiredModal").onclick = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      };

      document.getElementById("goToProfileBtnGroup").onclick = () => {
        window.location.href =
          "/SagadaRegistrationSystem/user/profile/index.html";
      };
    }

    // show/hide forms depending on selection
    async function handleSelectionChange() {
      const val = groupRegistration?.value;

      // Clear members container and reset selected group
      if (groupMembersContainer) groupMembersContainer.innerHTML = "";
      selectedGroupGlobal = null;
      // Reset group and individual date inputs
      if (groupDateEl) groupDateEl.value = "";
      const dateRegEl = document.getElementById("dateOfRegistration");
      if (dateRegEl) dateRegEl.value = "";

      // Reset group selection
      if (existingGroupSelect) existingGroupSelect.value = "";

      if (val === "individual") {
        individualForm.style.display = "block";
        groupForm.style.display = "none";

        fillIndividualFields();

        // Enable individual required fields
        document.getElementById("fullName").required = true;
        document.getElementById("dateOfBirth").required = true;
        document.getElementById("dateOfRegistration").required = true;

        // Disable all group fields
        [
          groupDateEl,
          groupEmailEl,
          groupPhoneEl,
          existingGroupSelect,
          groupCountryEl,
          groupRegionEl,
        ].forEach((el) => {
          if (el) {
            el.required = false;
            el.disabled = true; // also disable so it’s skipped in validation
          }
        });

        // Enable individual inputs
        [fullName, dobEl, dateRegEl].forEach((el) => {
          if (el) el.disabled = false;
        });
      } else if (val === "group") {
        try {
          const userEmail = localStorage.getItem("userEmail");
          if (!userEmail) return;

          const userDocRef = doc(db, "users", userEmail);
          const userSnap = await getDoc(userDocRef);

          if (!userSnap.exists()) return;

          const userData = userSnap.data();
          const groups = Array.isArray(userData.groups) ? userData.groups : [];

          if (groups.length === 0) {
            // No groups exist → reset to individual and show modal
            groupRegistration.value = "";
            handleSelectionChange(); // re-run for individual
            showGroupRequiredModal();
            return;
          }
        } catch (err) {
          console.error("Error checking groups:", err);
          // fallback: reset to individual
          groupRegistration.value = "individual";
          handleSelectionChange();
          showGroupRequiredModal();
          return;
        }

        // If groups exist → proceed with normal group form
        individualForm.style.display = "none";
        groupForm.style.display = "block";
        populateGroupCountryAndRegion(
          individualData.country,
          individualData.region,
          individualData.phone,
          individualData.email
        );

        // Enable group required fields
        [
          groupDateEl,
          groupEmailEl,
          groupPhoneEl,
          existingGroupSelect,
          groupCountryEl,
          groupRegionEl,
        ].forEach((el) => {
          if (el) {
            el.required = true;
            el.disabled = false;
          }
        });

        // Disable individual fields
        [
          document.getElementById("fullName"),
          document.getElementById("dateOfBirth"),
          document.getElementById("dateOfRegistration"),
          document.getElementById("country"),
          document.getElementById("region"),
        ].forEach((el) => {
          if (el) {
            el.required = false;
            el.disabled = true;
          }
        });
      } else {
        // None selected -> hide both
        individualForm.style.display = "none";
        groupForm.style.display = "none";

        // Disable all required fields
        [
          document.getElementById("fullName"),
          document.getElementById("dateOfBirth"),
          document.getElementById("dateOfRegistration"),
          groupDateEl,
          groupEmailEl,
          groupPhoneEl,
          existingGroupSelect,
          groupCountryEl,
          groupRegionEl,
        ].forEach((el) => {
          if (el) {
            el.required = false;
            el.disabled = true;
          }
        });
      }
    }

    if (countryEl) {
      countryEl.innerHTML = `<option value="">Select Country</option>`;
      countries.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = c.name;
        countryEl.appendChild(opt);
      });
    }

    // Populate region dynamically if PH
    function handleCountryChange(savedRegion = null, savedPhone = null) {
      const selectedCountry = countries.find((c) => c.name === countryEl.value);
      if (!selectedCountry) return;

      // Reset region options
      regionEl.innerHTML = "";

      if (selectedCountry.name === "Philippines") {
        // Add default
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "Select Region";
        regionEl.appendChild(defaultOpt);

        philippinesRegions.forEach((r) => {
          const opt = document.createElement("option");
          opt.value = r;
          opt.textContent = r;
          regionEl.appendChild(opt);
        });

        regionEl.disabled = false;
        regionEl.required = true;
      } else {
        const opt = document.createElement("option");
        opt.value = "N/A";
        opt.textContent = "N/A";
        regionEl.appendChild(opt);
        regionEl.disabled = true;
      }

      // apply saved region if provided
      if (savedRegion) {
        regionEl.value = savedRegion;
      }

      // only overwrite phone if no saved phone was passed
      if (savedPhone) {
        phoneEl.value = savedPhone;
      } else {
        phoneEl.value = selectedCountry.dial;
      }
    }

    countryEl?.addEventListener("change", handleCountryChange);

    // initial call & event binding
    handleSelectionChange();
    groupRegistration?.addEventListener("change", handleSelectionChange);

    // group select change - display members & group info
    existingGroupSelect?.addEventListener("change", () => {
      const sel = existingGroupSelect.value;
      // clear container
      if (groupMembersContainer) groupMembersContainer.innerHTML = "";
      selectedGroupGlobal = null;

      if (!sel) {
        // no selection -> keep contact info synced but hide members
        syncGroupContactInfo();
        return;
      }

      const idx = Number(sel);
      const matched = groups[idx];
      console.log("Selected group value (dropdown):", sel);
      console.log("Matched group object from array:", matched);

      if (!matched) {
        console.warn("No group matched for selected value:", sel);
        return;
      }

      selectedGroupGlobal = matched; // store global for submission

      // show members
      const today = new Date().toISOString().split("T")[0];

      if (Array.isArray(matched.members) && matched.members.length > 0) {
        matched.members.forEach((member, i) => {
          const memberDiv = document.createElement("div");
          memberDiv.className = "member-entry";

          const name =
            member.memberName ?? member.memberFullName ?? member.fullName ?? "";
          const dob = member.memberDOB ?? member.dob ?? "";
          const sex = member.memberSex ?? member.sex ?? "";

          memberDiv.innerHTML = `
      <label>Member ${i + 1} Full Name:</label>
      <input type="text" value="${escapeHtml(name)}">
      <label>DOB:</label>
      <input type="date" value="${escapeHtml(dob)}" max="${today}">
      <label>Sex:</label>
      <input type="text" value="${escapeHtml(sex)}">
      <br/><br/><hr>
    `;

          groupMembersContainer.appendChild(memberDiv);
        });
      }

      // set contact info to user's info (keep in sync)
      syncGroupContactInfo();
    });

    // ---------- Real-time validation setup ----------

    // validation helpers
    function validateFullName(name) {
      return /^[A-Za-z]{2,}(?:\s[A-Za-z]{2,})+$/.test(name.trim());
    }

    function validateDateOfBirth(dateStr) {
      if (!dateStr) return false;
      const today = new Date();
      const d = new Date(dateStr);
      const min = new Date(today); // 150 years ago
      min.setFullYear(min.getFullYear() - 150);
      return d <= today && d >= min;
    }

    function validateDateOfRegistration(dateStr) {
      if (!dateStr) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const input = new Date(dateStr);
      input.setHours(0, 0, 0, 0);
      return input >= today; // we already set min today, so this is consistent
    }

    function validateEmailAddr(email) {
      if (!email) return false;
      // Must match normal email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    }

    function validateContactNumber(num) {
      if (!num) return false;
      const digits = num.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    }

    // small helper: escape HTML to avoid injection in value attributes
    function escapeHtml(s) {
      if (s == null) return "";
      return String(s).replace(
        /[&<>"']/g,
        (m) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[m])
      );
    }

    // wire real-time validations
    const fullNameEl = document.getElementById("fullName");
    const fullNameError = document.getElementById("fullNameError");
    fullNameEl?.addEventListener("input", () => {
      if (!validateFullName(fullNameEl.value)) {
        fullNameError &&
          (fullNameError.textContent =
            "Full name must be at least two words, letters only.");
        fullNameEl.classList.add("error-input");
      } else {
        fullNameError && (fullNameError.textContent = "");
        fullNameEl.classList.remove("error-input");
      }
    });

    const dobError = document.getElementById("dateOfBirthError");
    dobEl?.addEventListener("input", () => {
      if (!validateDateOfBirth(dobEl.value)) {
        dobError && (dobError.textContent = "Invalid date of birth.");
        dobEl.classList.add("error-input");
      } else {
        dobError && (dobError.textContent = "");
        dobEl.classList.remove("error-input");
      }
    });

    const dateRegEl = document.getElementById("dateOfRegistration");
    const dateRegError = document.getElementById("dateOfRegistrationError");
    dateRegEl?.addEventListener("input", () => {
      if (!validateDateOfRegistration(dateRegEl.value)) {
        dateRegError &&
          (dateRegError.textContent =
            "Registration date cannot be in the past.");
        dateRegEl.classList.add("error-input");
      } else {
        dateRegError && (dateRegError.textContent = "");
        dateRegEl.classList.remove("error-input");
      }
    });

    const groupDateError = document.getElementById(
      "groupDateOfRegistrationError"
    );
    groupDateEl?.addEventListener("input", () => {
      if (!validateDateOfRegistration(groupDateEl.value)) {
        groupDateError &&
          (groupDateError.textContent =
            "Registration date cannot be in the past.");
        groupDateEl.classList.add("error-input");
      } else {
        groupDateError && (groupDateError.textContent = "");
        groupDateEl.classList.remove("error-input");
      }
    });

    groupEmailEl?.addEventListener("input", () => {
      const err = document.getElementById("groupEmailError");
      if (!validateEmailAddr(groupEmailEl.value)) {
        err &&
          (err.textContent =
            "Email domain must be gmail.com, yahoo.com or outlook.com");
        groupEmailEl.classList.add("error-input");
      } else {
        err && (err.textContent = "");
        groupEmailEl.classList.remove("error-input");
      }
    });

    const phoneErr = document.getElementById("phoneError");
    phoneEl?.addEventListener("input", () => {
      if (!validateContactNumber(phoneEl.value)) {
        phoneErr && (phoneErr.textContent = "Phone must be 7-15 digits.");
        phoneEl.classList.add("error-input");
      } else {
        phoneErr && (phoneErr.textContent = "");
        phoneEl.classList.remove("error-input");
      }
    });

    async function generateRegistrationNumber(isGroup) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0"); // 01-12
      const day = String(today.getDate()).padStart(2, "0"); // 01-31
      const dateStr = `${year}${month}${day}`;
      const typeSuffix = isGroup ? "G" : "I";

      const registrationsRef = collection(db, "registrations");

      let sequence = 1;
      let regNumber = `REG-${dateStr}${String(sequence).padStart(
        4,
        "0"
      )}-${typeSuffix}`;

      // check if this regNumber exists, loop until we find a free one
      while (true) {
        const q = query(
          registrationsRef,
          where("registrationNumber", "==", regNumber)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          // not found -> safe to use
          break;
        }
        // already exists -> increment sequence and try again
        sequence++;
        regNumber = `REG-${dateStr}-${String(sequence).padStart(
          4,
          "0"
        )}-${typeSuffix}`;
      }

      return regNumber;
    }

    // ---------- Form submission ----------
    const form = document.getElementById("registrationForm");
    form?.addEventListener("submit", async (ev) => {
      ev.preventDefault();

      // determine if group registration
      const isGroup = groupRegistration.value === "group";

      // basic validations
      let valid = true;

      const requiredFields = form.querySelectorAll("[required]");
      for (const field of requiredFields) {
        if (!field.value.trim()) {
          alert("Please fill out all required fields.");
          field.focus();
          return;
        }
      }

      // date of registration
      const dateOfReg = isGroup
        ? groupDateEl?.value || ""
        : dateRegEl?.value || "";
      if (!validateDateOfRegistration(dateOfReg)) {
        const errEl = isGroup ? groupDateError : dateRegError;
        errEl && (errEl.textContent = "Invalid registration date.");
        valid = false;
      }

      // If individual: ensure required fields are present (we pre-fill and disable them)
      if (!isGroup) {
        if (!validateFullName(fullNameEl.value)) {
          fullNameError &&
            (fullNameError.textContent = "Please enter a valid full name.");
          valid = false;
        }
        if (!validateDateOfBirth(dobEl.value)) {
          dobError && (dobError.textContent = "Invalid DOB.");
          valid = false;
        }
        if (!validateContactNumber(phoneEl.value)) {
          phoneErr && (phoneErr.textContent = "Invalid phone.");
          valid = false;
        }
        const emailEl = document.getElementById("email");
        const emailErr = document.getElementById("emailError");
        if (!validateEmailAddr(emailEl?.value || "")) {
          emailErr && (emailErr.textContent = "Invalid email domain.");
          valid = false;
        }
      } else {
        // group: ensure a group selected
        if (!selectedGroupGlobal) {
          alert("Please select a group.");
          valid = false;
        }
        // group contact validation
        if (!validateContactNumber(groupPhoneEl.value)) {
          const err = document.getElementById("groupPhoneError");
          err && (err.textContent = "Invalid group phone number.");
          valid = false;
        }
        if (!validateEmailAddr(groupEmailEl.value)) {
          const err = document.getElementById("groupEmailError");
          err && (err.textContent = "Invalid group email domain.");
          valid = false;
        }
      }

      if (!valid) {
        // simple feedback
        alert("Please fix form errors before submitting.");
        return;
      }

      // Build formData
      const registrationNumber = await generateRegistrationNumber(isGroup);
      const formData = {
        registrationNumber,
        dateOfRegistration: dateOfReg,
        registrationType: isGroup ? "group" : "individual",
        createdAt: Timestamp.now(),
      };

      if (isGroup) {
        formData.groupName =
          selectedGroupGlobal.groupName || selectedGroupGlobal.groupName || "";
        formData.groupSize = Array.isArray(selectedGroupGlobal.members)
          ? selectedGroupGlobal.members.length
          : 0;
        formData.groupCountry = groupCountryEl.value || individualData.country;
        formData.groupRegion = groupRegionEl.value || individualData.region;
        formData.groupContact = groupPhoneEl.value || individualData.phone;
        formData.groupEmail = groupEmailEl.value || individualData.email;
        // members come from selectedGroupGlobal.members, map to consistent keys
        formData.groupMembers = (selectedGroupGlobal.members || []).map(
          (m) => ({
            memberName: m.memberName ?? m.memberName ?? m.memberFullName ?? "",
            memberDOB: m.memberDOB ?? m.dob ?? "",
            memberSex: m.memberSex ?? m.sex ?? "",
          })
        );
      } else {
        formData.fullName = fullNameEl.value;
        formData.dateOfBirth = dobEl.value;
        formData.sex = document.getElementById("sex").value;
        formData.country = document.getElementById("country").value;
        formData.region = document.getElementById("region").value;
        formData.contactNumber = phoneEl.value;
        formData.email = document.getElementById("email").value;
      }

      // Show loading modal
      loadingModal?.classList.remove("hidden");

      try {
        // Save to Firestore
        await addDoc(collection(db, "registrations"), formData);

        // send email using EmailJS (use service and templates from your old file)
        sendEmailConfirmation(formData);

        // Display success modal
        displayRegistration(formData);

        // reset form UI
        form.reset();
        // hide forms
        if (individualForm) individualForm.style.display = "none";
        if (groupForm) groupForm.style.display = "none";
        // clear group members list
        if (groupMembersContainer) groupMembersContainer.innerHTML = "";
        selectedGroupGlobal = null;
      } catch (err) {
        console.error("Failed to submit registration:", err);
        alert("Failed to submit registration. See console for details.");
      } finally {
        loadingModal?.classList.add("hidden");
      }
    });

    // close success modal on outside click
    document.addEventListener("click", (evt) => {
      if (!successModal) return;
      const content = document.getElementById("successModalContent");
      if (
        !successModal.classList.contains("hidden") &&
        !content.contains(evt.target)
      ) {
        successModal.classList.add("hidden");
      }
    });
  } // end initializeRegistration

  // ---------- helpers outside initializeRegistration ----------

  function sendEmailConfirmation(data) {
    // Format group members (if any)
    let formattedMembers = "";
    if (Array.isArray(data.groupMembers)) {
      formattedMembers = data.groupMembers
        .map(
          (m, i) =>
            `${i + 1}. ${m.memberName} - ${m.memberDOB} (${m.memberSex})`
        )
        .join("\n");
    }

    const emailParams = {
      registrationNumber: data.registrationNumber,
      registrationType: data.registrationType,
      dateOfRegistration: data.dateOfRegistration,

      // Individual fields
      fullName: data.fullName || "",
      dateOfBirth: data.dateOfBirth || "",
      sex: data.sex || "",
      country: data.country || "",
      region: data.region || "",
      contactNumber: data.contactNumber || "",
      email: data.email || "",

      // Group fields
      groupName: data.groupName || "",
      groupSize: data.groupSize || "",
      groupCountry: data.groupCountry || "",
      groupRegion: data.groupRegion || "",
      groupContact: data.groupContact || "",
      groupEmail: data.groupEmail || "",
      groupMembers: formattedMembers,
      to_email:
        data.registrationType === "group" ? data.groupEmail : data.email,
    };

    const recipient =
      data.registrationType === "group" ? data.groupEmail : data.email;

    const templateId =
      data.registrationType === "group"
        ? "template_krqr3pg"
        : "template_9fzr0aq";
    const serviceId = "service_t1kj91t";

    // EmailJS global is injected in HTML. If not available, just log.
    if (typeof emailjs !== "undefined" && emailjs && emailjs.send) {
      emailjs
        .send(serviceId, templateId, emailParams)
        .then(() => console.log("Confirmation email sent to", recipient))
        .catch((err) => console.error("EmailJS error:", err));
    } else {
      console.warn(
        "EmailJS not available; skipping email send. Prepared params:",
        emailParams
      );
    }
  }

  function displayRegistration(data) {
    const registrationModal = document.getElementById("registrationDisplay");
    const registrationModalContent = document.getElementById(
      "registrationModalContent"
    );

    if (!registrationModal || !registrationModalContent) return;

    function escapeHtml(s) {
      if (s == null) return "";
      return String(s).replace(
        /[&<>"']/g,
        (m) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[m])
      );
    }

    registrationModalContent.innerHTML = `
      <span class="close">&times;</span>
      <h2>Registration Successful</h2>
      <p><strong>Registration Number:</strong> ${escapeHtml(
        data.registrationNumber
      )}</p>
      <p><strong>Date of Registration:</strong> ${escapeHtml(
        data.dateOfRegistration
      )}</p>
      <p><strong>Registration Type:</strong> ${escapeHtml(
        data.registrationType
      )}</p>
      ${
        data.registrationType === "group"
          ? `
        <p><strong>Group Name:</strong> ${escapeHtml(data.groupName)}</p>
        <p><strong>Group Size:</strong> ${escapeHtml(
          String(data.groupSize || "")
        )}</p>
        <p><strong>Country:</strong> ${escapeHtml(data.groupCountry || "")}</p>
        <p><strong>Region:</strong> ${escapeHtml(data.groupRegion || "")}</p>
        <p><strong>Contact:</strong> ${escapeHtml(data.groupContact || "")}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.groupEmail || "")}</p>
        <h3>Group Members</h3>
        ${
          Array.isArray(data.groupMembers)
            ? data.groupMembers
                .map(
                  (m) =>
                    `<p>${escapeHtml(m.memberName)} - ${escapeHtml(
                      m.memberDOB
                    )} (${escapeHtml(m.memberSex)})</p>`
                )
                .join("")
            : ""
        }
      `
          : `
        <p><strong>Full Name:</strong> ${escapeHtml(data.fullName || "")}</p>
        <p><strong>Date of Birth:</strong> ${escapeHtml(
          data.dateOfBirth || ""
        )}</p>
        <p><strong>Sex:</strong> ${escapeHtml(data.sex || "")}</p>
        <p><strong>Country:</strong> ${escapeHtml(data.country || "")}</p>
        <p><strong>Region:</strong> ${escapeHtml(data.region || "")}</p>
        <p><strong>Contact Number:</strong> ${escapeHtml(
          data.contactNumber || ""
        )}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email || "")}</p>
      `
      }
      <br/><br/>
      <button id="closeRegistrationBtn">Close</button>
    `;

    registrationModal.classList.remove("hidden");

    // Close modal when clicking X
    registrationModalContent
      .querySelector(".close")
      ?.addEventListener("click", () => {
        registrationModal.classList.add("hidden");
      });

    // Close modal when clicking Close button
    document
      .getElementById("closeRegistrationBtn")
      ?.addEventListener("click", () => {
        registrationModal.classList.add("hidden");
      });

    // Close modal when clicking outside content
    window.addEventListener("click", (e) => {
      if (e.target === registrationModal) {
        registrationModal.classList.add("hidden");
      }
    });
  }
});
