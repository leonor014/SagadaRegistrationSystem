document.addEventListener("DOMContentLoaded", function () {
    const touristSpotsContainer = document.getElementById("tourist-spots-container");

    // Initialize with default tourist spots if empty
    if (!localStorage.getItem("touristSpots-caves")) {
        const defaultSpots = {
            "touristSpots-caves": [
                {
                    name: "Sumaguing Cave",
                    description: "The most popular cave in Sagada with stunning rock formations.",
                    image: "images/sumaguing.jpg",
                    guideFee: 500,
                    shuttleFee: 300
                },
                {
                    name: "Lumiang Cave",
                    description: "Burial cave with ancient coffins at its entrance.",
                    image: "images/lumiang.jpg",
                    guideFee: 400,
                    shuttleFee: 300
                }
            ],
            "touristSpots-falls": [
                {
                    name: "Bomod-Ok Falls",
                    description: "Majestic waterfall with a deep natural pool for swimming.",
                    image: "images/bomodok.jpg",
                    guideFee: 600,
                    shuttleFee: 400
                },
                {
                    name: "Bokong Falls",
                    description: "Smaller but beautiful waterfall near the town center.",
                    image: "images/bokong.jpg",
                    guideFee: 300,
                    shuttleFee: 0
                }
            ]
        };

        // Store default spots
        Object.entries(defaultSpots).forEach(([key, spots]) => {
            localStorage.setItem(key, JSON.stringify(spots));
        });
    }

    // Display Tourist Spots (READ-ONLY)
    function showTouristSpots() {
        touristSpotsContainer.innerHTML = "";

        // Show all tourist spot sections
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("touristSpots")) {
                const sectionName = key.replace("touristSpots-", "").toUpperCase();
                const spots = JSON.parse(localStorage.getItem(key));
                
                const sectionDiv = document.createElement("section");
                sectionDiv.className = "tourist-section";
                sectionDiv.innerHTML = `<h2>${sectionName}</h2>`;
                touristSpotsContainer.appendChild(sectionDiv);

                // Create a container for spots in this section
                const spotsContainer = document.createElement("div");
                spotsContainer.className = "spots-container";
                sectionDiv.appendChild(spotsContainer);

                // Add each spot
                spots.forEach(spot => {
                    spotsContainer.innerHTML += `
                        <div class="tourist-spot">
                            <h3>${spot.name}</h3>
                            <img src="${spot.image}" alt="${spot.name}" class="spot-image">
                            <div class="spot-details">
                                <p><strong>Description:</strong> ${spot.description}</p>
                                <p><strong>Guide Fee:</strong> ₱${spot.guideFee}</p>
                                <p><strong>Shuttle Fee:</strong> ₱${spot.shuttleFee}</p>
                            </div>
                        </div>`;
                });
            }
        }
    }

    // Initial render
    showTouristSpots();
});