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

const listenToFAQs = () => {
  const tableBody = document.getElementById("FAQsTableBody");

  const FAQsQuery = query(collection(db, "faqs"), orderBy("createdAt", "desc"));

  onSnapshot(FAQsQuery, (querySnapshot) => {
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No FAQs found.</td>
        </tr>
      `;
      return;
    }

    let hasFAQs = false;
    const user = auth.currentUser;

    querySnapshot.forEach((docSnap) => {
      const FAQId = docSnap.id;

      if (user && FAQId === user.uid) return;

      hasFAQs = true;
      const FAQ = docSnap.data();
      const tr = document.createElement("tr");

      const question = FAQ.question || "—";
      const answer = FAQ.answer || "—";
      const createdAt = FAQ.createdAt?.toDate().toLocaleString() || "—";

      tr.innerHTML = `
        <td>${question}</td>
        <td>${answer}</td>
        <td>${createdAt}</td>
        <td>
          <button class="action-btn edit-btn" title="Edit" data-id="${FAQId}">
            <i class="uil uil-edit-alt"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${FAQId}">
            <i class="uil uil-trash-alt"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (!hasFAQs) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No FAQs found.</td>
        </tr>
      `;
    }

    attachFAQActionButtons();
  });
};

function attachFAQActionButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      try {
        const FAQRef = doc(db, "faqs", id);
        const FAQSnap = await getDoc(FAQRef);

        if (FAQSnap.exists()) {
          const FAQData = FAQSnap.data();
          document.getElementById("editFAQId").value = id;
          document.getElementById("editFAQQuestion").value =
            FAQData.question || "";
          document.getElementById("editFAQAnswer").value = FAQData.answer || "";

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching FAQ for edit:", error);
        Swal.fire("Error!", "Could not load FAQ data.", "error");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This FAQ will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "faqs", id));
          Swal.fire("Deleted!", "FAQ has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting FAQ:", error);
          Swal.fire("Error!", "Failed to delete FAQ.", "error");
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

      listenToFAQs();
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
    const rows = document.querySelectorAll("#FAQsTableBody tr");

    rows.forEach((row) => {
      const faqCell = row.querySelector("td:first-child");
      if (faqCell) {
        const text = faqCell.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      }
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").focus();
  });

  document
    .getElementById("editFAQForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editFAQId").value;
      const question = document.getElementById("editFAQQuestion").value.trim();
      const answer = document.getElementById("editFAQAnswer").value.trim();

      if (!question || !answer) {
        Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
        return;
      }

      try {
        const updateData = {
          question,
          answer,
        };
        await setDoc(doc(db, "faqs", id), updateData, { merge: true });
        Swal.fire("Success!", "FAQ updated successfully.", "success");
        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating FAQ:", error);
        Swal.fire("Error!", "Failed to update FAQ.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

  document.getElementById("addFAQBtn").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "visible";
    document.body.classList.add("modal-open");
  });

  document.getElementById("addModalClose").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
    document.getElementById("addFAQForm").reset();
  });

  document
    .getElementById("addFAQForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.querySelector(
        '#addFAQForm button[type="submit"]'
      );
      submitBtn.disabled = true;

      const question = document.getElementById("addFAQQuestion").value.trim();
      const answer = document.getElementById("addFAQAnswer").value.trim();

      if (!question || !answer) {
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

        const newSpotRef = doc(collection(db, "faqs"));
        await setDoc(newSpotRef, {
          question,
          answer,
          createdAt: new Date(),
        });

        Swal.fire("Success!", "FAQ added successfully.", "success");

        document.getElementById("addFAQForm").reset();
        document.getElementById("addModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error adding FAQ:", error);
        Swal.fire("Error!", "Failed to add FAQ.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
});
