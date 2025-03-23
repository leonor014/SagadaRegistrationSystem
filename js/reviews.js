document.addEventListener("DOMContentLoaded", function () {
    const reviewsContainer = document.getElementById("reviews-container");

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
        authDomain: "sagadatouristregister.firebaseapp.com",
        projectId: "sagadatouristregister",
        storageBucket: "sagadatouristregister.appspot.com",
        messagingSenderId: "875774905793",
        appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
        measurementId: "G-2VF5GCQGZ1"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();

    // Fetch and Render Reviews
    function fetchReviews() {
        db.collection("reviews").get().then((querySnapshot) => {
            reviewsContainer.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const review = doc.data();
                reviewsContainer.innerHTML += `
                    <div class="review-item">
                        <p><strong>${review.user}:</strong> ${review.comment}</p>
                        <small>${new Date(review.timestamp).toLocaleString()}</small>
                        <button onclick="deleteReview('${doc.id}')">Delete</button>
                    </div>`;
            });
        }).catch((error) => {
            console.error("Error fetching reviews: ", error);
        });
    }

    // Delete a Review
    window.deleteReview = function (reviewId) {
        if (confirm("Are you sure you want to delete this review?")) {
            db.collection("reviews").doc(reviewId).delete().then(() => {
                fetchReviews(); // Refresh the reviews list
            }).catch((error) => {
                console.error("Error deleting review: ", error);
            });
        }
    };

    // Initial Fetch
    fetchReviews();
});