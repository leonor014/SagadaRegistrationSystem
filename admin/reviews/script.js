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

const listenToReviews = () => {
  const tableBody = document.getElementById("reviewsTableBody");

  const user = auth.currentUser;

  const reviewsQuery = query(
    collection(db, "reviews"),
    orderBy("createdAt", "desc")
  );

  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center;">Loading...</td>
    </tr>
  `;

  onSnapshot(reviewsQuery, async (querySnapshot) => {
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No reviews found.</td>
        </tr>
      `;
      return;
    }

    let hasReviews = false;

    querySnapshot.forEach((docSnap) => {
      const reviewId = docSnap.id;

      if (user && reviewId === user.uid) return;

      hasReviews = true;
      const review = docSnap.data();
      const tr = document.createElement("tr");

      const comment = review.comment || "—";
      const rating = review.rating ?? "—";
      const createdAt = review.createdAt?.toDate().toLocaleString() || "—";
      const imageBase64 = review.imageBase64 || "";

      tr.innerHTML = `
        <td>${comment}</td>
        <td>${rating}</td>
        <td>${createdAt}</td>
        <td>${
          imageBase64
            ? `<img src="${imageBase64}" alt="Review Image" style="max-width: 100px; max-height: 100px;">`
            : "—"
        }</td>
        <td>
          <button class="action-btn edit-btn" title="Edit" data-id="${reviewId}">
            <i class="uil uil-edit-alt"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete" data-id="${reviewId}">
            <i class="uil uil-trash-alt"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (!hasReviews) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No reviews found.</td>
        </tr>
      `;
    }

    attachActionButtons();
  });
};

function attachActionButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        const reviewRef = doc(db, "reviews", id);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          const reviewData = reviewSnap.data();
          document.getElementById("editReviewId").value = id;
          document.getElementById("editReviewComments").value =
            reviewData.comment || "";
          document.getElementById("editReviewRating").value =
            reviewData.rating || "";

          const imagePreview = document.getElementById(
            "editReviewImagePreview"
          );
          if (reviewData.imageBase64) {
            imagePreview.src = reviewData.imageBase64;
            imagePreview.style.display = "block";
          } else {
            imagePreview.src = "";
            imagePreview.style.display = "none";
          }

          document.getElementById("editModal").style.visibility = "visible";
          document.body.classList.add("modal-open");
        }
      } catch (error) {
        console.error("Error fetching review for edit:", error);
        Swal.fire("Error!", "Could not load review data.", "error");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This Review will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "reviews", id));
          Swal.fire("Deleted!", "Review has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting review:", error);
          Swal.fire("Error!", "Failed to delete review.", "error");
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

      listenToReviews();
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
    const rows = document.querySelectorAll("#reviewsTableBody tr");

    rows.forEach((row) => {
      const reviewCell = row.querySelector("td:first-child");
      if (reviewCell) {
        const text = reviewCell.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      }
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").focus();
  });

  document
    .getElementById("editReviewForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editReviewId").value;
      const comment = document
        .getElementById("editReviewComments")
        .value.trim();
      const rating = Number(document.getElementById("editReviewRating").value);

      if (!comment || !rating) {
        Swal.fire(
          "Missing Fields",
          "Please fill in all required fields.",
          "warning"
        );
        return;
      }

      const imageInput = document.getElementById("editReviewImage");
      let imageBase64 = null;

      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      }

      try {
        const updateData = {
          comment,
          rating,
        };
        if (imageBase64) {
          updateData.imageBase64 = imageBase64;
        }
        await setDoc(doc(db, "reviews", id), updateData, { merge: true });
        Swal.fire("Success!", "Review updated successfully.", "success");
        document.getElementById("editModal").style.visibility = "hidden";
        document.body.classList.remove("modal-open");
      } catch (error) {
        console.error("Error updating review:", error);
        Swal.fire("Error!", "Failed to update review.", "error");
      }
    });

  document.getElementById("editModalClose").addEventListener("click", () => {
    document.getElementById("editModal").style.visibility = "hidden";
    document.body.classList.remove("modal-open");
  });

  document
    .getElementById("editReviewImage")
    .addEventListener("change", function () {
      const file = this.files[0];
      const imagePreview = document.getElementById("editReviewImagePreview");

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
});
