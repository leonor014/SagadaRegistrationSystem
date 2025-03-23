document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();
    const faqContainer = document.querySelector(".faq-container");

    async function loadFAQs() {
        faqContainer.innerHTML = "<h1>Frequently Asked Questions</h1>";

        const snapshot = await db.collection("faqs").get();
        snapshot.forEach(doc => {
            const faqData = doc.data();
            const faqDiv = document.createElement("div");
            faqDiv.className = "faq-question";
            faqDiv.innerHTML = `<strong>Q: ${faqData.question}</strong>
                <p class="faq-answer">A: ${faqData.answer}</p>`;
            faqContainer.appendChild(faqDiv);
        });
    }

    loadFAQs();
});
