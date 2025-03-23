document.addEventListener("DOMContentLoaded", function () {
    const guidelinesContainer = document.getElementById("guidelines-sections-container");
    const faqContainer = document.getElementById("faq-sections-container");
    const sectionSelect = document.getElementById("section-select");
    const editType = document.getElementById("edit-type"); // Dropdown to select Guidelines or FAQ
    const adminControls = document.getElementById("admin-controls");
    const adminEditSection = document.getElementById("admin-edit-section");

    // Simulate admin mode (can be toggled by the admin)
    let isAdminMode = false;

    // Initialize localStorage with original content for Guidelines and FAQ
    function initializeLocalStorage() {
        const originalContent = {
            guidelines: {
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
                ]
            },
            faq: {
                general: [
                    "Q: What are the best activities to do in Sagada?",
                    "A: Some popular activities include exploring Sumaguing Cave, visiting the Hanging Coffins, trekking to Bomod-Ok Falls, and watching the sunrise at Kiltepan Viewpoint."
                ],
                travel: [
                    "Q: How do I get to Sagada?",
                    "A: The easiest way is to travel by bus from Baguio City or Manila. From there, you can take a van or jeepney to Sagada."
                ]
            }
        };

        // Initialize localStorage for Guidelines and FAQ if empty
        for (const [sectionType, sections] of Object.entries(originalContent)) {
            for (const [section, content] of Object.entries(sections)) {
                const key = `${sectionType}-${section}`;
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify(content));
                }
            }
        }
    }

    // Populate the dropdown menu with sections of the selected type
    function populateSectionDropdown() {
        if (!sectionSelect) return; // Ensure the element exists
        sectionSelect.innerHTML = ""; // Clear existing options
        const selectedType = editType.value; // Get selected type (guidelines or faq)

        // Loop through localStorage keys for the selected type
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith(selectedType)) {
                const section = key.split("-")[1]; // Extract section name
                sectionSelect.innerHTML += `<option value="${key}">${section}</option>`;
            }
        }
    }

    // Render Tourist Guidelines sections
    function renderGuidelines() {
        if (!guidelinesContainer) return; // Ensure the element exists
        guidelinesContainer.innerHTML = "";

        // Loop through localStorage keys for Guidelines
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("guidelines")) {
                const section = key.split("-")[1]; // Extract section name

                // Render section in the Guidelines container
                const sectionDiv = document.createElement("section");
                sectionDiv.innerHTML = `<h2>${section.toUpperCase()}</h2><ul id="${key}-list"></ul>`;
                guidelinesContainer.appendChild(sectionDiv);

                // Render items in the section
                const storedData = JSON.parse(localStorage.getItem(key)) || [];
                const list = document.getElementById(`${key}-list`);
                list.innerHTML = "";
                storedData.forEach((item, index) => {
                    list.innerHTML += `
                        <li id="${key}-${index}">
                            ${isAdminMode ? `<input type="text" value="${item}" class="editable" onchange="updateItem('${key}', ${index}, this.value)" />` : item}
                            ${isAdminMode ? `<button onclick="deleteItem('${key}', ${index})">Delete</button>` : ""}
                        </li>`;
                });
            }
        }
    }

    // Render FAQ sections
    function renderFAQ() {
        if (!faqContainer) {
            console.error("FAQ container not found!");
            return; // Ensure the element exists
        }
        faqContainer.innerHTML = "";

        // Loop through localStorage keys for FAQ
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("faq")) {
                const section = key.split("-")[1]; // Extract section name
                console.log(`Rendering FAQ section: ${section}`);

                // Render section in the FAQ container
                const sectionDiv = document.createElement("section");
                sectionDiv.innerHTML = `<h2>${section.toUpperCase()}</h2><ul id="${key}-list"></ul>`;
                faqContainer.appendChild(sectionDiv);

                // Render items in the section
                const storedData = JSON.parse(localStorage.getItem(key)) || [];
                console.log(`Data for ${key}:`, storedData);

                const list = document.getElementById(`${key}-list`);
                if (!list) {
                    console.error(`List element not found for key: ${key}`);
                    continue;
                }
                list.innerHTML = "";
                for (let i = 0; i < storedData.length; i += 2) {
                    const question = storedData[i];
                    const answer = storedData[i + 1];
                    if (question && answer) { // Ensure both question and answer exist
                        list.innerHTML += `
                            <li id="${key}-${i}">
                                <strong>${isAdminMode ? `<input type="text" value="${question}" class="editable" onchange="updateItem('${key}', ${i}, this.value)" />` : question}</strong>
                                <p>${isAdminMode ? `<input type="text" value="${answer}" class="editable" onchange="updateItem('${key}', ${i + 1}, this.value)" />` : answer}</p>
                                ${isAdminMode ? `<button onclick="deleteItem('${key}', ${i})">Delete</button>` : ""}
                            </li>`;
                    }
                }
            }
        }

        console.log("FAQ rendered:", faqContainer.innerHTML);
    }

    // Toggle admin mode to show/hide edit controls
    window.toggleAdminMode = function () {
        isAdminMode = !isAdminMode;
        if (adminEditSection) adminEditSection.style.display = isAdminMode ? "block" : "none";
        populateSectionDropdown(); // Populate the dropdown when admin mode is toggled
        renderGuidelines();
        renderFAQ();
    };

    // Create a new section
    window.createNewSection = function () {
        const newSectionName = document.getElementById("new-section-name").value.trim();
        const selectedType = editType.value; // Get selected type (guidelines or faq)
        const key = `${selectedType}-${newSectionName}`;

        if (newSectionName && !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify([]));
            populateSectionDropdown(); // Update the dropdown after creating a new section
            if (selectedType === "guidelines") {
                renderGuidelines();
            } else if (selectedType === "faq") {
                renderFAQ();
            }
            document.getElementById("new-section-name").value = ""; // Clear input
        } else {
            alert("Section name is empty or already exists!");
        }
    };

    // Add a new item to the selected section
    window.addNewItem = function () {
        const section = sectionSelect.value;
        const storedData = JSON.parse(localStorage.getItem(section)) || [];
        if (editType.value === "guidelines") {
            storedData.push("New Item");
        } else if (editType.value === "faq") {
            storedData.push("New Question", "New Answer");
        }
        localStorage.setItem(section, JSON.stringify(storedData));
        if (editType.value === "guidelines") {
            renderGuidelines();
        } else if (editType.value === "faq") {
            renderFAQ();
        }
    };

    // Update an existing item in the section
    window.updateItem = function (section, index, value) {
        const storedData = JSON.parse(localStorage.getItem(section)) || [];
        storedData[index] = value;
        localStorage.setItem(section, JSON.stringify(storedData));
        if (section.startsWith("guidelines")) {
            renderGuidelines();
        } else if (section.startsWith("faq")) {
            renderFAQ();
        }
    };

    // Delete an item from the section
    window.deleteItem = function (section, index) {
        if (confirm("Are you sure you want to delete this item?")) {
            const storedData = JSON.parse(localStorage.getItem(section)) || [];
            if (section.startsWith("faq")) {
                storedData.splice(index, 2); // Delete both question and answer for FAQ
            } else {
                storedData.splice(index, 1); // Delete single item for Guidelines
            }
            localStorage.setItem(section, JSON.stringify(storedData));
            if (section.startsWith("guidelines")) {
                renderGuidelines();
            } else if (section.startsWith("faq")) {
                renderFAQ();
            }
        }
    };

    // Delete an entire section
    window.deleteSection = function () {
        const section = sectionSelect.value;
        if (confirm(`Are you sure you want to delete the entire section "${section}"?`)) {
            localStorage.removeItem(section);
            populateSectionDropdown(); // Update the dropdown after deleting a section
            if (section.startsWith("guidelines")) {
                renderGuidelines();
            } else if (section.startsWith("faq")) {
                renderFAQ();
            }
        }
    };

    // Initialize localStorage and render sections
    initializeLocalStorage();
    populateSectionDropdown(); // Populate the dropdown on page load
    renderGuidelines();
    renderFAQ();

    // Add event listener to edit-type dropdown to re-render sections when changed
    if (editType) {
        editType.addEventListener("change", function () {
            populateSectionDropdown(); // Update the dropdown when the selected type changes
            renderGuidelines();
            renderFAQ();
        });
    }
});