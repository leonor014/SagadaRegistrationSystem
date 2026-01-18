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

const listenToUsers = () => {
  const tableBody = document.getElementById("UsersTableBody");

  const UsersQuery = query(collection(db, "users"), orderBy("name", "asc"));

  onSnapshot(UsersQuery, (querySnapshot) => {
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center;">No Users found.</td>
        </tr>
      `;
      return;
    }

    let hasUsers = false;
    const user = auth.currentUser;

    querySnapshot.forEach((docSnap) => {
      const UserId = docSnap.id;

      if (user && UserId === user.uid) return;

      hasUsers = true;
      const User = docSnap.data();
      const tr = document.createElement("tr");

      const name = User.name || "—";
      const email = User.email || "—";

      // --- Personal Details ---
      const personalDetailsObj = User.personalDetails;
      let personalDetailsHtml = "—";

      if (personalDetailsObj && typeof personalDetailsObj === "object") {
        personalDetailsHtml = "<ul>";
        for (const key in personalDetailsObj) {
          if (Object.hasOwnProperty.call(personalDetailsObj, key)) {
            personalDetailsHtml += `<li><strong>${key}:</strong> ${
              personalDetailsObj[key] || "—"
            }</li>`;
          }
        }
        personalDetailsHtml += "</ul>";
      } else if (Array.isArray(personalDetailsObj)) {
        personalDetailsHtml = "<ul>";
        personalDetailsObj.forEach((d) => {
          personalDetailsHtml += `<li>${d}</li>`;
        });
        personalDetailsHtml += "</ul>";
      }

      // --- Groups ---
      const groupsArray = User.groups;
      let groupsHtml = "—";

      if (Array.isArray(groupsArray) && groupsArray.length > 0) {
        groupsHtml = groupsArray
          .map((group) => {
            const groupName = group.groupName || "Unnamed Group";
            let membersHtml = "<p>No members</p>";

            if (Array.isArray(group.members) && group.members.length > 0) {
              membersHtml = "<ul>";
              group.members.forEach((m) => {
                membersHtml += `
              <li>
                <strong>${m.memberName || "—"}</strong><br>
                <label>DOB:</label> ${m.memberDOB || "—"}<br>
                <label>Sex:</label> ${m.memberSex || "—"}<br>
                <label>Country:</label> ${m.memberCountry || "—"}<br>
                <label>Region:</label> ${m.memberRegion || "—"}
              </li>
            `;
              });
              membersHtml += "</ul>";
            }

            return `
          <div class="group-block" style="margin-bottom:15px; padding:5px; border-bottom:1px dashed #ccc;">
            <strong>${groupName}</strong>
            ${membersHtml}
          </div>
        `;
          })
          .join("");
      }

      const createdAt = User.createdAt?.toDate?.().toLocaleString() || "—";

      tr.innerHTML = `
    <td>${name}</td>
    <td>${email}</td>
    <td>${personalDetailsHtml}</td>
    <td>${groupsHtml}</td>
    <td>${createdAt}</td>
    <td>
      <button class="action-btn edit-btn" title="Edit" data-id="${UserId}">
        <i class="uil uil-edit-alt"></i>
      </button>
      <button class="action-btn delete-btn" title="Delete" data-id="${UserId}">
        <i class="uil uil-trash-alt"></i>
      </button>
    </td>
  `;

      tableBody.appendChild(tr);
    });

    if (!hasUsers) {
      tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center;">No Users found.</td>
    </tr>
  `;
    }

    attachActionButtons();
  });
};

function attachActionButtons() {
  // EDIT
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();

          document.getElementById("editUserId").value = id;
          document.getElementById("editUserName").value = userData.name || "";
          document.getElementById("editUserEmail").value = userData.email || "";

          /* document.getElementById("editUserDetails").value =
            userData.personalDetails
              ? JSON.stringify(userData.personalDetails, null, 2)
              : "";

          document.getElementById("editUserGroups").value = userData.groups
            ? JSON.stringify(userData.groups, null, 2)
            : ""; */

          document.getElementById("editUserModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        Swal.fire("Error!", "Could not load user data.", "error");
      }
    });
  });

  // DELETE
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This user will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "users", id));
          Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error!", "Failed to delete user.", "error");
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

      listenToUsers();
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
    const rows = document.querySelectorAll("#UsersTableBody tr");

    rows.forEach((row) => {
      const userCell = row.querySelector("td:first-child");
      if (userCell) {
        const text = userCell.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      }
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").focus();
  });

  // Save user edits
  document
    .getElementById("editUserForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editUserId").value;
      const name = document.getElementById("editUserName").value.trim();
      /* const detailsRaw = document
        .getElementById("editUserDetails")
        .value.trim();
      const groupsRaw = document.getElementById("editUserGroups").value.trim(); 

      let personalDetails = null;
      let groups = null;

      try {
        personalDetails = detailsRaw ? JSON.parse(detailsRaw) : null;
      } catch {
        Swal.fire("Error!", "Invalid JSON in Personal Details.", "error");
        return;
      }

      try {
        groups = groupsRaw ? JSON.parse(groupsRaw) : null;
      } catch {
        Swal.fire("Error!", "Invalid JSON in Groups.", "error");
        return;
      }*/

      try {
        await setDoc(
          doc(db, "users", id),
          {
            name,
            /* personalDetails,
            groups, */
          },
          { merge: true }
        );

        Swal.fire("Success!", "User updated successfully.", "success");
        document.getElementById("editUserModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating user:", error);
        Swal.fire("Error!", "Failed to update user.", "error");
      }
    });

  // Close modal
  document
    .getElementById("editUserModalClose")
    .addEventListener("click", () => {
      document.getElementById("editUserModal").style.visibility = "hidden";
      document.body.classList.remove("modal-open");
    });
});
