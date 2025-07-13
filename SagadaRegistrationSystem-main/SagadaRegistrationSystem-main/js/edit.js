document.addEventListener("DOMContentLoaded", function () {
    const adminDashboard = document.getElementById("admin-dashboard");
    const adminControls = document.getElementById("admin-controls");
    const adminEditSection = document.getElementById("admin-edit-section");

    let isAdminMode = false;

    // Toggle admin mode
    window.toggleAdminMode = function () {
        isAdminMode = !isAdminMode;
        adminEditSection.style.display = isAdminMode ? "block" : "none";
        if (isAdminMode) renderGuidelines(); // Default view when admin mode is toggled
    };

    // Initialize localStorage with default data
    function initializeLocalStorage() {
        // Default analytics data
        if (!localStorage.getItem("analytics-data")) {
            localStorage.setItem("analytics-data", JSON.stringify({
                monthlyStats: [300, 350, 500, 1000, 800, 912, 2100, 750, 650, 600, 550, 900],
                topNonFilipinoTourists: ["USA", "Japan", "Australia", "China", "Germany", "France", "UK", "Canada", "India", "South Korea"],
                topPhilippineRegions: ["NCR", "Region IV-A", "Region III", "Region VII", "Region XI", "Region VI", "Region X", "Region IX", "Region V", "Region I"],
                sexDemographics: { male: 200, female: 600 }
            }));
        }

        // Default tourist spots data
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

        // Default reviews data
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

        // Default tourist guidelines data
        if (!localStorage.getItem("guidelines")) {
            localStorage.setItem("guidelines", JSON.stringify({
                tours: [
                    "All tourists are required to register at the Tourist Information Center (TIC).",
                    "Book your tours at the Tour Guides Organization offices.",
                    "Guests should keep their official receipt as it serves as entrance pass to the sites.",
                    "Never engage in the services of children for tour activities. Engage services of ACCREDITED GUIDES (they should be wearing their current ID). Kindly report those who are not wearing one."
                ],
                accommodation: [
                    "Please book your accommodation in a registered establishment.",
                    "Inform your lodging house if you will be back late.",
                    "Always minimize noise."
                ],
                transportation: [
                    "All tourist vehicles (private & agency-owned/hired) are required to park all throughout the duration of their stay in their hotel parking area or in any designated parking area.",
                    "Central town including hanging coffins, Sagada Weaving and Ganduyan Museum are walking tours. Farther tourist sites require a ride, please support the livelihood of local shuttle drivers."
                ],
                environment: [
                    "Minimize the use of plastics. Please bring your own reusable water bottles.",
                    "Please bring your own ecobag preferably eco-bag for your purchases.",
                    "No littering. Bring back your garbage to your lodging houses or dispose it properly in available trash bins."
                ],
                culture: [
                    "Respect all sacred grounds and sites like hanging coffins, church, and burial caves. Refrain from making loud noises.",
                    "Avoid joining any rituals without permission from the elders. Ask permission before taking pictures of people, especially elders.",
                    "Please refrain from asking locals to wear traditional clothing just for pictures.",
                    "Please do not wear scanty clothes and refrain from public display of affection."
                ]
            }));
        }

        // Default FAQ data
        if (!localStorage.getItem("faq")) {
            localStorage.setItem("faq", JSON.stringify({
                general: [
                    "Q: What are the best activities to do in Sagada?",
                    "A: Some popular activities include exploring Sumaguing Cave, visiting the Hanging Coffins, trekking to Bomod-Ok Falls, and watching the sunrise at Kiltepan Viewpoint.",
                    "Q: What is the best time to visit Sagada?",
                    "A: The best time to visit is from November to May, during the dry season when the weather is cooler and clear for outdoor activities."
                ],
                travel: [
                    "Q: How do I get to Sagada?",
                    "A: The easiest way is to travel by bus from Baguio City or Manila. From there, you can take a van or jeepney to Sagada."
                ],
                accommodation: [
                    "Q: Are there accommodations in Sagada?",
                    "A: Yes, there are a variety of accommodations available, ranging from budget hostels to mid-range inns and lodges. It is advisable to book in advance, especially during peak seasons."
                ]
            }));
        }
    }

    // Render analytics data
    window.renderAnalytics = function () {
        const data = JSON.parse(localStorage.getItem("analytics-data"));
        adminDashboard.innerHTML = `
            <h2>Analytics</h2>
            <h3>Monthly Statistics</h3>
            <ul>
                ${data.monthlyStats.map((value, index) => `
                    <li>
                        ${isAdminMode ? `<input type="number" value="${value}" onchange="updateMonthlyStat(${index}, this.value)" />` : value}
                    </li>
                `).join("")}
            </ul>
            <h3>Top Non-Filipino Tourists</h3>
            <ul>
                ${data.topNonFilipinoTourists.map((country, index) => `
                    <li>
                        ${isAdminMode ? `<input type="text" value="${country}" onchange="updateTopTourist(${index}, this.value)" />` : country}
                    </li>
                `).join("")}
            </ul>
            <h3>Sex Demographics</h3>
            <ul>
                <li>Male: ${isAdminMode ? `<input type="number" value="${data.sexDemographics.male}" onchange="updateSexDemographic('male', this.value)" />` : data.sexDemographics.male}</li>
                <li>Female: ${isAdminMode ? `<input type="number" value="${data.sexDemographics.female}" onchange="updateSexDemographic('female', this.value)" />` : data.sexDemographics.female}</li>
            </ul>
        `;
    };

    // Render tourist spots
    window.renderTouristSpots = function () {
        const spots = JSON.parse(localStorage.getItem("tourist-spots")) || [];
        adminDashboard.innerHTML = `
            <h2>Tourist Spots</h2>
            ${spots.map((spot, index) => `
                <div class="spot-content">
                    <h2>${isAdminMode ? `<input type="text" value="${spot.name}" onchange="updateTouristSpot(${index}, 'name', this.value)" />` : spot.name}</h2>
                    <p>${isAdminMode ? `<textarea onchange="updateTouristSpot(${index}, 'description', this.value)">${spot.description}</textarea>` : spot.description}</p>
                    <img src="${spot.imageUrl}" alt="${spot.name}" />
                    <p>${isAdminMode ? `<input type="text" value="${spot.fees}" onchange="updateTouristSpot(${index}, 'fees', this.value)" />` : spot.fees}</p>
                    ${isAdminMode ? `<button onclick="deleteTouristSpot(${index})">Delete</button>` : ""}
                </div>
            `).join("")}
        `;
    };

    // Render reviews
    window.renderReviews = function () {
        const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        adminDashboard.innerHTML = `
            <h2>Reviews</h2>
            ${reviews.map((review, index) => `
                <div class="review">
                    <p>Comment: ${isAdminMode ? `<textarea onchange="updateReview(${index}, 'comment', this.value)">${review.comment}</textarea>` : review.comment}</p>
                    <p>Rating: ${isAdminMode ? `<input type="number" value="${review.rating}" onchange="updateReview(${index}, 'rating', this.value)" />` : review.rating}</p>
                    <img src="${review.imageUrl}" alt="Review Image" />
                    ${isAdminMode ? `<button onclick="deleteReview(${index})">Delete</button>` : ""}
                </div>
            `).join("")}
        `;
    };

    // Render tourist guidelines
    window.renderGuidelines = function () {
        const guidelines = JSON.parse(localStorage.getItem("guidelines"));
        adminDashboard.innerHTML = `
            <h2>Tourist Guidelines</h2>
            ${Object.entries(guidelines).map(([section, items]) => `
                <h3>${section.toUpperCase()}</h3>
                <ul>
                    ${items.map((item, index) => `
                        <li>
                            ${isAdminMode ? `<input type="text" value="${item}" onchange="updateGuideline('${section}', ${index}, this.value)" />` : item}
                            ${isAdminMode ? `<button onclick="deleteGuideline('${section}', ${index})">Delete</button>` : ""}
                        </li>
                    `).join("")}
                </ul>
            `).join("")}
        `;
    };

    // Render FAQ
    window.renderFAQ = function () {
        const faq = JSON.parse(localStorage.getItem("faq"));
        adminDashboard.innerHTML = `
            <h2>FAQ</h2>
            ${Object.entries(faq).map(([section, items]) => `
                <h3>${section.toUpperCase()}</h3>
                <ul>
                    ${items.map((item, index) => `
                        <li>
                            ${isAdminMode ? `<input type="text" value="${item}" onchange="updateFAQ('${section}', ${index}, this.value)" />` : item}
                            ${isAdminMode ? `<button onclick="deleteFAQ('${section}', ${index})">Delete</button>` : ""}
                        </li>
                    `).join("")}
                </ul>
            `).join("")}
        `;
    };

    // Initialize localStorage and render default content
    initializeLocalStorage();
    renderGuidelines(); // Default view
});

// Update a guideline item
window.updateGuideline = function (section, index, value) {
    const guidelines = JSON.parse(localStorage.getItem("guidelines"));
    guidelines[section][index] = value;
    localStorage.setItem("guidelines", JSON.stringify(guidelines));
    renderGuidelines();
};

// Delete a guideline item
window.deleteGuideline = function (section, index) {
    if (confirm("Are you sure you want to delete this guideline?")) {
        const guidelines = JSON.parse(localStorage.getItem("guidelines"));
        guidelines[section].splice(index, 1);
        localStorage.setItem("guidelines", JSON.stringify(guidelines));
        renderGuidelines();
    }
};

// Update an FAQ item
window.updateFAQ = function (section, index, value) {
    const faq = JSON.parse(localStorage.getItem("faq"));
    faq[section][index] = value;
    localStorage.setItem("faq", JSON.stringify(faq));
    renderFAQ();
};

// Delete an FAQ item
window.deleteFAQ = function (section, index) {
    if (confirm("Are you sure you want to delete this FAQ item?")) {
        const faq = JSON.parse(localStorage.getItem("faq"));
        faq[section].splice(index, 1);
        localStorage.setItem("faq", JSON.stringify(faq));
        renderFAQ();
    }
};