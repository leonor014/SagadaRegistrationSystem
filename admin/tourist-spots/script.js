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

// Helper function to convert file to Base64
const handleImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
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

const loadCategories = async () => {
  const categorySelects = [
    document.getElementById("addTouristSpotCategory"),
    document.getElementById("editTouristSpotCategory"),
  ];
  const categoryFilter = document.getElementById("categoryFilter");

  try {
    const categoriesSnapshot = await getDocs(collection(db, "categories"));

    // Reset filter dropdown
    categoryFilter.innerHTML = `<option value="">All</option>`;

    // Populate all dropdowns
    categoriesSnapshot.forEach((doc) => {
      const category = doc.data().name;

      // Add to filter dropdown
      const opt = document.createElement("option");
      opt.value = category;
      opt.textContent = category;
      categoryFilter.appendChild(opt);
    });

    // Add to form selects (add & edit)
    categorySelects.forEach((select) => {
      select.innerHTML = '<option value="">Select a category</option>';

      categoriesSnapshot.forEach((doc) => {
        const category = doc.data().name;
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    Swal.fire("Error!", "Failed to load categories.", "error");
  }
};

const loadTouristSpots = async () => {
  const tableBody = document.getElementById("tourist-spotsTableBody");
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center;">Loading...</td>
    </tr>
  `;

  try {
    const user = auth.currentUser;
    const touristSpotsQuery = query(
      collection(db, "tourist-spots"),
      orderBy("name", "asc")
    );

    onSnapshot(touristSpotsQuery, (querySnapshot) => {
      tableBody.innerHTML = "";

      if (querySnapshot.empty) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center;">No tourist spots found.</td>
          </tr>
        `;
        return;
      }

      let hasTouristSpots = false;

      querySnapshot.forEach((docSnap) => {
        const touristSpotId = docSnap.id;
        if (user && touristSpotId === user.uid) return;

        hasTouristSpots = true;
        const touristSpot = docSnap.data();
        const tr = document.createElement("tr");

        const name = touristSpot.name || "—";
        const description = touristSpot.description || "—";
        const category = touristSpot.category || "—";
        const guideFee = touristSpot.guideFee || "—";
        const shuttleFee = touristSpot.shuttleFee || "—";
        const createdAt =
          touristSpot.createdAt?.toDate().toLocaleString() || "—";
        const image = touristSpot.image || "";
        const qrCode = touristSpot.qrCode || "";

        tr.innerHTML = `
          <td>${name}</td>
          <td>${description}</td>
          <td>${category}</td>
          <td>${guideFee}</td>
          <td>${shuttleFee}</td>
          <td>${createdAt}</td>
          <td>${
            image
              ? `<img src="${image}" alt="Tourist Spot Image" style="max-width: 100px; max-height: 100px;">`
              : "—"
          }</td>
          <td>${
            qrCode 
              ? `<img src="${qrCode}" style="max-width: 60px;">` 
              : "—"
          }</td>
          <td>
            <button class="action-btn edit-btn" title="Edit" data-id="${touristSpotId}">
              <i class="uil uil-edit-alt"></i>
            </button>
            <button class="action-btn delete-btn" title="Delete" data-id="${touristSpotId}">
              <i class="uil uil-trash-alt"></i>
            </button>
          </td>
        `;

        tableBody.appendChild(tr);
      });

      if (!hasTouristSpots) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center;">No tourist spots found.</td>
          </tr>
        `;
      }

      attachEditDeleteListeners();
    });
  } catch (error) {
    console.error("Error loading tourist spots:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: red;">
          Failed to load data.
        </td>
      </tr>
    `;
  }
};

function attachEditDeleteListeners() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        const touristSpotRef = doc(db, "tourist-spots", id);
        const touristSpotSnap = await getDoc(touristSpotRef);

        if (touristSpotSnap.exists()) {
          const touristSpotData = touristSpotSnap.data();
          document.getElementById("editTouristSpotId").value = id;
          document.getElementById("editTouristSpotName").value =
            touristSpotData.name || "";
          document.getElementById("editTouristSpotDescription").value =
            touristSpotData.description || "";
          document.getElementById("editTouristSpotCategory").value =
            touristSpotData.category || "";
          document.getElementById("editTouristSpotGuideFee").value =
            touristSpotData.guideFee || "";
          document.getElementById("editTouristSpotShuttleFee").value =
            touristSpotData.shuttleFee || "";

          const imagePreview = document.getElementById(
            "editTouristSpotImagePreview"
          );
          if (touristSpotData.image) {
            imagePreview.src = touristSpotData.image;
            imagePreview.style.display = "block";
          } else {
            imagePreview.src = "";
            imagePreview.style.display = "none";
          }

          const qrPreview = document.getElementById("editTouristSpotQRCodePreview");
          qrPreview.src = data.qrCode || "";
          qrPreview.style.display = data.qrCode ? "block" : "none";

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching tourist spot for edit:", error);
        Swal.fire("Error!", "Could not load tourist spot data.", "error");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This Tourist Spot will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "tourist-spots", id));
          Swal.fire("Deleted!", "Tourist Spot has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting tourist spot:", error);
          Swal.fire("Error!", "Failed to delete tourist spot.", "error");
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

      loadTouristSpots();
      loadCategories();
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
    const rows = document.querySelectorAll("#tourist-spotsTableBody tr");

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
    .getElementById("editTouristSpotForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editTouristSpotId").value;
      const name = document.getElementById("editTouristSpotName").value.trim();
      const description = document
        .getElementById("editTouristSpotDescription")
        .value.trim();
      const category = document
        .getElementById("editTouristSpotCategory")
        .value.trim();
      const guideFee = document
        .getElementById("editTouristSpotGuideFee")
        .value.trim();
      const shuttleFee = document
        .getElementById("editTouristSpotShuttleFee")
        .value.trim();

      if (
        !name ||
        !description ||
        category === "" ||
        !guideFee ||
        !shuttleFee
      ) {
        Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
        return;
      }

      const imageInput = document.getElementById("editTouristSpotImage");
      let image = null;

      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      }

      const qrInput = document.getElementById("editTouristSpotQRCode");
      let qrCode = null;

      if (qrInput.files.length > 0) {
        qrCode = await handleImageUpload(qrInput.files[0]);
      }

      if (qrCode) updateData.qrCode = qrCode; // Add to updateData object

      try {
        const updateData = {
          name,
          description,
          category,
          guideFee,
          shuttleFee,
        };
        if (image) {
          updateData.image = image;
        }
        await setDoc(doc(db, "tourist-spots", id), updateData, { merge: true });
        Swal.fire("Success!", "Tourist Spot updated successfully.", "success");
        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating tourist spot:", error);
        Swal.fire("Error!", "Failed to update tourist spot.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

  document
    .getElementById("editTouristSpotImage")
    .addEventListener("change", function () {
      const file = this.files[0];
      const imagePreview = document.getElementById(
        "editTouristSpotImagePreview"
      );

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.src = "";
        imagePreview.style.display = "none";
      }
    });

  document.getElementById("addTouristSpotBtn").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "visible";
    document.body.classList.add("modal-open");
  });

  document.getElementById("addModalClose").addEventListener("click", () => {
    document.getElementById("addModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
    document.getElementById("addTouristSpotForm").reset();
    document.getElementById("addTouristSpotImagePreview").style.display =
      "none";
  });

  document
    .getElementById("addTouristSpotImage")
    .addEventListener("change", function () {
      const file = this.files[0];
      const preview = document.getElementById("addTouristSpotImagePreview");

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        preview.src = "";
        preview.style.display = "none";
      }
    });
  
  document.getElementById(`${type}TouristSpotQRCode`).addEventListener("change", async function() {
        if (this.files[0]) {
            const preview = document.getElementById(`${type}TouristSpotQRCodePreview`);
            preview.src = await handleImageUpload(this.files[0]);
            preview.style.display = "block";
        }
    });

  document
    .getElementById("addTouristSpotForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.querySelector(
        '#addTouristSpotForm button[type="submit"]'
      );
      submitBtn.disabled = true;

      const name = document.getElementById("addTouristSpotName").value.trim();
      const description = document
        .getElementById("addTouristSpotDescription")
        .value.trim();
      const category = document
        .getElementById("addTouristSpotCategory")
        .value.trim();
      const guideFee = document
        .getElementById("addTouristSpotGuideFee")
        .value.trim();
      const shuttleFee = document
        .getElementById("addTouristSpotShuttleFee")
        .value.trim();
      const imageInput = document.getElementById("addTouristSpotImage");
      const qrInput = document.getElementById("addTouristSpotQRCode");


      if (
        !name ||
        !description ||
        category === "" ||
        !guideFee ||
        !shuttleFee
      ) {
        Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
        submitBtn.disabled = false;
        return;
      }

      let image = null;
      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      }

      let qrCode = null;
      if (qrInput.files.length > 0) {
        const file = qrInput.files[0];
        image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      }

      try {
        const user = auth.currentUser;
        if (!user) {
          Swal.fire("Error!", "User not authenticated.", "error");
          submitBtn.disabled = false;
          return;
        }

        const newSpotRef = doc(collection(db, "tourist-spots"));
        await setDoc(newSpotRef, {
          name,
          description,
          category,
          guideFee,
          shuttleFee,
          image: image || null,
          qrCode: qrCode || null,
          createdAt: new Date(),
        });

        Swal.fire("Success!", "Tourist Spot added successfully.", "success");

        document.getElementById("addTouristSpotForm").reset();
        document.getElementById("addModal").style.visibility = "hidden";
        document.getElementById("addTouristSpotImagePreview").style.display =
          "none";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error adding tourist spot:", error);
        Swal.fire("Error!", "Failed to add tourist spot.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });

  document
    .getElementById("categoryFilter")
    .addEventListener("change", function () {
      const selected = this.value;
      const rows = document.querySelectorAll("#tourist-spotsTableBody tr");

      rows.forEach((row) => {
        const categoryCell = row.querySelector("td:nth-child(3)");
        if (!categoryCell) return;

        const categoryText = categoryCell.textContent.trim();

        const match = selected === "" || categoryText === selected;
        row.style.display = match ? "" : "none";
      });
    });
});
