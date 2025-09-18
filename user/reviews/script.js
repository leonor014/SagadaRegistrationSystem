// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.firebasestorage.app",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const reviewForm = document.getElementById("reviewForm");
  const reviewList = document.getElementById("reviewList");

  // ✅ Load and display reviews
  const reviewsQuery = query(
    collection(db, "reviews"),
    orderBy("createdAt", "desc")
  );
  
  const showMoreBtn = document.getElementById("showMoreBtn");
  const showLessBtn = document.getElementById("showLessBtn");
  let allReviews = [];
  let showAll = false; // control if all reviews should be shown

  onSnapshot(reviewsQuery, (querySnapshot) => {
    allReviews = [];
    querySnapshot.forEach((doc) => {
      allReviews.push({ id: doc.id, data: doc.data() });
    });
    displayReviews();
  });

  function displayReviews() {
    reviewList.innerHTML = "<h3>Reviews</h3>";
  
    // Show only 3 if showAll is false, otherwise show all
    const reviewsToShow = showAll ? allReviews : allReviews.slice(0, 4);

    reviewsToShow.forEach((reviewObj) => {
      displayReview(reviewObj.id, reviewObj.data);
    });

    // Show button only if there are more than 3 reviews and showAll is false
    if (allReviews.length > 3) {
      showMoreBtn.style.display = showAll ? "none" : "inline-block";
      showLessBtn.style.display = showAll ? "inline-block" : "none";
    } else {
      showMoreBtn.style.display = "none";
      showLessBtn.style.display = "none";
    }
  }

  showMoreBtn.addEventListener("click", () => {
    showAll = true; // show all reviews when clicked
    displayReviews();
  });

  showLessBtn.addEventListener("click", () => {
    showAll = false;
    displayReviews();
  });


  // Base HTML content
  function displayReview(id, review) {
    const reviewDiv = document.createElement("div");
    reviewDiv.classList.add("review");
    reviewDiv.setAttribute("data-id", id);

    reviewDiv.innerHTML = `
        ${review.imageBase64 ? `<img src="${review.imageBase64}" alt="Review Image">` : ""}
        <p class="date"><strong>Date:</strong> ${review.createdAt?.toDate ? review.createdAt.toDate().toLocaleString() : review.createdAt}</p>
        <p class="rating"><strong>Rating:</strong> ${getStars(review.rating)}</p>
        <p class="comment"><strong>Comment:</strong> ${review.comment}</p>
    `;

    reviewList.appendChild(reviewDiv);
}


  // ✅ Convert rating number to stars
  function getStars(rating) {
    const maxStars = 5;
    let stars = "";
    for (let i = 1; i <= maxStars; i++) {
      stars += i <= rating ? "★" : "☆";
    }
    return stars;
  }

  // ✅ Improved editReview with reliable selectors
  function editReview(id, reviewDiv) {
    const commentPara = reviewDiv.querySelector(".comment");
    const ratingPara = reviewDiv.querySelector(".rating");

    // 🔥 Null check
    if (!commentPara || !ratingPara) {
      console.error(`Failed to find elements in review ID: ${id}`);
      return;
    }

    // Replace with input fields
    const commentInput = document.createElement("textarea");
    commentInput.value = commentPara.textContent.replace("Comment: ", "");

    const ratingInput = document.createElement("input");
    ratingInput.type = "number";
    ratingInput.value = ratingPara.textContent
      .replace("Rating: ", "")
      .replace(" stars", "");
    ratingInput.min = 1;
    ratingInput.max = 5;

    // Replace elements with inputs
    reviewDiv.replaceChild(commentInput, commentPara);
    reviewDiv.replaceChild(ratingInput, ratingPara);

    // Show the save button
    const saveButton = reviewDiv.querySelector(".save-btn");
    saveButton.style.display = "inline";
  }

  // ✅ Save Review
  async function saveReview(id, reviewDiv) {
    const commentInput = reviewDiv.querySelector("textarea");
    const ratingInput = reviewDiv.querySelector("input");

    const newComment = commentInput.value;
    const newRating = parseInt(ratingInput.value);

    await updateDoc(doc(db, "reviews", id), {
      comment: newComment,
      rating: newRating,
    });

    //loadReviews();
  }

  // ✅ Delete Review
  async function deleteReview(id) {
    if (confirm("Are you sure you want to delete this review?")) {
      await deleteDoc(doc(db, "reviews", id));
      //loadReviews();
    }
  }

  // ✅ Handle form submission
  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const comment = document.getElementById("comment").value;
    const rating =
      document.querySelector('input[name="rating"]:checked')?.value ||
      "No rating";
    const createdAt = Timestamp.now();
    const imageFile = document.getElementById("imageUpload").files[0];

    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = await convertImageToBase64(imageFile);
    }

    await addDoc(collection(db, "reviews"), {
      comment,
      rating,
      createdAt,
      imageBase64,
    });

    reviewForm.reset();
  });

  async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  //loadReviews();
});
