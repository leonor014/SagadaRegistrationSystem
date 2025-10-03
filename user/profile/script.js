import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  getDoc,
  doc,
  onSnapshot,
  updateDoc,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  checkUserData();
  const authLink = document.getElementById("authLink");
  const userValidated = localStorage.getItem("userValidated") === "true";
  const userIdFromStorage = localStorage.getItem("userId");
  const userEmailFromStorage = localStorage.getItem("userEmail");

  if (userValidated) {
    authLink.textContent = "Profile";
    authLink.href = "/SagadaRegistrationSystem/user/profile/index.html";
    document.getElementById("body").style.visibility = "visible";
  } else {
    authLink.textContent = "Login";
    authLink.href = "/SagadaRegistrationSystem/user/user-auth.html";
    registerLink.style.display = "none";
    /* touristCheckInLink.style.display = "none"; */
    logoutLink.style.display = "none";
    window.location.href = "/SagadaRegistrationSystem/user/user-auth.html";
  }

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("userValidated", "false");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    window.location.href = "/SagadaRegistrationSystem/index.html";
  });

  // Elements
  const warningModal = document.getElementById("warningModal");
  const closeWarning = document.getElementById("closeWarning");

  // Function to show modal
  function showWarningModal() {
    warningModal.style.display = "flex";
    document.body.style.overflow = "hidden"; // prevent background scroll
  }

  // Function to hide modal
  function hideWarningModal() {
    warningModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Close modal when clicking 'x'
  closeWarning.addEventListener("click", hideWarningModal);

  // Close modal when clicking outside the content
  window.addEventListener("click", (event) => {
    if (event.target === warningModal) {
      hideWarningModal();
    }
  });

  async function checkUserData() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    try {
      const userDocRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const personalDetails = userData.personalDetails || {};
      const groups = Array.isArray(userData.groups) ? userData.groups : [];

      // --- Personal Details Validation ---
      const today = new Date();
      const dobDate = personalDetails.dob
        ? new Date(personalDetails.dob)
        : null;

      const isPersonalEmpty =
        !personalDetails.dob ||
        !dobDate ||
        dobDate > today || // DOB missing or in the future
        !personalDetails.sex ||
        !personalDetails.country ||
        !personalDetails.region ||
        !personalDetails.phone;

      // --- Groups Validation ---
      const isGroupsEmpty =
        groups.length === 0 ||
        groups.some((group) => {
          if (!group.groupName) return true; // group name missing
          if (!group.members || !Array.isArray(group.members)) return true; // members array missing
          if (group.members.length === 0) return true; // no members
          // check each member for valid fields
          return group.members.some(
            (m) => !m.memberName || !m.memberDOB || !m.memberSex
          );
        });

      // --- Show modal if personal details or groups are invalid ---
      if (isPersonalEmpty || isGroupsEmpty) {
        showWarningModal();
      } else {
        hideWarningModal(); // all good
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      showWarningModal(); // show modal if fetch fails
    }
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.setAttribute("max", today);
  });

  if (userEmailFromStorage) {
    // Real-time Firestore listener
    const userDocRef = doc(db, "users", userEmailFromStorage);
    onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Personal Info
        document.getElementById("fullName").value = userData.name || "";
        document.getElementById("email").value = userData.email || "";
        if (userData.personalDetails) {
          document.getElementById("dob").value =
            userData.personalDetails.dob || "";
          document.getElementById("sex").value =
            userData.personalDetails.sex || "";
          // Country + Region
          const countryEl = document.getElementById("country");
          const regionEl = document.getElementById("region");

          countryEl.value = userData.personalDetails.country || "";

          // Trigger change so regions populate
          countryEl.dispatchEvent(new Event("change"));

          // Now set the saved region (after regions are populated)
          regionEl.value = userData.personalDetails.region || "";

          // Phone
          document.getElementById("phone").value =
            userData.personalDetails.phone || "";
        }

        // Groups
        const groupCards = document.querySelectorAll(".group-card");
        groupCards.forEach((card) => {
          card.querySelector("input[type=text]").value = "";
          card.querySelector("ul").innerHTML = "";
        });

        if (userData.groups && Array.isArray(userData.groups)) {
          userData.groups.forEach((group, index) => {
            if (index > 2) return; // limit to 3 groups
            const groupCard = groupCards[index];
            const groupNameInput = groupCard.querySelector("input[type=text]");
            const ul = groupCard.querySelector("ul");

            groupNameInput.value = group.groupName || "";
            ul.innerHTML = "";

            group.members.forEach((m) => {
              const li = document.createElement("li");
              li.innerHTML = `
                <input type="text" value="${
                  m.memberName
                }" placeholder="Full Name" disabled />
                <input type="date" value="${m.memberDOB}" disabled />
                <select disabled>
                <option value="">Sex</option>
                <option ${
                  m.memberSex === "Male" ? "selected" : ""
                }>Male</option>
                <option ${
                  m.memberSex === "Female" ? "selected" : ""
                }>Female</option>
                </select>
            `;
              ul.appendChild(createMemberRow(m));
            });
          });
        }
      }
    });
  } else {
    localStorage.removeItem("userValidated");
    localStorage.removeItem("userEmail");
    window.location.href = "/SagadaRegistrationSystem/user/user-auth.html";
    authLink.textContent = "Login";
    authLink.href = "/SagadaRegistrationSystem/user/user-auth.html";
    registerLink.style.display = "none";
    protectedButtons.style.display = "none";
  }

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  // Toggle menu on hamburger click
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent click bubbling
    navLinks.classList.toggle("show");
  });

  // Close menu if clicking outside
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("show") &&
      !navLinks.contains(e.target) &&
      e.target !== hamburger
    ) {
      navLinks.classList.remove("show");
    }
  });
});

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();

  // Guard: if DOB is in the future, return 0 or throw an error
  if (birthDate > today) {
    console.warn("DOB is in the future:", dob);
    return 0; // or throw Error("DOB cannot be in the future");
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  let monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// Optional: Add validation when saving or updating a member/user
function validateDOB(dobInput) {
  const dob = new Date(dobInput.value);
  const today = new Date();
  if (dob > today) {
    dobInput.setCustomValidity("Date of birth cannot be in the future.");
    return false;
  } else {
    dobInput.setCustomValidity(""); // reset
    return true;
  }
}

function createMemberRow(
  m = { memberName: "", memberDOB: "", memberSex: "" },
  disabled = true
) {
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" value="${
      m.memberName
    }" placeholder="Full Name" required ${disabled ? "disabled" : ""} />
    <input type="date" value="${m.memberDOB}" required ${
    disabled ? "disabled" : ""
  } />
    <select required ${disabled ? "disabled" : ""}>
      <option value="">Sex</option>
      <option ${m.memberSex === "Male" ? "selected" : ""}>Male</option>
      <option ${m.memberSex === "Female" ? "selected" : ""}>Female</option>
    </select>
    <button type="button" class="remove-member" style="display:${
      disabled ? "none" : "inline-block"
    };">❌</button>
  `;

  // Set max date for the DOB input
  const dobInput = li.querySelector('input[type="date"]');
  const today = new Date().toISOString().split("T")[0];
  dobInput.setAttribute("max", today);

  li.querySelector(".remove-member").addEventListener("click", () =>
    li.remove()
  );
  return li;
}

// Edit / Save personal info
const editBtn = document.getElementById("editProfile");
const saveBtn = document.getElementById("saveProfile");
const inputs = document.querySelectorAll(
  "#profileForm input, #profileForm select"
);

editBtn.addEventListener("click", () => {
  inputs.forEach((input) => {
    if (input.id !== "email") {
      input.disabled = false;
    }
  });
  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
});
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  inputs.forEach((input) => {
    if (input.id !== "email") {
      input.disabled = true;
    }
  });
  editBtn.style.display = "inline-block";
  saveBtn.style.display = "none";

  const userEmailFromStorage = localStorage.getItem("userEmail");
  if (!userEmailFromStorage) return;

  try {
    const userDocRef = doc(db, "users", userEmailFromStorage);
    await updateDoc(userDocRef, {
      name: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      personalDetails: {
        dob: document.getElementById("dob").value,
        sex: document.getElementById("sex").value,
        country: document.getElementById("country").value,
        region: document.getElementById("region").value,
        phone: document.getElementById("phone").value,
      },
    });
    Swal.fire("Success", "Profile saved successfully!", "success");
  } catch (error) {
    console.error("Error updating profile:", error);
    Swal.fire("Error", "Failed to save profile.", "error");
  }
});

// Setup Group Cards with Edit & Save buttons
document.querySelectorAll(".group-card").forEach((card, index) => {
  const groupNameInput = card.querySelector("input[type=text]");
  const ul = card.querySelector("ul");
  const addBtn = card.querySelector(".add-btn");

  // Hide add button & disable inputs initially
  groupNameInput.disabled = true;
  addBtn.style.display = "none"; // HIDE instead of disable

  // Add Edit and Save buttons
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit Group";
  editBtn.classList.add("edit-btn");

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Group";
  saveBtn.classList.add("save-btn");
  saveBtn.style.display = "none";

  card.appendChild(editBtn);
  card.appendChild(saveBtn);

  // Edit button: enable inputs
  editBtn.addEventListener("click", () => {
    groupNameInput.disabled = false;
    addBtn.style.display = "inline-block"; // SHOW add button
    ul.querySelectorAll("input, select").forEach((el) => (el.disabled = false));
    ul.querySelectorAll(".remove-member").forEach(
      (btn) => (btn.style.display = "inline-block")
    );

    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
  });

  // Save button: update Firestore & lock inputs
  saveBtn.addEventListener("click", async () => {
    const userEmailFromStorage = localStorage.getItem("userEmail");
    if (!userEmailFromStorage) return;

    const groupName = groupNameInput.value.trim();
    const members = [];

    let hasError = false;

    ul.querySelectorAll("li").forEach((li) => {
      const memberName = li.querySelector("input[type=text]").value.trim();
      const memberDOB = li.querySelector("input[type=date]").value;
      const memberSex = li.querySelector("select").value;

      if (!memberName || !memberDOB || !memberSex) {
        hasError = true;
      } else {
        members.push({ memberName, memberDOB, memberSex });
      }
    });

    if (!groupName) {
      Swal.fire("Error", "Group name is required.", "error");
      return;
    }

    if (hasError) {
      Swal.fire("Error", "All member fields are required.", "error");
      return;
    }

    if (members.length === 0) {
      Swal.fire("Error", "At least one member is required.", "error");
      return;
    }

    try {
      const userDocRef = doc(db, "users", userEmailFromStorage);

      // Fetch existing groups
      const snap = await getDoc(userDocRef);
      let groups = [];
      if (snap.exists()) {
        groups = snap.data().groups || [];
      }
      groups[index] = { groupName, members }; // update only this group

      await updateDoc(userDocRef, { groups });

      // Lock inputs again
      groupNameInput.disabled = true;
      addBtn.style.display = "none";
      ul.querySelectorAll("input, select").forEach(
        (el) => (el.disabled = true)
      );
      ul.querySelectorAll(".remove-member").forEach(
        (btn) => (btn.style.display = "none")
      );

      saveBtn.style.display = "none";
      editBtn.style.display = "inline-block";

      Swal.fire("Success", `${groupName} saved successfully!`, "success");
    } catch (error) {
      console.error("Error saving group:", error);
      Swal.fire("Error", "Failed to save group.", "error");
    }
  });
});

// Handle "Add Member" buttons
document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ul = btn.previousElementSibling;
    // Use helper directly
    ul.appendChild(createMemberRow(undefined, false));
  });
});

// --- Country, Region, and Phone Setup ---
const countrySelect = document.getElementById("country");
const regionSelect = document.getElementById("region");
const phoneInput = document.getElementById("phone");

const groupCountrySelect = document.getElementById("groupCountry");
const groupRegionSelect = document.getElementById("groupRegion");
const groupPhoneInput = document.getElementById("groupPhone");

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

// Populate country selects
[countrySelect, groupCountrySelect].forEach((select) => {
  if (!select) return;
  countries.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
});

// Handle region and phone auto-fill
function setupCountryChange(selectEl, regionEl, phoneEl) {
  if (!selectEl) return;

  function updateRegionAndPhone() {
    const selected = countries.find((c) => c.name === selectEl.value);

    // Phone prefix
    if (selected && phoneEl) {
      phoneEl.value = selected.dial;
    }

    // Regions
    if (regionEl) {
      regionEl.innerHTML = "";

      if (selectEl.value === "Philippines") {
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

        // Only enable if we're in edit mode
        if (!regionEl.disabled && !regionEl.hasAttribute("data-locked")) {
          regionEl.disabled = false;
        }
      } else {
        const opt = document.createElement("option");
        opt.value = "N/A"; // give it a valid value
        opt.textContent = "N/A";
        regionEl.appendChild(opt);
        regionEl.disabled = true;
      }
    }
  }

  // Run immediately (initial state)
  updateRegionAndPhone();

  // Run whenever the country changes
  selectEl.addEventListener("change", updateRegionAndPhone);
}

setupCountryChange(countrySelect, regionSelect, phoneInput);
setupCountryChange(groupCountrySelect, groupRegionSelect, groupPhoneInput);
