import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

function addGuidelineInput(containerId, value = "") {
  const container = document.getElementById(containerId);

  const div = document.createElement("div");
  div.className = "guideline-item";
  div.innerHTML = `
    <input type="text" class="guideline-input" value="${value}" required />
    <button type="button" class="remove-guideline-btn" title="Remove"><i class="uil uil-times"></i></button>
  `;

  div.querySelector(".remove-guideline-btn").addEventListener("click", () => {
    div.remove();
  });

  container.appendChild(div);
}

document.getElementById("editAddGuidelineBtn").addEventListener("click", () => {
  addGuidelineInput("editGuidelinesContainer");
});

const loadTouristGuidelines = () => {
  const tableBody = document.getElementById("tourist-guidelinesTableBody");
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center;">Loading...</td>
    </tr>
  `;

  const user = auth.currentUser;
  if (!user) return;

  const touristGuidelinesQuery = query(
    collection(db, "tourist-guidelines"),
    orderBy("createdAt", "desc")
  );

  // Listen for real-time updates
  onSnapshot(
    touristGuidelinesQuery,
    (querySnapshot) => {
      tableBody.innerHTML = "";

      if (querySnapshot.empty) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No tourist guidelines found.</td>
        </tr>
      `;
        return;
      }

      let hasTouristGuidelines = false;

      querySnapshot.forEach((docSnap) => {
        const touristGuidelineId = docSnap.id;

        if (user && touristGuidelineId === user.uid) {
          return;
        }

        hasTouristGuidelines = true;
        const touristGuideline = docSnap.data();
        const tr = document.createElement("tr");

        const name = touristGuideline.name || "—";
        const guidelinesArray = touristGuideline.guidelines;
        const guidelines = Array.isArray(guidelinesArray)
          ? `<ul>${guidelinesArray.map((g) => `<li>${g}</li>`).join("")}</ul>`
          : guidelinesArray || "—";
        const createdAt =
          touristGuideline.createdAt?.toDate().toLocaleString() || "—";

        tr.innerHTML = `
        <td>${name}</td>
        <td>${guidelines}</td>
        <td>${createdAt}</td>
        <td>
          <button class="action-btn edit-btn" title="Edit" data-id="${touristGuidelineId}">
            <i class="uil uil-edit-alt"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${touristGuidelineId}">
            <i class="uil uil-trash-alt"></i>
          </button>
        </td>
      `;

        tableBody.appendChild(tr);
      });

      if (!hasTouristGuidelines) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No tourist guidelines found.</td>
        </tr>
      `;
      }

      bindEditAndDeleteButtons();
    },
    (error) => {
      console.error("Error loading real-time tourist guidelines:", error);
      tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: red;">
          Failed to load data.
        </td>
      </tr>
    `;
    }
  );
};

function bindEditAndDeleteButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      try {
        const touristGuidelineRef = doc(db, "tourist-guidelines", id);
        const touristGuidelineSnap = await getDoc(touristGuidelineRef);

        if (touristGuidelineSnap.exists()) {
          const touristGuidelineData = touristGuidelineSnap.data();
          document.getElementById("editTouristGuidelineId").value = id;
          document.getElementById("editTouristGuidelineName").value =
            touristGuidelineData.name || "";
          const guidelinesArray = Array.isArray(touristGuidelineData.guidelines)
            ? touristGuidelineData.guidelines
            : [];

          const container = document.getElementById("editGuidelinesContainer");
          container.innerHTML = "";
          guidelinesArray.forEach((g) =>
            addGuidelineInput("editGuidelinesContainer", g)
          );

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching tourist guideline for edit:", error);
        Swal.fire("Error!", "Could not load tourist guideline data.", "error");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This Tourist Guideline will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "tourist-guidelines", id));
          Swal.fire(
            "Deleted!",
            "Tourist Guideline has been deleted.",
            "success"
          );
        } catch (error) {
          console.error("Error deleting tourist guideline:", error);
          Swal.fire("Error!", "Failed to delete tourist guideline.", "error");
        }
      }
    });
  });
}

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
      } else {
        console.log("User document not found");
      }

      loadTouristGuidelines();
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("body");
  const modeToggle = body.querySelector(".mode-toggle");
  const sidebar = body.querySelector("nav");
  const sidebarToggle = body.querySelector(".sidebar-toggle");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutIcon = document.getElementById("logoutIcon");

  let getMode = localStorage.getItem("mode");
  if (getMode === "dark") {
    body.classList.add("dark");
  }

  let getStatus = localStorage.getItem("status");
  if (getStatus === "close") {
    sidebar.classList.add("close");
  }

  modeToggle?.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem(
      "mode",
      body.classList.contains("dark") ? "dark" : "light"
    );
  });

  sidebarToggle?.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    localStorage.setItem(
      "status",
      sidebar.classList.contains("close") ? "close" : "open"
    );
  });

  const logoutHandler = () => {
    Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You have been signed out.",
    }).then(async () => {
      try {
        await signOut(auth);
        localStorage.setItem("adminValidated", "false");
        window.location.href = "../login-register.html";
      } catch (error) {
        console.error("Logout error:", error);
        Swal.fire({
          icon: "error",
          title: "Logout Failed",
          text: "Something went wrong while logging out.",
        });
      }
    });
  };

  if (logoutBtn) logoutBtn.addEventListener("click", logoutHandler);
  if (logoutIcon) logoutIcon.addEventListener("click", logoutHandler);

  const normalize = (path) => path.replace(/\/+$/, "");

  const currentPath = normalize(window.location.pathname);

  document.querySelectorAll(".nav-links li a").forEach((link) => {
    const linkPath = normalize(link.pathname);
    if (linkPath === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  document.getElementById("searchInput").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll("#tourist-guidelinesTableBody tr");

    rows.forEach((row) => {
      const guidelineCell = row.querySelector("td:first-child");
      if (guidelineCell) {
        const text = guidelineCell.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      }
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").focus();
  });

  document
    .getElementById("addAddGuidelineBtn")
    .addEventListener("click", () => {
      addGuidelineInput("addGuidelinesContainer");
    });

  document
    .getElementById("editTouristGuidelineForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editTouristGuidelineId").value;
      const name = document
        .getElementById("editTouristGuidelineName")
        .value.trim();
      const guidelineInputs = document.querySelectorAll(
        "#editGuidelinesContainer .guideline-input"
      );
      const guidelines = Array.from(guidelineInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);

      if (!name || guidelines.length === 0) {
        Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
        return;
      }

      try {
        const updateData = {
          name,
          guidelines,
        };
        await setDoc(doc(db, "tourist-guidelines", id), updateData, {
          merge: true,
        });
        Swal.fire(
          "Success!",
          "Tourist Guideline updated successfully.",
          "success"
        );
        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating tourist guideline:", error);
        Swal.fire("Error!", "Failed to update tourist guideline.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

  document
    .getElementById("addTouristGuidelineBtn")
    .addEventListener("click", () => {
      document.getElementById("addModal").style.visibility = "visible";
      document.body.classList.add("modal-open");
    });

  document.getElementById("addModalClose").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
    document.getElementById("addTouristGuidelineForm").reset();
  });

  document
    .getElementById("addTouristGuidelineForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.querySelector(
        '#addTouristGuidelineForm button[type="submit"]'
      );
      submitBtn.disabled = true;

      const name = document
        .getElementById("addTouristGuidelineName")
        .value.trim();
      const guidelineInputs = document.querySelectorAll(
        "#addGuidelinesContainer .guideline-input"
      );
      const guidelines = Array.from(guidelineInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);

      if (!name || guidelines.length === 0) {
        Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
        submitBtn.disabled = false;
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) {
          Swal.fire("Error!", "User not authenticated.", "error");
          submitBtn.disabled = false;
          return;
        }

        const newGuidelineRef = doc(collection(db, "tourist-guidelines"));
        await setDoc(newGuidelineRef, {
          name,
          guidelines,
          createdAt: new Date(),
        });

        Swal.fire(
          "Success!",
          "Tourist Guideline added successfully.",
          "success"
        );

        document.getElementById("addTouristGuidelineForm").reset();
        document.getElementById("addModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error adding tourist guideline:", error);
        Swal.fire("Error!", "Failed to add tourist guideline.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
});
