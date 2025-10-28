import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  getDoc,
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
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
let userPersonalDetails = {};

document.addEventListener("DOMContentLoaded", () => {
  const userValidated = localStorage.getItem("userValidated") === "true";
  const userIdFromStorage = localStorage.getItem("userId");
  const userEmailFromStorage = localStorage.getItem("userEmail");

  /* if (userValidated) {
    authLink.textContent = "Profile";
    authLink.href = "/SagadaRegistrationSystem/user/profile/index.html";
    document.getElementById("body").style.visibility = "visible";
  } else {
    authLink.textContent = "Login";
    authLink.href = "/SagadaRegistrationSystem/user/user-auth.html";
    registerLink.style.display = "none";
    /* touristCheckInLink.style.display = "none"; 
    logoutLink.style.display = "none";
    window.location.href = "/SagadaRegistrationSystem/user/user-auth.html";
  }

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("userValidated", "false");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    window.location.href = "/SagadaRegistrationSystem/index.html";
  }); */

  /* // Elements
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
  } */

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

        userPersonalDetails = userData.personalDetails || {};

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
                <input type="date" value="${
                  m.memberDOB
                }" placeholder="Date of Birth" disabled />
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

  // Registration
  loadRegistrationHistory();

  // Groups
  loadGroupsFromFirestore();
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

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const sex = document.getElementById("sex").value;
  const country = document.getElementById("country").value;
  const region = document.getElementById("region").value;
  const phone = document.getElementById("phone").value.trim();

  // === VALIDATION ===
  // 1. Required Fields
  if (!fullName || !email || !dob || !sex || !country || !region || !phone) {
    return Swal.fire({
      icon: "error",
      title: "Incomplete Form",
      text: "Please fill in all required fields before saving.",
    });
  }

  // 2. Full Name must have at least two words
  const nameParts = fullName.split(/\s+/);
  if (nameParts.length < 2) {
    return Swal.fire({
      icon: "warning",
      title: "Invalid Name",
      text: "Please enter your full name with at least two words.",
    });
  }

  // 3. Email Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Swal.fire({
      icon: "warning",
      title: "Invalid Email",
      text: "Please enter a valid email address.",
    });
  }

  // 4. Date of Birth cannot be in the future and must be 0-90 years old
  const today = new Date();
  const birthDate = new Date(dob);
  if (birthDate > today) {
    return Swal.fire({
      icon: "warning",
      title: "Invalid Date of Birth",
      text: "Date of birth cannot be in the future.",
    });
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // Check age range
  if (age < 0 || age > 90) {
    return Swal.fire({
      icon: "warning",
      title: "Invalid Age",
      text: "Age must be between 0 and 90 years.",
    });
  }

  // 5. Sex must be Male or Female
  if (sex !== "Male" && sex !== "Female") {
    return Swal.fire({
      icon: "warning",
      title: "Invalid Sex",
      text: "Please select either Male or Female.",
    });
  }

  // 6. Phone validation — must start with + and at least 7 digits total
  const phoneRegex = /^\+\d{6,}$/;
  if (!phoneRegex.test(phone)) {
    return Swal.fire({
      icon: "warning",
      title: "Invalid Phone Number",
      text: "Phone number must start with '+' followed by at least 6 digits (e.g., +639123456789).",
    });
  }

  // 7. Country / Region logic
  if (country === "Philippines" && region === "") {
    return Swal.fire({
      icon: "warning",
      title: "Missing Region",
      text: "Please select your region if you are from the Philippines.",
    });
  }

  // === SAVE TO FIRESTORE ===
  const userEmailFromStorage = localStorage.getItem("userEmail");
  if (!userEmailFromStorage) {
    return Swal.fire({
      icon: "error",
      title: "Error",
      text: "User session not found. Please log in again.",
    });
  }

  try {
    const userDocRef = doc(db, "users", userEmailFromStorage);
    await updateDoc(userDocRef, {
      name: fullName,
      email,
      personalDetails: {
        dob,
        sex,
        country,
        region,
        phone,
      },
    });

    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Profile saved successfully.",
    });

    // Disable fields again
    const inputs = document.querySelectorAll(
      "#profileForm input, #profileForm select"
    );
    inputs.forEach((input) => {
      if (input.id !== "email") input.disabled = true;
    });
    document.getElementById("editProfile").style.display = "inline-block";
    document.getElementById("saveProfile").style.display = "none";
  } catch (error) {
    console.error("Error updating profile:", error);
    Swal.fire({
      icon: "error",
      title: "Save Failed",
      text: "An error occurred while saving your profile. Please try again.",
    });
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

// --- Registration History Section ---
const registrationList = document.getElementById("registrationList");

// Function to load registrations
async function loadRegistrationHistory() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  // Clear table before loading
  registrationList.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center; padding:1rem; color:#888;">
        Loading registrations...
      </td>
    </tr>
  `;

  try {
    // Build two queries: one for 'email', one for 'groupEmail'
    const regRef = collection(db, "registrations");

    // No orderBy — avoids Firestore index requirement
    const emailQuery = query(regRef, where("email", "==", userEmail));
    const groupEmailQuery = query(regRef, where("groupEmail", "==", userEmail));

    const [emailSnap, groupEmailSnap] = await Promise.all([
      getDocs(emailQuery),
      getDocs(groupEmailQuery),
    ]);

    // Combine both sets
    const registrations = [];

    emailSnap.forEach((doc) =>
      registrations.push({ id: doc.id, ...doc.data() })
    );
    groupEmailSnap.forEach((doc) =>
      registrations.push({ id: doc.id, ...doc.data() })
    );

    // Sort locally by dateOfRegistration (descending)
    registrations.sort(
      (a, b) => new Date(b.dateOfRegistration) - new Date(a.dateOfRegistration)
    );

    // Render table
    if (registrations.length === 0) {
      registrationList.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center; padding:1rem; color:#888;">
            No registrations found.
          </td>
        </tr>
      `;
      return;
    }

    registrationList.innerHTML = ""; // clear loading message

    registrations.forEach((reg) => {
      const regNo = reg.registrationNumber || "(No Registration No.)";
      const regDate =
        reg.dateOfRegistration && !isNaN(new Date(reg.dateOfRegistration))
          ? new Date(reg.dateOfRegistration).toLocaleDateString()
          : "Unknown Date";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${regNo}</td>
        <td>${regDate}</td>
        <td><button class="view-btn" data-id="${regNo}">View</button></td>
      `;
      registrationList.appendChild(tr);
    });

    // Add event listener to each View button
    registrationList.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const regId = e.target.dataset.id;
        openRegistrationModal(regId);
      });
    });
  } catch (err) {
    console.error("Error fetching registrations:", err);
    registrationList.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:1rem; color:red;">
          Failed to load registrations.
        </td>
      </tr>
    `;
  }
}

