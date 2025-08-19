// Shared Admin Control System
document.addEventListener("DOMContentLoaded", function () {
    const adminControls = document.getElementById("admin-controls");
    const adminEditSection = document.getElementById("admin-edit-section");

    let isAdminMode = false;

    // Toggle admin mode for all pages
    window.toggleAdminMode = function () {
        isAdminMode = !isAdminMode;
        adminEditSection.style.display = isAdminMode ? "block" : "none";

        // Trigger rendering for all pages
        if (typeof renderAnalytics === "function") renderAnalytics();
        if (typeof renderTouristSpots === "function") renderTouristSpots();
        if (typeof renderReviews === "function") renderReviews();
    };

    // Initialize localStorage for all pages
    function initializeLocalStorage() {
        // Initialize analytics data
        if (!localStorage.getItem("analytics-data")) {
            localStorage.setItem("analytics-data", JSON.stringify({
                monthlyStats: [300, 350, 500, 1000, 800, 912, 2100, 750, 650, 600, 550, 900],
                topNonFilipinoTourists: ["USA", "Japan", "Australia", "China", "Germany", "France", "UK", "Canada", "India", "South Korea"],
                topPhilippineRegions: ["NCR", "Region IV-A", "Region III", "Region VII", "Region XI", "Region VI", "Region X", "Region IX", "Region V", "Region I"],
                sexDemographics: { male: 200, female: 600 }
            }));
        }

        // Initialize tourist spots data
        if (!localStorage.getItem("tourist-spots")) {
            localStorage.setItem("tourist-spots", JSON.stringify([
                {
                    name: "Sumaguing Cave",
                    description: "Known as the 'Big Cave,' Sumaguing Cave offers a thrilling spelunking experience.",
                    imageUrl: "images/sumaguing-cave.jpg",
                    fees: "GUIDE FEE: P800.00 for maximum of 5 pax"
                },
                {
                    name: "Bomod-ok Falls",
                    description: "Known as the 'Big Falls,' Bomod-ok Falls offers an unforgettable trek through rice terraces.",
                    imageUrl: "images/bomod-ok-falls.jpg",
                    fees: "GUIDE FEE: P500 for maximum of 7 pax"
                }
            ]));
        }

        // Initialize reviews data
        if (!localStorage.getItem("reviews")) {
            localStorage.setItem("reviews", JSON.stringify([
                {
                    comment: "Amazing experience!",
                    rating: 5,
                    imageUrl: "images/review1.jpg"
                },
                {
                    comment: "Beautiful scenery!",
                    rating: 4,
                    imageUrl: "images/review2.jpg"
                }
            ]));
        }
    }

    // Initialize localStorage and render content
    initializeLocalStorage();
});