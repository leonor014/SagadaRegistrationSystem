document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();
    const siteSelect = document.getElementById("siteSelect");

    async function submitAttendance() {
        const registrationNumber = document.getElementById("registrationNumber").value;
        const selectedSite = siteSelect.value;

        try {
            await db.collection("siteRegistrations").add({ registrationNumber, selectedSite });
            alert("Attendance submitted successfully!");
        } catch (error) {
            console.error("Error submitting attendance: ", error);
        }
    }

    document.querySelector("button").addEventListener("click", submitAttendance);
});