// Close modal
const modal = document.getElementById("registrationModal");
const closeModalBtn = document.getElementById("closeModal");

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Function to open and load modal content
async function openRegistrationModal(regNo) {
  const registrationDetailsDiv = document.getElementById("registrationDetails");
  const attendanceList = document.getElementById("attendanceList");
  modal.style.display = "flex";

  registrationDetailsDiv.innerHTML = `<p>Loading registration details...</p>`;
  attendanceList.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">Loading attendance...</td></tr>`;

  try {
    // --- Fetch registration details ---
    const regRef = collection(db, "registrations");
    const q = query(regRef, where("registrationNumber", "==", regNo));
    const regSnap = await getDocs(q);

    if (regSnap.empty) {
      registrationDetailsDiv.innerHTML = `<p style="color:red;">Registration not found.</p>`;
      return;
    }

    const reg = regSnap.docs[0].data();

    // Format registration details
    let html = "";

    if (reg.registrationType === "group") {
      html += `
        <p><strong>Registration No:</strong> ${reg.registrationNumber}</p>
        <p><strong>Type:</strong> Group</p>
        <p><strong>Group Name:</strong> ${reg.groupName}</p>
        <p><strong>Country:</strong> ${reg.groupCountry}</p>
        <p><strong>Region:</strong> ${reg.groupRegion}</p>
        <p><strong>Email:</strong> ${reg.groupEmail}</p>
        <p><strong>Contact:</strong> ${reg.groupContact}</p>
        <p><strong>Date of Registration:</strong> ${reg.dateOfRegistration}</p>
        <h3 style="margin-top:1rem;">Members</h3>
          ${reg.groupMembers
            .map(
              (m, i) => `
              <p>
                <strong>${i + 1}. ${m.memberName}</strong> 
                — ${m.memberSex}, <span class="dob">DOB: ${m.memberDOB} — ${
                m.memberCountry
              }, ${m.memberRegion}</span>
              </p>`
            )
            .join("")}
      `;
    } else if (reg.registrationType === "individual") {
      html += `
        <p><strong>Registration No:</strong> ${reg.registrationNumber}</p>
        <p><strong>Type:</strong> Individual</p>
        <p><strong>Full Name:</strong> ${reg.fullName}</p>
        <p><strong>Sex:</strong> ${reg.sex}</p>
        <p><strong>Date of Birth:</strong> ${reg.dateOfBirth}</p>
        <p><strong>Country:</strong> ${reg.country}</p>
        <p><strong>Region:</strong> ${reg.region}</p>
        <p><strong>Email:</strong> ${reg.email}</p>
        <p><strong>Contact:</strong> ${reg.contactNumber}</p>
        <p><strong>Date of Registration:</strong> ${reg.dateOfRegistration}</p>
      `;
    }

    registrationDetailsDiv.innerHTML = html;

    // --- Fetch attendance records ---
    const attendanceRef = collection(db, "attendance");
    const attQuery = query(
      attendanceRef,
      where("registrationNumber", "==", regNo)
    );
    const attSnap = await getDocs(attQuery);

    if (attSnap.empty) {
      attendanceList.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">No check-ins found.</td></tr>`;
    } else {
      attendanceList.innerHTML = "";
      attSnap.forEach((doc) => {
        const a = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${a.name || "-"}</td>
          <td>${a.age}</td>
          <td>${a.sex || "-"}</td>
          <td>${a.nationality || "-"}</td>
          <td>${a.region || "-"}</td>
          <td>${a.site || "-"}</td>
          <td>${
            a.timestamp?.toDate
              ? a.timestamp.toDate().toLocaleDateString()
              : a.timestamp?.split(" at ")[0] || "-"
          }</td>
        `;
        attendanceList.appendChild(tr);
      });
    }
  } catch (err) {
    console.error("Error loading modal:", err);
    registrationDetailsDiv.innerHTML = `<p style="color:red;">Failed to load details.</p>`;
  }
}

// === GROUPS SECTION ===
const groupsList = document.getElementById("groupsList");
const groupModal = document.getElementById("groupModal");
const closeGroupModal = document.getElementById("closeGroupModal");
const groupDetailsDiv = document.getElementById("groupDetails");
const membersList = document.getElementById("membersList");
const addMemberBtn = document.getElementById("addMemberBtn");

let currentUserDocId = null;
let userGroups = [];

// === Load Groups from Firestore ===
async function loadGroupsFromFirestore() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  groupsList.innerHTML = `
    <tr><td colspan="3" style="text-align:center; color:#888;">Loading groups...</td></tr>
  `;

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      groupsList.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">No user data found.</td></tr>`;
      return;
    }

    const userDoc = snap.docs[0];
    currentUserDocId = userDoc.id;

    const userData = userDoc.data();
    userGroups = userData.groups || [];

    if (!userGroups.length) {
      groupsList.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">No groups found.</td></tr>`;
      return;
    }

    renderGroupsTable();
  } catch (err) {
    console.error("Error loading groups:", err);
    groupsList.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">Failed to load groups.</td></tr>`;
  }
}

// === Render Groups Table ===
function renderGroupsTable() {
  groupsList.innerHTML = "";
  userGroups.forEach((group, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${group.groupName}</td>
      <td>${group.members?.length || 0}</td>
      <td class="group-action">
      <button class="view-btn" data-id="${index}">View</button>
      <button class="view-btn" style="background: var(--secondary);" data-edit="${index}">Edit</button>
      <button class="view-btn" style="background: red;" data-delete="${index}">Delete</button>
    </td>
    `;
    groupsList.appendChild(tr);
  });

  // === VIEW GROUP ===
  groupsList.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      openGroupModal(+e.target.dataset.id, false);
    });
  });

  // === EDIT GROUP ===
  groupsList.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      openGroupModal(+e.target.dataset.edit, true);
    });
  });

  // === DELETE GROUP ===
  groupsList.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const index = +e.target.dataset.delete;
      const group = userGroups[index];

      const result = await Swal.fire({
        icon: "warning",
        title: "Delete Group?",
        text: `Are you sure you want to delete "${group.groupName}"? This cannot be undone.`,
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        userGroups.splice(index, 1); // remove group from array
        await saveGroupsToFirestore(); // save changes to Firestore

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `"${group.groupName}" has been deleted.`,
        });

        renderGroupsTable(); // refresh UI
      }
    });
  });
}

// === Add New Group ===
const addGroupBtn = document.getElementById("addGroupBtn");

addGroupBtn.addEventListener("click", async () => {
  const { value: groupName } = await Swal.fire({
    title: "Add New Group",
    input: "text",
    inputLabel: "Group Name",
    inputPlaceholder: "Enter group name",
    showCancelButton: true,
    confirmButtonText: "Add",
    inputValidator: (value) => {
      if (!value.trim()) return "Group name cannot be empty.";
      if (
        userGroups.some(
          (g) => g.groupName.toLowerCase() === value.trim().toLowerCase()
        )
      ) {
        return "A group with this name already exists.";
      }
    },
  });

  if (!groupName) return;

  const newGroup = {
    groupName: groupName.trim(),
    members: [],
  };

  userGroups.push(newGroup);
  await saveGroupsToFirestore();

  Swal.fire({
    icon: "success",
    title: "Group Added!",
    text: `"${groupName}" has been added successfully.`,
  });

  renderGroupsTable();
});

// === Open Group Modal ===
function openGroupModal(groupIndex, isEditing = false) {
  const group = userGroups[groupIndex];
  if (!group) return;

  groupModal.style.display = "flex";

  // Group details
  groupDetailsDiv.innerHTML = `
    <p><strong>Group Name:</strong> ${group.groupName}</p>
    <p><strong>Total Members:</strong> ${group.members?.length || 0}</p>
  `;

  // Render members
  membersList.innerHTML = "";
  if (!group.members?.length) {
    membersList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">No members found.</td></tr>`;
  } else {
    group.members.forEach((m, i) => {
      const tr = document.createElement("tr");
      const today = new Date().toISOString().split("T")[0];

      if (isEditing) {
        tr.innerHTML = `
          <td><input type="text" value="${
            m.memberName || ""
          }" placeholder="Full Name" required></td>
          <td>
            <select required>
              <option value="">Select</option>
              <option value="Male" ${
                m.memberSex === "Male" ? "selected" : ""
              }>Male</option>
              <option value="Female" ${
                m.memberSex === "Female" ? "selected" : ""
              }>Female</option>
            </select>
          </td>
          <td><input type="date" class="form-field" value="${
            m.memberDOB || ""
          }" max="${today}" required></td>
          <td>
            <select class="member-country" required>
              <option value="">Select Country</option>
            </select>
          </td>
          <td>
            <select class="member-region" required>
              <option value="">Select Region</option>
            </select>
          </td>
          <td>
            <button class="view-btn remove-btn" data-index="${i}" style="background:red;">Remove</button>
          </td>
        `;

        membersList.appendChild(tr);

        // === Populate Country + Region ===
        const countrySelect = tr.querySelector(".member-country");
        const regionSelect = tr.querySelector(".member-region");

        // Populate countries
        countries.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.name;
          opt.textContent = c.name;
          if (c.name === m.memberCountry) opt.selected = true;
          countrySelect.appendChild(opt);
        });

        function setupCountryChangeGroups(countrySelect, regionSelect) {
          countrySelect.addEventListener("change", () => {
            const selectedCountry = countrySelect.value;

            // Clear existing regions
            regionSelect.innerHTML = "";

            if (selectedCountry === "Philippines") {
              // Enable and populate regions
              regionSelect.disabled = false;
              regionSelect.innerHTML = `<option value="">Select Region</option>`;
              philippinesRegions.forEach((region) => {
                const opt = document.createElement("option");
                opt.value = region;
                opt.textContent = region;
                regionSelect.appendChild(opt);
              });
            } else {
              // Disable and show N/A
              regionSelect.disabled = true;
              regionSelect.innerHTML = `<option value="N/A" selected>N/A</option>`;
            }
          });

          // Initial state based on saved country
          if (countrySelect.value === "Philippines") {
            regionSelect.disabled = false;
            regionSelect.innerHTML = `<option value="">Select Region</option>`;
            philippinesRegions.forEach((region) => {
              const opt = document.createElement("option");
              opt.value = region;
              opt.textContent = region;
              regionSelect.appendChild(opt);
            });
          } else {
            regionSelect.disabled = true;
            regionSelect.innerHTML = `<option value="N/A" selected>N/A</option>`;
          }
        }

        // Handle region population
        setupCountryChangeGroups(countrySelect, regionSelect);

        // Restore region if existing
        if (m.memberCountry === "Philippines" && m.memberRegion) {
          regionSelect.value = m.memberRegion;
        }
      } else {
        // View mode
        tr.innerHTML = `
          <td>${m.memberName || ""}</td>
          <td>${m.memberSex || ""}</td>
          <td>${m.memberDOB || ""}</td>
          <td>${m.memberCountry || ""}</td>
          <td>${m.memberRegion || ""}</td>
          <td>-</td>
        `;
        membersList.appendChild(tr);
      }
    });

    if (isEditing) {
      // Remove member
      membersList.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const idx = +e.target.dataset.index;
          group.members.splice(idx, 1);
          openGroupModal(groupIndex, true);
        });
      });
    }
  }

  // Add member button
  addMemberBtn.style.display = isEditing ? "block" : "none";
  addMemberBtn.onclick = () => {
    group.members = group.members || [];

    // Save current input values for existing members
    membersList.querySelectorAll("tr").forEach((row, i) => {
      const inputs = row.querySelectorAll("input, select");
      if (!inputs.length) return;

      group.members[i].memberName = inputs[0].value;
      group.members[i].memberSex = inputs[1].value;
      group.members[i].memberDOB = inputs[2].value;
      group.members[i].memberCountry = inputs[3].value;
      group.members[i].memberRegion = inputs[4].value;
    });

    // Add new empty member
    group.members.push({
      memberName: "",
      memberSex: "",
      memberDOB: "",
      memberCountry: userPersonalDetails.country || "",
      memberRegion: userPersonalDetails.region || "",
    });

    // Re-render modal with the new member
    openGroupModal(groupIndex, true);
  };

  // Save button
  const saveBtn = document.getElementById("saveGroupBtn");

  if (isEditing) {
    saveBtn.style.display = "inline-block";

    saveBtn.onclick = async () => {
      let isValid = true;

      for (let i = 0; i < group.members.length; i++) {
        const m = group.members[i];
        const row = membersList.rows[i];
        if (!row) continue;

        // Get values
        const name = row.cells[0].querySelector("input").value.trim();
        const sex = row.cells[1].querySelector("select").value;
        const dob = row.cells[2].querySelector("input").value;
        const country = row.cells[3]
          .querySelector(".member-country")
          .value.trim();
        const region = row.cells[4]
          .querySelector(".member-region")
          .value.trim();

        // === Required Fields ===
        if (!name || !sex || !dob || !country || !region) {
          Swal.fire({
            icon: "error",
            title: "Incomplete Form",
            text: "Please fill in all required fields before saving.",
          });
          isValid = false;
          break;
        }

        // === Name Validation ===
        const nameParts = name.split(/\s+/);
        if (nameParts.length < 2) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Name",
            text: "Please enter a full name with at least two words.",
          });
          isValid = false;
          break;
        }

        // === Sex Validation ===
        if (sex !== "Male" && sex !== "Female") {
          Swal.fire({
            icon: "warning",
            title: "Invalid Sex",
            text: "Please select either Male or Female.",
          });
          isValid = false;
          break;
        }

        // === DOB Validation ===
        if (dob) {
          const birthDate = new Date(dob);
          const today = new Date();

          if (birthDate > today) {
            Swal.fire({
              icon: "warning",
              title: "Invalid Date of Birth",
              text: "Date of birth cannot be in the future.",
            });
            isValid = false;
            break;
          }

          // Calculate age
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          // Check age range
          if (age < 0 || age > 90) {
            Swal.fire({
              icon: "warning",
              title: "Invalid Age",
              text: "Member's age must be between 0 and 90 years.",
            });
            isValid = false;
            break;
          }
        }

        // Update values if valid
        m.memberName = name;
        m.memberSex = sex;
        m.memberDOB = dob;
        m.memberCountry = country;
        m.memberRegion = region;
      }

      if (!isValid) return;

      // === Save to Firestore ===
      await saveGroupsToFirestore();

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Group members updated successfully.",
      });

      groupModal.style.display = "none";
    };
  } else {
    saveBtn.style.display = "none";
  }

  // Close modal
  closeGroupModal.onclick = () => {
    groupModal.style.display = "none";
  };
}

// === Close Modal by clicking outside ===
window.addEventListener("click", (e) => {
  if (e.target === groupModal) groupModal.style.display = "none";
});

// === Save updated groups to Firestore ===
async function saveGroupsToFirestore() {
  if (!currentUserDocId) return;

  try {
    const userRef = doc(db, "users", currentUserDocId);

    // Update the groups array
    await updateDoc(userRef, { groups: userGroups });

    console.log("Groups updated successfully!");

    // Re-render table after saving
    renderGroupsTable();
  } catch (err) {
    console.error("Error saving groups:", err);
  }
}
