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

function addAnalyticsInput(containerId, key = "", value = "") {
  const container = document.getElementById(containerId);

  const div = document.createElement("div");
  div.className = "analytics-item";
  div.innerHTML = `
    <input type="text" placeholder="Key" class="analytics-input" value="${key}" required />
    <input type="number" placeholder="Value" class="analytics-input" value="${value}" required />
    <button type="button" class="remove-analytics-btn" title="Remove"><i class="uil uil-times"></i></button>
  `;

  div.querySelector(".remove-analytics-btn").addEventListener("click", () => {
    div.remove();
  });

  container.appendChild(div);
}

document.getElementById("editAddAnalyticsBtn").addEventListener("click", () => {
  addAnalyticsInput("editAnalyticsContainer");
});

const loadAnalytics = () => {
  const tableBody = document.getElementById("analyticsTableBody");
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center;">Loading...</td>
    </tr>
  `;

  const user = auth.currentUser;
  if (!user) return;

  const AnalyticsQuery = query(
    collection(db, "analytics"),
    orderBy("createdAt", "desc")
  );

  // Listen for real-time updates
  onSnapshot(
    AnalyticsQuery,
    (querySnapshot) => {
      tableBody.innerHTML = "";

      if (querySnapshot.empty) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No analytics found.</td>
        </tr>
      `;
        return;
      }

      let hasAnalytics = false;

      querySnapshot.forEach((docSnap) => {
        const AnalyticsId = docSnap.id;

        if (user && AnalyticsId === user.uid) {
          return;
        }

        hasAnalytics = true;
        const Analytics = docSnap.data();
        const tr = document.createElement("tr");

        const title = Analytics.title || "—";
        const description = Analytics.description || "—";
        const type = Analytics.type || "—";
        const dataMap = Analytics.data || {};
        const analytics = Object.entries(dataMap).length
          ? `<ul>${Object.entries(dataMap)
              .map(([key, value]) => `<li>${key}: ${value}</li>`)
              .join("")}</ul>`
          : "—";
        const createdAt = Analytics.createdAt?.toDate().toLocaleString() || "—";

        tr.innerHTML = `
        <td>${title}</td>
        <td>${description}</td>
        <td>${type}</td>
        <td>${analytics}</td>
        <td>${createdAt}</td>
        <td>
          <button class="action-btn edit-btn" title="Edit" data-id="${AnalyticsId}">
            <i class="uil uil-edit-alt"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${AnalyticsId}">
            <i class="uil uil-trash-alt"></i>
          </button>
        </td>
      `;

        tableBody.appendChild(tr);
      });

      if (!hasAnalytics) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No analytics found.</td>
        </tr>
      `;
      }

      bindEditAndDeleteButtons();
    },
    (error) => {
      console.error("Error loading real-time analytics:", error);
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
        const AnalyticsRef = doc(db, "analytics", id);
        const AnalyticsSnap = await getDoc(AnalyticsRef);

        if (AnalyticsSnap.exists()) {
          const AnalyticsData = AnalyticsSnap.data();
          document.getElementById("editAnalyticsId").value = id;
          document.getElementById("editAnalyticsTitle").value =
            AnalyticsData.title || "";
          document.getElementById("editAnalyticsDescription").value =
            AnalyticsData.description || "";
          document.getElementById("editAnalyticsType").value =
            AnalyticsData.type || "";
          const editContainer = document.getElementById(
            "editAnalyticsContainer"
          );
          editContainer.innerHTML = "";

          
          const dataMap = AnalyticsData.data || {};
          Object.entries(dataMap).forEach(([key, value]) => {
            addAnalyticsInput("editAnalyticsContainer", key, value);
          });

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching analytics for edit:", error);
        Swal.fire("Error!", "Could not load analytics data.", "error");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This Analytics will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "analytics", id));
          Swal.fire("Deleted!", "Analytics has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting analytics:", error);
          Swal.fire("Error!", "Failed to delete analytics.", "error");
        }
      }
    });
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../login-register.html";
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

      loadAnalytics();
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
        localStorage.setItem("userValidated", "false");
        window.location.href = "../../login-register.html";
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

  document
    .getElementById("addAddAnalyticsBtn")
    .addEventListener("click", () => {
      addAnalyticsInput("addAnalyticsContainer");
    });

  document
    .getElementById("editAnalyticsForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editAnalyticsId").value;
      const title = document.getElementById("editAnalyticsTitle").value.trim();
      const description = document
        .getElementById("editAnalyticsDescription")
        .value.trim();
      const type = document.getElementById("editAnalyticsType").value.trim();
      const data = {};
      document
        .querySelectorAll("#editAnalyticsContainer .analytics-item")
        .forEach((item) => {
          const [keyInput, valueInput] = item.querySelectorAll("input");
          const key = keyInput?.value?.trim();
          const value = parseFloat(valueInput?.value?.trim());
          if (key && !isNaN(value) && value >= 0) {
            data[key] = value;
          }
        });

      if (!title || !description || !type || Object.keys(data).length === 0) {
        Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
        submitBtn.disabled = false;
        return;
      }

      try {
        const docRef = doc(db, "analytics", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          Swal.fire("Error!", "Document not found.", "error");
          return;
        }

        const existingData = docSnap.data();
        const createdAt = existingData.createdAt || new Date();

        const updateData = {
          title,
          description,
          type,
          data,
          createdAt,
        };

        await setDoc(docRef, updateData);

        Swal.fire("Success!", "Analytics updated successfully.", "success");
        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating analytics:", error);
        Swal.fire("Error!", "Failed to update analytics.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

  document.getElementById("addAnalyticsBtn").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "visible";
    document.body.classList.add("modal-open");
  });

  document.getElementById("addModalClose").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
    document.getElementById("addAnalyticsForm").reset();
  });

  document
    .getElementById("addAnalyticsForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.querySelector(
        '#addAnalyticsForm button[type="submit"]'
      );
      submitBtn.disabled = true;

      const title = document.getElementById("addAnalyticsTitle").value.trim();
      const description = document
        .getElementById("addAnalyticsDescription")
        .value.trim();
      const type = document.getElementById("addAnalyticsType").value.trim();
      const data = {};
      document
        .querySelectorAll("#addAnalyticsContainer .analytics-item")
        .forEach((item) => {
          const [keyInput, valueInput] = item.querySelectorAll("input");
          const key = keyInput?.value?.trim();
          const value = parseFloat(valueInput?.value?.trim());
          if (key && !isNaN(value)) {
            data[key] = value;
          }
        });

      if (!title || !description || !type || Object.keys(data).length === 0) {
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

        const newAnalyticsRef = doc(collection(db, "analytics"));
        await setDoc(newAnalyticsRef, {
          title,
          description,
          type,
          data,
          createdAt: new Date(),
        });

        Swal.fire("Success!", "Analytics added successfully.", "success");

        document.getElementById("addAnalyticsForm").reset();
        document.getElementById("addModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error adding analytics:", error);
        Swal.fire("Error!", "Failed to add analytics.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
});
