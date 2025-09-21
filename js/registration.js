import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
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
  { name: "Zimbabwe", code: "ZW", dial: "+263" }
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
      // const photoFile = isGroup
        // ? document.getElementById("groupPhoto").files[0]
        // : document.getElementById("uploadPhoto").files[0];

      //const finalizeSubmission = (base64Photo) => {
        //formData.photo = base64Photo || null;

        // Submit to Firestore (your implementation here)
        submitToFirestore(formData, registrationNumber, submitButton);

        // Reset UI
        document.getElementById("individualForm").style.display = "none";
        document.getElementById("groupForm").style.display = "none";
        document.getElementById("registrationForm").reset();
      //};

      //if (photoFile) {
        //convertToBase64(photoFile, finalizeSubmission);
      //} else {
        //finalizeSubmission(null);
      //}
    });

  // Convert file to Base64
  //function convertToBase64(file, callback) {
    //const reader = new FileReader();
    //reader.onloadend = function () {
      //callback(reader.result);
    //};
    //reader.readAsDataURL(file);
  //}

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