import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.appspot.com",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
  // Modal and other initializations...
  const modal = document.getElementById("noticeModal");
  const acknowledgeButton = document.getElementById("acknowledgeButton");
  const closeButton = document.querySelector(".close");

  // Show modal on page load
  modal.style.display = "block";

  // Close modal when user clicks "I Understand"
  acknowledgeButton.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when user clicks the close button
  closeButton.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when user clicks outside the modal
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

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
    { name: "China", code: "CN", dial: "+86" },
    { name: "France", code: "FR", dial: "+33" },
    { name: "Germany", code: "DE", dial: "+49" },
    { name: "India", code: "IN", dial: "+91" },
    { name: "Japan", code: "JP", dial: "+81" },
    { name: "Myanmar", code: "MM", dial: "+95" },
    { name: "Philippines", code: "PH", dial: "+63" },
    { name: "United Kingdom", code: "GB", dial: "+44" },
    { name: "United States of America", code: "US", dial: "+1" },
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

  // Populate country dropdowns
  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.name;
    option.textContent = `${country.name} (${country.dial})`;
    countrySelect.appendChild(option);

    const groupOption = document.createElement("option");
    groupOption.value = country.name;
    groupOption.textContent = `${country.name} (${country.dial})`;
    groupCountrySelect.appendChild(groupOption);
  });

  // Handle group or individual selection
  const groupRegistration = document.getElementById("groupRegistration");
  if (groupRegistration) {
    groupRegistration.addEventListener("change", function () {
      const individualForm = document.getElementById("individualForm");
      const groupForm = document.getElementById("groupForm");
      const individualFields = individualForm.querySelectorAll("[required]");
      const groupFields = groupForm.querySelectorAll("[required]");

      if (this.value === "individual") {
        individualForm.style.display = "block";
        groupForm.style.display = "none";
        individualFields.forEach((field) => field.setAttribute("required", ""));
        groupFields.forEach((field) => field.removeAttribute("required"));
      } else if (this.value === "group") {
        individualForm.style.display = "none";
        groupForm.style.display = "block";
        groupFields.forEach((field) => field.setAttribute("required", ""));
        individualFields.forEach((field) => field.removeAttribute("required"));
        generateGroupMemberFields();
      } else {
        individualForm.style.display = "none";
        groupForm.style.display = "none";
        individualFields.forEach((field) => field.removeAttribute("required"));
        groupFields.forEach((field) => field.removeAttribute("required"));
      }
    });
  }

  // Update regions and phone number based on selected country
  function updateCountrySelection(selectElement, phoneInput, regionSelect) {
    selectElement.addEventListener("change", function () {
      const selectedCountry = this.value;
      const selectedCode =
        countries.find((c) => c.name === selectedCountry)?.dial || "+";
      phoneInput.value = selectedCode + " ";

      regionSelect.innerHTML = "";
      let regions =
        selectedCountry === "Philippines"
          ? philippinesRegions
          : ["Region not applicable"];

      regions.forEach((region) => {
        const option = document.createElement("option");
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
      });
    });
  }

  // Apply country selection logic to both forms
  updateCountrySelection(countrySelect, phoneInput, regionSelect);
  updateCountrySelection(
    groupCountrySelect,
    groupPhoneInput,
    groupRegionSelect
  );

  // Generate group member fields
  function generateGroupMemberFields() {
    const groupSizeInput = document.getElementById("groupSize");
    const groupMembersDiv = document.getElementById("groupMembers");

    groupSizeInput.addEventListener("input", () => {
      const numberOfMembers = parseInt(groupSizeInput.value, 10);
      groupMembersDiv.innerHTML = "";

      for (let i = 1; i <= numberOfMembers; i++) {
        const memberDiv = document.createElement("div");
        memberDiv.style.marginBottom = "15px";

        memberDiv.innerHTML = `
                            <h4>Member ${i}:</h4>
                            <label>Full Name:</label>
                            <input type="text" id="memberName${i}" name="memberName${i}" placeholder="Enter full name" required>
                            <span class="error-message" id="memberName${i}Error"></span>

                            <label>Date of Birth:</label>
                            <input type="date" id="memberDOB${i}" name="memberDOB${i}" required>
                            <span class="error-message" id="memberDOB${i}Error"></span>

                            <label>Sex:</label>
                            <select id="memberSex${i}" name="memberSex${i}" required>
                                <option value="">Select sex</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <span class="error-message" id="memberSex${i}Error"></span>
                        `;

        groupMembersDiv.appendChild(memberDiv);

        // Add real-time validation for Full Name
        document
          .querySelector(`input[name='memberName${i}']`)
          .addEventListener("input", function () {
            const errorElement = document.getElementById(`memberName${i}Error`);
            if (!validateFullName(this.value)) {
              errorElement.textContent =
                "Full name must contain at least two words with letters only.";
              errorElement.style.display = "block";
              this.classList.add("error-input");
            } else {
              errorElement.style.display = "none";
              this.classList.remove("error-input");
            }
          });

        // Add real-time validation for Date of Birth
        document
          .querySelector(`input[name='memberDOB${i}']`)
          .addEventListener("input", function () {
            const errorElement = document.getElementById(`memberDOB${i}Error`);
            if (!validateDateOfBirth(this.value)) {
              errorElement.textContent =
                "Date of birth should not be more than 150 years old.";
              errorElement.style.display = "block";
              this.classList.add("error-input");
            } else {
              errorElement.style.display = "none";
              this.classList.remove("error-input");
            }
          });
      }
    });
  }

  // Validation functions
  function validateDateOfRegistration(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of the day
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0); // Reset time
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);

    return inputDate >= today && inputDate <= maxDate;
  }

  function validateFullName(name) {
    return /^[A-Za-z]{2,}(?:\s[A-Za-z]{2,})+$/.test(name); // Ensures at least two words with letters only
  }

  function validateDateOfBirth(date) {
    const today = new Date();
    const inputDate = new Date(date);
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() - 150);

    return inputDate <= today && inputDate >= maxDate;
  }

  function validateContactNumber(number, country) {
    const length = number.length;
    return length >= 7 && length <= 15;
  }

  function validateEmail(email) {
    const validDomains = ["gmail.com", "yahoo.com", "outlook.com"];
    const domain = email.split("@")[1];
    return validDomains.includes(domain);
  }

  function validateGroupContactNumber(number, country) {
    const length = number.length;
    return length >= 7 && length <= 15;
  }

  // Real-time validation for Group Email
  document.getElementById("groupEmail").addEventListener("input", function () {
    const groupEmailError = document.getElementById("groupEmailError");
    if (!validateEmail(this.value)) {
      groupEmailError.textContent =
        "Please enter a valid email address with a valid domain (e.g., gmail.com, yahoo.com, outlook.com).";
      groupEmailError.style.display = "block";
      this.classList.add("error-input");
    } else {
      groupEmailError.style.display = "none";
      this.classList.remove("error-input");
    }
  });

  function validateGroupSize(size) {
    return size >= 2;
  }

  // Real-time validation for Full Name (Individual)
  document.getElementById("fullName").addEventListener("input", function () {
    const fullNameError = document.getElementById("fullNameError");
    if (!validateFullName(this.value)) {
      fullNameError.textContent =
        "Full name must contain at least two words with letters only.";
      fullNameError.style.display = "block";
      this.classList.add("error-input");
    } else {
      fullNameError.style.display = "none";
      this.classList.remove("error-input");
    }
  });

  // Real-time validation for Group Name
  document.getElementById("groupName").addEventListener("input", function () {
    const groupNameError = document.getElementById("groupNameError");
    if (!validateFullName(this.value)) {
      groupNameError.textContent =
        "Group name must contain at least two words with letters only.";
      groupNameError.style.display = "block";
      this.classList.add("error-input");
    } else {
      groupNameError.style.display = "none";
      this.classList.remove("error-input");
    }
  });

  // Real-time validation for Date of Registration (Individual)
  document
    .getElementById("dateOfRegistration")
    .addEventListener("input", function () {
      const dateOfRegistrationError = document.getElementById(
        "dateOfRegistrationError"
      );
      if (!validateDateOfRegistration(this.value)) {
        dateOfRegistrationError.textContent =
          "Date of registration should be today or within the month.";
        dateOfRegistrationError.style.display = "block";
        this.classList.add("error-input");
      } else {
        dateOfRegistrationError.style.display = "none";
        this.classList.remove("error-input");
      }
    });

  // Real-time validation for Group Date of Registration
  document
    .getElementById("groupDateOfRegistration")
    .addEventListener("input", function () {
      const groupDateOfRegistrationError = document.getElementById(
        "groupDateOfRegistrationError"
      );
      if (!validateDateOfRegistration(this.value)) {
        groupDateOfRegistrationError.textContent =
          "Date of registration should be today or within the month.";
        groupDateOfRegistrationError.style.display = "block";
        this.classList.add("error-input");
      } else {
        groupDateOfRegistrationError.style.display = "none";
        this.classList.remove("error-input");
      }
    });

  // Real-time validation for Date of Birth (Individual)
  document.getElementById("dateOfBirth").addEventListener("input", function () {
    const dateOfBirthError = document.getElementById("dateOfBirthError");
    if (!validateDateOfBirth(this.value)) {
      dateOfBirthError.textContent =
        "Date of birth should not be more than 150 years old.";
      dateOfBirthError.style.display = "block";
      this.classList.add("error-input");
    } else {
      dateOfBirthError.style.display = "none";
      this.classList.remove("error-input");
    }
  });

  // Real-time validation for Group Member Date of Birth
  document.querySelectorAll("input[name^='memberDOB']").forEach((input) => {
    input.addEventListener("input", function () {
      const errorElement = document.getElementById(`${this.name}Error`);
      if (!validateDateOfBirth(this.value)) {
        errorElement.textContent =
          "Date of birth should not be more than 150 years old.";
        errorElement.style.display = "block";
        this.classList.add("error-input");
      } else {
        errorElement.style.display = "none";
        this.classList.remove("error-input");
      }
    });
  });

  document
    .getElementById("registrationForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const isGroup =
        document.getElementById("groupRegistration").value === "group";
      const formToValidate = isGroup
        ? document.getElementById("groupForm")
        : document.getElementById("individualForm");
      const dateOfRegistration = isGroup
        ? document.getElementById("groupDateOfRegistration").value
        : document.getElementById("dateOfRegistration").value;
      const fullName = isGroup
        ? document.getElementById("groupName").value
        : document.getElementById("fullName").value;
      const dateOfBirth = isGroup
        ? document.querySelector("input[name='memberDOB1']").value
        : document.getElementById("dateOfBirth").value;
      const contactNumber = isGroup
        ? document.getElementById("groupPhone").value
        : document.getElementById("phone").value;
      const email = isGroup
        ? document.getElementById("groupEmail").value
        : document.getElementById("email").value;
      const groupSize = isGroup
        ? document.getElementById("groupSize").value
        : null;

      let isValid = true;

      // Basic validation
      if (!validateDateOfRegistration(dateOfRegistration)) {
        const errorId = isGroup
          ? "groupDateOfRegistrationError"
          : "dateOfRegistrationError";
        document.getElementById(errorId).textContent =
          "Date of registration should be today or within the month.";
        document.getElementById(errorId).style.display = "block";
        document
          .getElementById(
            isGroup ? "groupDateOfRegistration" : "dateOfRegistration"
          )
          .classList.add("error-input");
        isValid = false;
      }

      if (!validateFullName(fullName)) {
        const errorId = isGroup ? "groupNameError" : "fullNameError";
        document.getElementById(errorId).textContent =
          "Please enter a valid full name.";
        document.getElementById(errorId).style.display = "block";
        document
          .getElementById(isGroup ? "groupName" : "fullName")
          .classList.add("error-input");
        isValid = false;
      }

      if (!validateDateOfBirth(dateOfBirth)) {
        const errorId = isGroup ? "memberDOB1Error" : "dateOfBirthError";
        document.getElementById(errorId).textContent =
          "Date of birth should not be more than 150 years old.";
        document.getElementById(errorId).style.display = "block";
        document
          .getElementById(isGroup ? "memberDOB1" : "dateOfBirth")
          .classList.add("error-input");
        isValid = false;
      }

      if (
        !validateContactNumber(
          contactNumber,
          isGroup
            ? document.getElementById("groupCountry").value
            : document.getElementById("country").value
        )
      ) {
        const errorId = isGroup ? "groupPhoneError" : "phoneError";
        document.getElementById(errorId).textContent =
          "Contact number should be between 7 and 15 digits.";
        document.getElementById(errorId).style.display = "block";
        document
          .getElementById(isGroup ? "groupPhone" : "phone")
          .classList.add("error-input");
        isValid = false;
      }

      if (isGroup && !validateGroupSize(groupSize)) {
        document.getElementById("groupSizeError").textContent =
          "Number of members should be at least 2.";
        document.getElementById("groupSizeError").style.display = "block";
        document.getElementById("groupSize").classList.add("error-input");
        isValid = false;
      }

      // Required field check
      const requiredFields = formToValidate.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("error-input");
          const errorElement = document.getElementById(`${field.id}Error`);
          if (errorElement) {
            errorElement.textContent = "This field is required.";
            errorElement.style.display = "block";
          }
        }
      });

      // Validate group members
      if (isGroup) {
        for (let i = 1; i <= groupSize; i++) {
          const memberName = document.querySelector(
            `input[name='memberName${i}']`
          );
          const memberDOB = document.querySelector(
            `input[name='memberDOB${i}']`
          );
          const memberSex = document.querySelector(
            `select[name='memberSex${i}']`
          );

          if (!memberName.value.trim()) {
            isValid = false;
            memberName.classList.add("error-input");
            document.getElementById(`memberName${i}Error`).textContent =
              "This field is required.";
            document.getElementById(`memberName${i}Error`).style.display =
              "block";
          }
          if (!memberDOB.value.trim()) {
            isValid = false;
            memberDOB.classList.add("error-input");
            document.getElementById(`memberDOB${i}Error`).textContent =
              "This field is required.";
            document.getElementById(`memberDOB${i}Error`).style.display =
              "block";
          }
          if (!memberSex.value.trim()) {
            isValid = false;
            memberSex.classList.add("error-input");
            document.getElementById(`memberSex${i}Error`).textContent =
              "This field is required.";
            document.getElementById(`memberSex${i}Error`).style.display =
              "block";
          }
        }
      }

      if (!isValid) {
        alert("Please fill out all required fields correctly.");
        return;
      }

      const submitButton = document.querySelector("button[type='submit']");
      submitButton.disabled = true;
      document.getElementById("loadingModal").classList.remove("hidden");

      const registrationNumber = `REG-${Date.now()}${isGroup ? "-G" : "-I"}`;
      const formData = {
        registrationNumber,
        dateOfRegistration,
        registrationType: isGroup ? "group" : "individual",
      };

      if (isGroup) {
        formData.groupName = document.getElementById("groupName").value;
        formData.groupSize = groupSize;
        formData.groupCountry = document.getElementById("groupCountry").value;
        formData.groupRegion = document.getElementById("groupRegion").value;
        formData.groupContact = document.getElementById("groupPhone").value;
        formData.groupEmail = document.getElementById("groupEmail").value;

        const members = [];
        for (let i = 1; i <= groupSize; i++) {
          members.push({
            memberName: document.querySelector(`[name="memberName${i}"]`).value,
            memberDOB: document.querySelector(`[name="memberDOB${i}"]`).value,
            memberSex: document.querySelector(`[name="memberSex${i}"]`).value,
          });
        }
        formData.groupMembers = members;
      } else {
        formData.fullName = document.getElementById("fullName").value;
        formData.dateOfBirth = document.getElementById("dateOfBirth").value;
        formData.sex = document.getElementById("sex").value;
        formData.country = document.getElementById("country").value;
        formData.region = document.getElementById("region").value;
        formData.contactNumber = document.getElementById("phone").value;
        formData.email = document.getElementById("email").value;
      }

      // Handle photo upload
      const photoFile = isGroup
        ? document.getElementById("groupPhoto").files[0]
        : document.getElementById("uploadPhoto").files[0];

      const finalizeSubmission = (base64Photo) => {
        formData.photo = base64Photo || null;

        // Submit to Firestore (your implementation here)
        submitToFirestore(formData, registrationNumber, submitButton);

        // Reset UI
        document.getElementById("individualForm").style.display = "none";
        document.getElementById("groupForm").style.display = "none";
        document.getElementById("registrationForm").reset();
      };

      if (photoFile) {
        convertToBase64(photoFile, finalizeSubmission);
      } else {
        finalizeSubmission(null);
      }
    });

  // Convert file to Base64
  function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function sendEmailConfirmation(data) {
    let formattedGroupMembers = "";

    if (Array.isArray(data.groupMembers)) {
      formattedGroupMembers = data.groupMembers
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
      groupMembers: formattedGroupMembers,

      to_email:
        data.registrationType === "group" ? data.groupEmail : data.email,
    };

    const recipient =
      data.registrationType === "group" ? data.groupEmail : data.email;

    // Select template ID based on registration type
    const templateId =
      data.registrationType === "group"
        ? "template_thgy9tk"
        : "template_apl5f9g";

    emailjs
      .send("service_3jq81ej", templateId, emailParams)
      .then(() => {
        console.log("Confirmation email sent to", recipient);
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
      });
  }

  // Submit data to Firestore
  function submitToFirestore(formData, registrationNumber, submitButton) {
    addDoc(collection(db, "registrations"), formData)
      .then(() => {
        // Send email using EmailJS
        sendEmailConfirmation(formData);

        //alert(`Registration successful! Your registration number is: ${registrationNumber}`);
        document.getElementById("registrationForm").reset();
        submitButton.disabled = false;
        submitButton.textContent = "Register";
        document.getElementById("loadingModal").classList.add("hidden");
        displayRegistration(formData);
      })
      .catch((error) => {
        console.error("Firestore error:", error);
        submitButton.disabled = false;
        submitButton.textContent = "Register";
        document.getElementById("loadingModal").classList.add("hidden");
      });
  }

  // Add this once in your JS file
  document.addEventListener("click", function (event) {
    const modal = document.getElementById("successModal");
    const content = document.getElementById("successModalContent");

    if (
      !modal.classList.contains("hidden") &&
      !content.contains(event.target)
    ) {
      modal.classList.add("hidden");
    }
  });

  // Display registration details
  function displayRegistration(data) {
    const modal = document.getElementById("successModal");
    const modalContent = document.getElementById("successModalContent");

    // Generate content
    modalContent.innerHTML = `
    <h2>Registration Successful</h2>
    <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
    <p><strong>Date of Registration:</strong> ${data.dateOfRegistration}</p>
    <p><strong>Registration Type:</strong> ${data.registrationType}</p>
    ${
      data.registrationType === "group"
        ? `
          <p><strong>Group Name:</strong> ${data.groupName}</p>
          <p><strong>Group Size:</strong> ${data.groupSize}</p>
          <p><strong>Country:</strong> ${data.groupCountry}</p>
          <p><strong>Region:</strong> ${data.groupRegion}</p>
          <p><strong>Contact:</strong> ${data.groupContact}</p>
          <p><strong>Email:</strong> ${data.groupEmail}</p>
          <h3>Group Members</h3>
          ${data.groupMembers
            .map(
              (member) => `
              <p>${member.memberName} - ${member.memberDOB} (${member.memberSex})</p>
          `
            )
            .join("")}
        `
        : `
          <p><strong>Full Name:</strong> ${data.fullName}</p>
          <p><strong>Date of Birth:</strong> ${data.dateOfBirth}</p>
          <p><strong>Sex:</strong> ${data.sex}</p>
          <p><strong>Country:</strong> ${data.country}</p>
          <p><strong>Region:</strong> ${data.region}</p>
          <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
          <p><strong>Email:</strong> ${data.email}</p>
        `
    }
    ${
      data.photo
        ? `<img src="${data.photo}" alt="Uploaded Photo" width="150" />`
        : ""
    }
    <br/><br/>
    <button id="closeModalBtn">Close</button>
  `;

    // Show the modal
    modal.classList.remove("hidden");

    // Attach event listener to Close button
    document.getElementById("closeModalBtn").addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
});
