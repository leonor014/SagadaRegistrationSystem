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
  Timestamp
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

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const noticeModal = document.getElementById("noticeModal");
  const acknowledgeButton = document.getElementById("acknowledgeButton");
  const successModal = document.getElementById("successModal");
  const successModalContent = document.getElementById("successModalContent");
  const loadingModal = document.getElementById("loadingModal");

  // Show notice modal on load
  if (noticeModal) noticeModal.style.display = "block";

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

    // show/hide forms depending on selection
    function handleSelectionChange() {
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

        // Disable group fields
        groupDateEl.required = false;
        groupEmailEl.required = false;
        groupPhoneEl.required = false;
      } else if (val === "group") {
        individualForm.style.display = "none";
        groupForm.style.display = "block";
        syncGroupContactInfo();

        // Enable group required fields
        groupDateEl.required = true;
        groupEmailEl.required = true;
        groupPhoneEl.required = true;

        // Disable individual fields
        document.getElementById("fullName").required = false;
        document.getElementById("dateOfBirth").required = false;
        document.getElementById("dateOfRegistration").required = false;
      } else {
        individualForm.style.display = "none";
        groupForm.style.display = "none";

        // Disable all required
        document.getElementById("fullName").required = false;
        document.getElementById("dateOfBirth").required = false;
        document.getElementById("dateOfRegistration").required = false;
        groupDateEl.required = false;
        groupEmailEl.required = false;
        groupPhoneEl.required = false;
      }
    }

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
            <input type="text" value="${escapeHtml(name)}" disabled>
            <label>DOB:</label>
            <input type="date" value="${escapeHtml(dob)}" disabled>
            <label>Sex:</label>
            <input type="text" value="${escapeHtml(sex)}" disabled>
            <br/>
            <br/>
            <hr>
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
      const domain = email.split("@")[1] || "";
      const allowed = ["gmail.com", "yahoo.com", "outlook.com"];
      return allowed.includes(domain);
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

    const dobEl = document.getElementById("dateOfBirth");
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

    const phoneEl = document.getElementById("phone");
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
