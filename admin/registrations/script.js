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
const entriesPerPage = 5;
let filteredData = [];

const getDateRange = (period) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (period) {
    case 'daily':
      start.setHours(0,0,0,0);
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
    case 'custom':
      start = new Date(document.getElementById('startDate').value);
      end = new Date(document.getElementById('endDate').value);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    default:
      return null; // For 'all'
  }
  return { start, end: new Date() };
};

const renderTable = () => {
    const tableBody = document.getElementById("registrationsTableBody");
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const pageItems = filteredData.slice(start, end);

    pageItems.forEach(data => {
        const tr = document.createElement("tr");
        // ... (Use your existing logic to build the TR rows here) ...
        tableBody.appendChild(tr);
    });

    // Update UI
    document.getElementById("pageIndicator").innerText = `Page ${currentPage} of ${Math.ceil(filteredData.length / entriesPerPage) || 1}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = end >= filteredData.length;
    
    attachActionButtons(); // Re-attach listeners for Edit/Delete/Attendance
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

//let currentListener = null;

const listenToRegistrations = (period = 'daily') => {
  const tableBody = document.getElementById("registrationsTableBody");
  const range = getDateRange(period);
  const user = auth.currentUser;

  // Show loading state immediately
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>`;

  let q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  const registrationsCol = collection(db, "registrations");

  if (range && period !== 'all') {
    q = query(collection(db, "registrations"), 
      where("createdAt", ">=", range.start), 
      where("createdAt", "<=", range.end), 
      orderBy("createdAt", "desc"));
  } else {
    q = query(registrationsCol, orderBy("createdAt", "desc"));
  }

  onSnapshot(q, (snapshot) => {
    // Fill the array for pagination
    filteredData = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // Optional: Filter out current user if they are in this collection
      .filter(reg => !(user && reg.id === user.uid));

    currentPage = 1;
    renderTable();

    }, (error) => {
    console.error("Firestore Error:", error);
    if (error.code === 'failed-precondition') {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">
            Error: This query requires a Firestore Index. Check console for the link.
        </td></tr>`;
    }
  });
};

  window.listenToRegistrations = listenToRegistrations;


  onSnapshot(registrationsQuery, async (querySnapshot) => {
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">No registrations found.</td>
        </tr>
      `;
      return;
    }

    let hasRegistrations = false;

    querySnapshot.forEach((docSnap) => {
      const registrationId = docSnap.id;

      if (user && registrationId === user.uid) return;

      hasRegistrations = true;
      const reg = docSnap.data();
      const regId = docSnap.id;
      const tr = document.createElement("tr");

      const regNo = reg.registrationNumber || "—";
      const type = reg.registrationType || "—";
      const regDate = reg.dateOfRegistration || "—";
      const createdAt = reg.createdAt?.toDate().toLocaleString() || "—";

      let nameOrGroup = "—";
      let details = "";

      if (type === "individual") {
        nameOrGroup = reg.fullName || "—";
        details = `
          <div><strong>DOB:</strong> ${reg.dateOfBirth || "—"}</div>
          <div><strong>Sex:</strong> ${reg.sex || "—"}</div>
          <div><strong>Country:</strong> ${reg.country || "—"}</div>
          <div><strong>Region:</strong> ${reg.region || "—"}</div>
          <div><strong>Contact:</strong> ${reg.contactNumber || "—"}</div>
          <div><strong>Email:</strong> ${reg.email || "—"}</div>
        `;
      } else if (type === "group") {
        nameOrGroup = reg.groupName || "—";
        details = `
          <div><strong>Size:</strong> ${reg.groupSize || 0}</div>
          <div><strong>Contact:</strong> ${reg.groupContact || "—"}</div>
          <div><strong>Email:</strong> ${reg.groupEmail || "—"}</div>
          <hr>
          <div><strong>Members:</strong></div>
          <ul style="margin-top: 5px; padding-left: 15px;">
            ${
              Array.isArray(reg.groupMembers)
                ? reg.groupMembers
                    .map(
                      (m) => `
                      <li>
                        <strong>${m.memberName || "—"}</strong><br>
                        DOB: ${m.memberDOB || "—"}<br>
                        Sex: ${m.memberSex || "—"}<br>
                        Country: ${m.memberCountry || "—"}<br>
                        Region: ${m.memberRegion || "—"}
                      </li>
                    `
                    )
                    .join("")
                : "<li>No members</li>"
            }
          </ul>
        `;
      }

      tr.innerHTML = `
        <td>${regNo}</td>
        <td>${type}</td>
        <td>${nameOrGroup}</td>
        <td>${details}</td>
        <td>${regDate}</td>
        <td>${createdAt}</td>
        <td>
          <button class="action-btn view-btn" title="View Attendance" data-reg="${regNo}">
            <i class="uil uil-eye"></i>
          </button>
          <button class="action-btn edit-btn" title="Edit" data-id="${regId}">
              <i class="uil uil-edit-alt"></i>
            </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${regId}">
            <i class="uil uil-trash-alt"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (!hasRegistrations) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">No registrations found.</td>
        </tr>
      `;
    }

    attachActionButtons();
  });

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

      listenToRegistrations();
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
  document.getElementById('startDate').addEventListener('change', () => listenToRegistrations('custom'));
  document.getElementById('endDate').addEventListener('change', () => listenToRegistrations('custom'));

  // Default load: Daily
  listenToRegistrations('daily');

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
});
