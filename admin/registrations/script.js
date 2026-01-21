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
  where,
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

let currentPage = 1;
const recordsPerPage = 5;
let allRegistrations = [];
let currentListener = null;

const getDateRange = (period) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
        case 'daily':
            // Start of today (00:00:00)
            start = new Date(now.setHours(0, 0, 0, 0));
            // End of today (23:59:59)
            end = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'weekly':
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0,0,0,0);
            break;
        case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'yearly':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'custom': {
          const startInput = document.getElementById('startDate')?.value;
          const endInput = document.getElementById('endDate')?.value;

          // Do NOT return a range until both dates are selected
          if (!startInput || !endInput) {
            return null;
          }

          start = new Date(startInput);
          end = new Date(endInput);
          end.setHours(23, 59, 59, 999);
          return { start, end };

          // Extra safety check
          //if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            //return null;
          //}

          //end.setHours(23, 59, 59, 999);
          //return { start, end };
        }

        default:
            return null; // For 'all'
    }
    return { start, end};
};

function updateNavPadding() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // Check if content is overflowing vertically
  const hasVerticalScroll = nav.scrollHeight > nav.clientHeight;

  if (hasVerticalScroll) {
    nav.classList.add("has-scroll");
  } else {
    nav.classList.remove("has-scroll");
  }
}

// Run once on load
updateNavPadding();

// Run again on resize (important for responsiveness)
window.addEventListener("resize", updateNavPadding);


