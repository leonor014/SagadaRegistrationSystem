document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();
    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", async function (event) {
        event.preventDefault();
       
        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
       
        try {
            await db.collection("registrations").add({ fullName, email, phone });
            alert("Registration successful!");
            registrationForm.reset();
        } catch (error) {
            console.error("Error registering tourist: ", error);
        }
    });
});

