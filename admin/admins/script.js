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

const loadAdmins = () => {
  const tableBody = document.getElementById("adminsTableBody");
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center;">Loading...</td>
    </tr>
  `;

  const user = auth.currentUser;

  const adminsQuery = query(
    collection(db, "admins"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(adminsQuery, (querySnapshot) => {
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No admins found.</td>
        </tr>
      `;
      return;
    }

    let hasAdmins = false;

    querySnapshot.forEach((docSnap) => {
      const adminId = docSnap.id;

      if (user && adminId === user.uid) return;

      hasAdmins = true;
      const admin = docSnap.data();
      const tr = document.createElement("tr");

      const email = admin.email || "—";
      const name = admin.name || "—";
      const createdAt = admin.createdAt?.toDate().toLocaleString() || "—";

      tr.innerHTML = `
        <td>${email}</td>
        <td>${name}</td>
        <td>${createdAt}</td>
        <td>
          <button class="action-btn edit-btn" title="Edit" data-id="${adminId}">
            <i class="uil uil-edit-alt"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${adminId}">
            <i class="uil uil-trash-alt"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (!hasAdmins) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No admins found.</td>
        </tr>
      `;
    }

    attachEditAndDeleteListeners(); 
  });
};

function attachEditAndDeleteListeners() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      try {
        const adminRef = doc(db, "admins", id);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          document.getElementById("editAdminId").value = id;
          document.getElementById("editAdminEmail").value = adminData.email || "";
          document.getElementById("editAdminName").value = adminData.name || "";

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching admin for edit:", error);
        Swal.fire("Error!", "Could not load admin data.", "error");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This Admin will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "admins", id));
          Swal.fire("Deleted!", "Admin has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting admin:", error);
          Swal.fire("Error!", "Failed to delete admin.", "error");
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

      loadAdmins();
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
    .getElementById("editAdminForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editAdminId").value;
      const email = document.getElementById("editAdminEmail").value.trim();
      const name = document.getElementById("editAdminName").value.trim();

      if (!email || !name) {
        Swal.fire(
          "Missing Fields",
          "Please enter both name and email.",
          "warning"
        );
        return;
      }

      try {
        await setDoc(doc(db, "admins", id), { name }, { merge: true });
        Swal.fire("Success!", "Admin updated successfully.", "success");
        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating admin:", error);
        Swal.fire("Error!", "Failed to update admin.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });
});
