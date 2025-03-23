document.addEventListener("DOMContentLoaded", function () {
    const touristSpotsContainer = document.getElementById("tourist-spots-container");

    // Initialize localStorage for Tourist Spots if empty
    if (!localStorage.getItem("touristSpots")) {
        localStorage.setItem("touristSpots", JSON.stringify([]));
    }

    function renderTouristSpots() {
        touristSpotsContainer.innerHTML = "";

        // Loop through localStorage keys for Tourist Spots
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("touristSpots")) {
                const section = key.split("-")[1]; // Extract section name (e.g., caves, falls)

                // Render section in the Tourist Spots container
                const sectionDiv = document.createElement("section");
                sectionDiv.innerHTML = `<h2>${section.toUpperCase()}</h2><div id="${key}-list"></div>`;
                touristSpotsContainer.appendChild(sectionDiv);

                // Render items in the section
                const storedData = JSON.parse(localStorage.getItem(key)) || [];
                const list = document.getElementById(`${key}-list`);
                list.innerHTML = "";
                storedData.forEach((spot, index) => {
                    list.innerHTML += `
                        <div class="tourist-spot" id="${key}-${index}">
                            <h3>${spot.name}</h3>
                            <img src="${spot.image}" alt="${spot.name}" width="200">
                            <p><strong>Description:</strong> ${isAdminMode ? `<textarea class="editable">${spot.description}</textarea>` : spot.description}</p>
                            <p><strong>Guide Fee:</strong> ${isAdminMode ? `<input type="number" class="editable" value="${spot.guideFee}">` : spot.guideFee}</p>
                            <p><strong>Shuttle Fee:</strong> ${isAdminMode ? `<input type="number" class="editable" value="${spot.shuttleFee}">` : spot.shuttleFee}</p>
                            ${isAdminMode ? `
                                <button onclick="updateTouristSpot('${key}', ${index})">Save Changes</button>
                                <button onclick="deleteTouristSpot('${key}', ${index})">Delete</button>
                            ` : ""}
                        </div>`;
                });
            }
        }
    }

    // Update a Tourist Spot
    window.updateTouristSpot = function (key, index) {
        const spotElement = document.getElementById(`${key}-${index}`);
        const description = spotElement.querySelector("textarea").value;
        const guideFee = parseInt(spotElement.querySelector("input[type='number']").value);
        const shuttleFee = parseInt(spotElement.querySelectorAll("input[type='number']")[1].value);

        const storedData = JSON.parse(localStorage.getItem(key)) || [];
        storedData[index] = {
            ...storedData[index],
            description,
            guideFee,
            shuttleFee
        };
        localStorage.setItem(key, JSON.stringify(storedData));
        renderTouristSpots(); // Re-render the tourist spots
    };

    // Delete a Tourist Spot
    window.deleteTouristSpot = function (key, index) {
        if (confirm("Are you sure you want to delete this tourist spot?")) {
            const storedData = JSON.parse(localStorage.getItem(key)) || [];
            storedData.splice(index, 1); // Remove the tourist spot
            localStorage.setItem(key, JSON.stringify(storedData));
            renderTouristSpots(); // Re-render the tourist spots
        }
    };

    // Add a new Tourist Spot
    window.addNewTouristSpot = function () {
        const section = sectionSelect.value;
        const storedData = JSON.parse(localStorage.getItem(section)) || [];
        const newSpot = {
            name: "New Tourist Spot",
            description: "Description of the new tourist spot.",
            image: "images/default.jpg",
            guideFee: 0,
            shuttleFee: 0
        };
        storedData.push(newSpot);
        localStorage.setItem(section, JSON.stringify(storedData));
        renderTouristSpots(); // Re-render the tourist spots
    };
});