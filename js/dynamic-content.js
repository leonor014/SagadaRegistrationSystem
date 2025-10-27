// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
  authDomain: "sagadatouristregister.firebaseapp.com",
  projectId: "sagadatouristregister",
  storageBucket: "sagadatouristregister.appspot.com",
  messagingSenderId: "875774905793",
  appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
  measurementId: "G-2VF5GCQGZ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  loadGuidelines();
  loadFAQs();
  loadReviews(); // 👈 load reviews on page load
});

// =========================
// LOAD GUIDELINES
// =========================
function loadGuidelines() {
  const guidelinesContainer = document.getElementById(
    "guidelines-sections-container"
  );
  const guidelinesQuery = query(
    collection(db, "tourist-guidelines"),
    orderBy("createdAt", "asc")
  );

  onSnapshot(
    guidelinesQuery,
    (snapshot) => {
      guidelinesContainer.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const key = `guidelines-${data.name
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        const section = document.createElement("section");
        section.innerHTML = `<h2>${data.name.toUpperCase()}</h2><ul id="${key}-list"></ul>`;
        guidelinesContainer.appendChild(section);

        const list = document.getElementById(`${key}-list`);
        list.innerHTML = data.guidelines
          .map((item, index) => `<li id="${key}-${index}">${item}</li>`)
          .join("");
      });
    },
    (error) => {
      console.error("Failed to load guidelines:", error);
      guidelinesContainer.innerHTML =
        "<p>Error loading guidelines. Please try again later.</p>";
    }
  );
}

// =========================
// LOAD FAQS
// =========================
function loadFAQs() {
  const faqContainer = document.getElementById("faq-sections-container");
  const faqsCollection = query(
    collection(db, "faqs"),
    orderBy("createdAt", "asc")
  );

  onSnapshot(
    faqsCollection,
    (snapshot) => {
      faqContainer.innerHTML = "";
      const section = document.createElement("section");
      section.innerHTML = `<ul id="faq-general-list"></ul>`;
      faqContainer.appendChild(section);

      const list = document.getElementById("faq-general-list");

      snapshot.forEach((doc, index) => {
        const data = doc.data();
        list.innerHTML += `
          <li id="faq-${index}">
            <strong>Q: ${data.question}</strong>
            <p>A: ${data.answer}</p>
          </li>
        `;
      });
    },
    (error) => {
      console.error("Failed to load FAQs:", error);
      faqContainer.innerHTML =
        "<p>Error loading FAQs. Please try again later.</p>";
    }
  );
}

// LOAD REVIEWS 
function loadReviews() {
  const reviewsContainer = document.getElementById("reviewsSlider");
  if (!reviewsContainer) return;

  const reviewsQuery = query(
    collection(db, "reviews"),
    orderBy("createdAt", "desc"),
    limit(7)
  );

  onSnapshot(
    reviewsQuery,
    (snapshot) => {
      reviewsContainer.innerHTML = "";

      if (snapshot.empty) {
        reviewsContainer.innerHTML = `<div class="testimonial-slide"><div class="testimonial_box"><p>No reviews yet.</p></div></div>`;
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        const rating = parseInt(data.rating) || 0;
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        const comment = data.comment || "";

        // Format date
        let formattedDate = "";
        if (data.createdAt?.toDate) {
          const dateObj = data.createdAt.toDate();
          formattedDate = dateObj.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        } else if (typeof data.createdAt === "string") {
          formattedDate = data.createdAt.split(" at ")[0];
        }

        // Truncate comment if too long
        const maxLength = 100;
        let displayComment = comment;
        let readMore = "";
        if (comment.length > maxLength) {
          const shortComment = comment.slice(0, maxLength) + "...";
          readMore = `<span class="read-more" style="color:#2563eb; cursor:pointer;"> Read more</span>`;
          displayComment = shortComment + readMore;
        }

        const slide = `
    <div class="testimonial-slide">
      <div class="testimonial_box">
        <div class="testimonial_box-text">
          <p>${displayComment}</p>
        </div> 
        <div class="stars">${stars}</div>
        <p class="review-date">${formattedDate}</p>
      </div>
    </div>
  `;
        reviewsContainer.insertAdjacentHTML("beforeend", slide);
      });

      // Add event listener for read more
      reviewsContainer.querySelectorAll(".read-more").forEach((btn, index) => {
        btn.addEventListener("click", () => {
          const docData = snapshot.docs[index].data();
          btn.parentElement.textContent = docData.comment;
        });
      });

      // Initialize Slick carousel
      if ($(".testimonial-slider").hasClass("slick-initialized")) {
        $(".testimonial-slider").slick("unslick");
      }

      $(".testimonial-slider").slick({
        autoplay: true,
        autoplaySpeed: 2500,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        arrows: false,
        dots: true,
        responsive: [
          { breakpoint: 991, settings: { slidesToShow: 2 } },
          { breakpoint: 575, settings: { slidesToShow: 1 } },
        ],
      });
    },
    (error) => {
      console.error("Failed to load reviews:", error);
      reviewsContainer.innerHTML =
        "<p>Error loading reviews. Please try again later.</p>";
    }
  );
}
