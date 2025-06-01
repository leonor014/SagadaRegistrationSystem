document.addEventListener("DOMContentLoaded", function () {
    const guidelinesContainer = document.getElementById("guidelines-sections-container");
    const faqContainer = document.getElementById("faq-sections-container");

    // Initialize with default content if empty
    if (!localStorage.getItem("guidelines-tours")) {
        const defaultContent = {
            // TOURIST GUIDELINES
            "guidelines-tours": [
                "All tourists must register at the Tourist Information Center (TIC).",
                "Book tours only at the Tour Guides Organization offices.",
                "Keep your official receipt as it serves as your entrance pass.",
                "Only engage ACCREDITED GUIDES (wearing current ID). Report unauthorized guides."
            ],
            "guidelines-accommodation": [
                "Book accommodation in registered establishments only.",
                "Inform your lodging if you'll return late.",
                "Maintain quiet hours for all guests."
            ],
            "guidelines-transportation": [
                "Park tourist vehicles in designated areas throughout your stay.",
                "Central town areas are walking tours. Support local shuttle drivers for farther sites."
            ],
            "guidelines-environment": [
                "Minimize plastic use - bring reusable water bottles.",
                "Use eco-bags for purchases.",
                "No littering - dispose garbage properly."
            ],
            "guidelines-culture": [
                "Respect sacred grounds - no loud noises at burial sites.",
                "Ask permission before photographing people or joining rituals.",
                "Avoid asking locals to wear traditional clothing for photos.",
                "Dress modestly and avoid public displays of affection."
            ],
            
            // FAQ SECTION
            "faq-general": [
                "Q: What are must-do activities in Sagada?",
                "A: Explore Sumaguing Cave, see the Hanging Coffins, trek to Bomod-Ok Falls, and watch sunrise at Kiltepan.",
                "Q: Best time to visit Sagada?",
                "A: November to May during the dry season for cooler, clearer weather."
            ],
            "faq-travel": [
                "Q: How to reach Sagada?",
                "A: Take a bus from Baguio or Manila, then transfer to a van/jeepney to Sagada."
            ],
            "faq-accommodation": [
                "Q: Are there accommodations in Sagada?",
                "A: Yes, ranging from budget hostels to mid-range inns. Book in advance during peak seasons."
            ]
        };

        // Store default content
        Object.entries(defaultContent).forEach(([key, content]) => {
            localStorage.setItem(key, JSON.stringify(content));
        });
    }

    // Display Tourist Guidelines (READ-ONLY)
    function showGuidelines() {
        guidelinesContainer.innerHTML = "";
        
        // Show all guideline sections
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("guidelines")) {
                const sectionName = key.replace("guidelines-", "").replace(/-/g, " ").toUpperCase();
                const guidelines = JSON.parse(localStorage.getItem(key));
                
                guidelinesContainer.innerHTML += `
                    <section class="guideline-section">
                        <h2>${sectionName}</h2>
                        <ul class="guideline-list">
                            ${guidelines.map(item => `<li>${item}</li>`).join("")}
                        </ul>
                    </section>`;
            }
        }
    }

    // Display FAQs (READ-ONLY)
    function showFAQs() {
        faqContainer.innerHTML = "";
        
        // Show all FAQ sections
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("faq")) {
                const sectionName = key.replace("faq-", "").replace(/-/g, " ").toUpperCase();
                const faqItems = JSON.parse(localStorage.getItem(key));
                let faqHTML = "";
                
                // Pair questions and answers
                for (let i = 0; i < faqItems.length; i += 2) {
                    faqHTML += `
                        <div class="faq-item">
                            <h3 class="faq-question">${faqItems[i].replace("Q: ", "")}</h3>
                            <p class="faq-answer">${faqItems[i+1].replace("A: ", "")}</p>
                        </div>`;
                }
                
                faqContainer.innerHTML += `
                    <section class="faq-section">
                        <h2>${sectionName}</h2>
                        <div class="faq-items">${faqHTML}</div>
                    </section>`;
            }
        }
    }

    // Initial render
    showGuidelines();
    showFAQs();
});