const listenToRegistrations = (period = 'all') => {
  const range = getDateRange(period);
  
  // If custom range is incomplete, do nothing
  if (period === 'custom' && !range) {
    return;
  }

  // Unsubscribe from previous listener to prevent memory leaks
  if (currentListener) currentListener();

  let q;
  const col = collection(db, "registrations");

  // Determine the query based on the range
  if (range && period !== 'all') {
    q = query(
      col,
      where("createdAt", ">=", range.start),
      where("createdAt", "<=", range.end),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(col, orderBy("createdAt", "desc"));
  }

  // Set up the real-time listener using the variable 'q'
  currentListener = onSnapshot(q, (snapshot) => {
    allRegistrations = [];
    snapshot.forEach((docSnap) => {
      allRegistrations.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    currentPage = 1;
    renderTablePage();
  }, (error) => {
    console.error("Listener failed:", error);
  });
};

// New function to handle the actual rendering of the current 10 items
function renderTablePage() {
    const tableBody = document.getElementById("registrationsTableBody");
    tableBody.innerHTML = "";
    
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const pageData = allRegistrations.slice(start, end);

    if (pageData.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="7" style="text-align:center;">No registrations found.</td></tr>`;
      updatePaginationControls(0);
      return;
    }

    pageData.forEach((reg) => {
      const tr = document.createElement("tr");

      const createdAt = reg.createdAt?.toDate().toLocaleString() || "—";
      const regNo = reg.registrationNumber || "—";
      const type = reg.registrationType || "—";

      let name = "—";
      let details = "";

      if (type === "individual") {
        name = reg.fullName || "—";
        details = `
          <div>DOB: ${reg.dateOfBirth || "—"}</div>
          <div>Sex: ${reg.sex || "—"}</div>
          <div>Country: ${reg.country || "—"}</div>
          <div>Region: ${reg.region || "—"}</div>
        `;
      } else {
        name = reg.groupName || "—";
        details = `
          <div>Size: ${reg.groupSize || 0}</div>
          <div>Contact: ${reg.groupContact || "—"}</div>
        `;
      }

      tr.innerHTML = `
        <td>${regNo}</td>
        <td>${type}</td>
        <td>${name}</td>
        <td>${details}</td>
        <td>${reg.dateOfRegistration || "—"}</td>
        <td>${createdAt}</td>
        <td>
          <button class="view-btn" data-reg="${regNo}">View</button>
          <button class="edit-btn" data-id="${reg.id}">Edit</button>
          <button class="delete-btn" data-id="${reg.id}">Delete</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    updatePaginationControls(allRegistrations.length);
    attachActionButtons();
  }

function updatePaginationControls(total) {
  const totalPages = Math.ceil(total / recordsPerPage);
  document.getElementById("pageNumbers").textContent =
    `Page ${currentPage} of ${totalPages || 1}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled =
    currentPage === totalPages || totalPages === 0;
}

function attachActionButtons() {
  // VIEW Button
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const regNum = e.currentTarget.dataset.reg;
      const attendanceModal = document.getElementById("attendanceModal");
      const attendanceList = document.getElementById("attendanceList");

      attendanceModal.style.visibility = "visible";
      document.body.classList.add("modal-open");
      attendanceList.innerHTML = `<p style="text-align:center;">Loading...</p>`;

      try {
        const q = query(
          collection(db, "attendance"),
          where("registrationNumber", "==", regNum)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          attendanceList.innerHTML = `<p style="text-align:center;">No attendance records found for <b>${regNum}</b>.</p>`;
          return;
        }

        let html = `
          <table class="activity-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Nationality</th>
                <th>Region</th>
                <th>Site</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
        `;

        querySnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          html += `
            <tr>
              <td>${d.name || "-"}</td>
              <td>${d.age || "-"}</td>
              <td>${d.sex || "-"}</td>
              <td>${d.nationality || "-"}</td>
              <td>${d.region || "-"}</td>
              <td>${d.site || "-"}</td>
              <td>${new Date(d.timestamp.seconds * 1000).toLocaleString()}</td>
            </tr>
          `;
        });

        html += `</tbody></table>`;
        attendanceList.innerHTML = html;
      } catch (err) {
        console.error("Error fetching attendance:", err);
        attendanceList.innerHTML = `<p style="text-align:center;color:red;">Error loading attendance records.</p>`;
      }
    });
  });

  // EDIT button
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        const regRef = doc(db, "registrations", id);
        const regSnap = await getDoc(regRef);
        if (regSnap.exists()) {
          const regData = regSnap.data();

          // Populate modal fields
          document.getElementById("editRegistrationId").value = id;
          document.getElementById("editRegistrationNumber").value =
            regData.registrationNumber || "";
          document.getElementById("editRegistrationType").value =
            regData.registrationType || "";

          document.getElementById("editRegistrationName").value =
            regData.fullName || regData.groupName || "";

          document.getElementById("editRegistrationContact").value =
            regData.contactNumber || regData.groupContact || "";

          document.getElementById("editRegistrationEmail").value =
            regData.email || regData.groupEmail || "";

          document.getElementById("editRegistrationRegion").value =
            regData.region || regData.groupRegion || "";

          document.getElementById("editRegistrationCountry").value =
            regData.country || regData.groupCountry || "";

          document.getElementById("editRegistrationDate").value =
            regData.dateOfRegistration || "";

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching registration for edit:", error);
        Swal.fire("Error!", "Could not load registration data.", "error");
      }
    });
  });

  // DELETE button
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This registration will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "registrations", id));
          Swal.fire("Deleted!", "Registration has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting registration:", error);
          Swal.fire("Error!", "Failed to delete registration.", "error");
        }
      }
    });
  });
}

document
  .getElementById("attendanceModalClose")
  .addEventListener("click", () => {
    document.getElementById("attendanceModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

window.addEventListener("click", (e) => {
  const modal = document.getElementById("attendanceModal");
  if (e.target === modal) {
    modal.style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  }
});

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

      listenToRegistrations('all');
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
    const rows = document.querySelectorAll("#registrationsTableBody tr");

    rows.forEach((row) => {
      const regCell = row.querySelector("td:first-child");
      if (regCell) {
        const text = regCell.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      }
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").focus();
  });

  document
    .getElementById("editRegistrationForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editRegistrationId").value;

      const updatedData = {
        dateOfRegistration: document.getElementById("editRegistrationDate")
          .value,
        fullName: document.getElementById("editRegistrationName").value,
        contactNumber: document.getElementById("editRegistrationContact").value,
        region: document.getElementById("editRegistrationRegion").value,
        country: document.getElementById("editRegistrationCountry").value,
      };

      try {
        await setDoc(doc(db, "registrations", id), updatedData, {
          merge: true,
        });
        Swal.fire("Success!", "Registration updated successfully.", "success");

        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating registration:", error);
        Swal.fire("Error!", "Failed to update registration.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

  const periodFilter = document.getElementById('periodFilter');
  const customDateGroup = document.getElementById('customDateGroup');

  periodFilter.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customDateGroup.style.display = 'flex';
    } else {
        customDateGroup.style.display = 'none';
        listenToRegistrations(e.target.value);
    }
  });

  // Trigger for custom date inputs
  document.getElementById('startDate').addEventListener('change', () => {
    if (document.getElementById('endDate').value) {
      listenToRegistrations('custom');
    }
  });

  document.getElementById('endDate').addEventListener('change', () => {
    if (document.getElementById('startDate').value) {
      listenToRegistrations('custom');
    }
  });

  // Default load: Daily
  //listenToRegistrations('daily');

  // Add this at the very bottom of script.js
  window.listenToRegistrations = listenToRegistrations;

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePage();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < Math.ceil(allRegistrations.length / recordsPerPage)) {
      currentPage++;
      renderTablePage();
    }
  });
});
