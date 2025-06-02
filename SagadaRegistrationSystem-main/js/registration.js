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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("registrationForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const isGroup =
        document.getElementById("groupRegistration").value === "group";
      const registrationNumber = `REG-${Date.now()}${isGroup ? "-G" : "-I"}`;

      const formData = {
        registrationNumber: registrationNumber,
        dateOfRegistration: isGroup
          ? document.getElementById("groupDateOfRegistration").value
          : document.getElementById("dateOfRegistration").value,
        registrationType: isGroup ? "group" : "individual",
      };

      if (isGroup) {
        formData.groupName = document.getElementById("groupName").value;
        formData.groupSize = document.getElementById("groupSize").value;
        formData.groupCountry = document.getElementById("groupCountry").value;
        formData.groupRegion = document.getElementById("groupRegion").value;
        formData.groupContact = document.getElementById("groupPhone").value; // Corrected ID
        formData.groupEmail = document.getElementById("groupEmail").value;

        const members = [];
        for (let i = 1; i <= formData.groupSize; i++) {
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
        formData.contactNumber = document.getElementById("phone").value; // Corrected ID
        formData.email = document.getElementById("email").value;
      }

      // Handle photo upload
      const photoFile = isGroup
        ? document.getElementById("groupPhoto").files[0]
        : document.getElementById("uploadPhoto").files[0];
      if (photoFile) {
        convertToBase64(photoFile, (base64Photo) => {
          formData.photo = base64Photo;
          submitToFirestore(formData, registrationNumber);
        });
      } else {
        formData.photo = null;
        submitToFirestore(formData, registrationNumber);
      }
    });
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
  if (data.groupMembers) {
    data.groupMembers = data.groupMembers
      .map(
        (m, i) => `${i + 1}. ${m.memberName} - ${m.memberDOB} (${m.memberSex})`
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
    groupMembers: data.groupMembers || "",

    to_email: data.registrationType === "group" ? data.groupEmail : data.email,
  };

  const recipient =
    data.registrationType === "group" ? data.groupEmail : data.email;

  // Select template ID based on registration type
  const templateId =
    data.registrationType === "group" ? "template_thgy9tk" : "template_apl5f9g";

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
function submitToFirestore(formData, registrationNumber) {
  addDoc(collection(db, "registrations"), formData)
    .then(() => {
      // Send email using EmailJS
      sendEmailConfirmation(formData);

      //alert(`Registration successful! Your registration number is: ${registrationNumber}`);
      displayRegistration(formData);
      document.getElementById("registrationForm").reset();
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      alert("Failed to submit registration. Please try again.");
    });
}

// Display registration details
function displayRegistration(data) {
  const displayDiv = document.getElementById("registrationDisplay");
  if (displayDiv) {
    displayDiv.innerHTML = `
            <h2>Registration Successful</h2>
            <p><strong>Registration Number:</strong> ${
              data.registrationNumber
            }</p>
            <p><strong>Date of Registration:</strong> ${
              data.dateOfRegistration
            }</p>
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
        `;
  }
}
