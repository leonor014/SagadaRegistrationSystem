document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();
    const sectionsContainer = document.getElementById("sections-container");

    async function loadGuidelines() {
        sectionsContainer.innerHTML = "";

        const snapshot = await db.collection("guidelines").get();
        snapshot.forEach(doc => {
            const guidelineData = doc.data();
            const sectionDiv = document.createElement("section");
            sectionDiv.innerHTML = `<h2>${guidelineData.section}</h2><ul>${guidelineData.content.map(item => `<li>${item}</li>`).join("")}</ul>`;
            sectionsContainer.appendChild(sectionDiv);
        });
    }

    loadGuidelines();
});
