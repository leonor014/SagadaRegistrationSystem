document.addEventListener("DOMContentLoaded", function () {
    const analyticsContainer = document.getElementById("analytics-container");

    // Initialize localStorage for Analytics if empty
    if (!localStorage.getItem("analytics")) {
        localStorage.setItem("analytics", JSON.stringify([]));
    }

    // Render Analytics Data
    function renderAnalytics() {
        const analyticsData = JSON.parse(localStorage.getItem("analytics")) || [];
        analyticsContainer.innerHTML = "";
        analyticsData.forEach((data, index) => {
            analyticsContainer.innerHTML += `
                <div class="analytics-item" id="analytics-${index}">
                    <p><strong>${data.name}:</strong> ${data.value}</p>
                    <button onclick="editAnalytics(${index})">Edit</button>
                    <button onclick="deleteAnalytics(${index})">Delete</button>
                </div>`;
        });
    }

    // Add New Analytics Data
    window.addAnalytics = function () {
        const name = document.getElementById("analytics-name").value;
        const value = document.getElementById("analytics-value").value;
        if (name && value) {
            const analyticsData = JSON.parse(localStorage.getItem("analytics")) || [];
            analyticsData.push({ name, value });
            localStorage.setItem("analytics", JSON.stringify(analyticsData));
            renderAnalytics();
        } else {
            alert("Please fill in both fields.");
        }
    };

    // Edit Analytics Data
    window.editAnalytics = function (index) {
        const analyticsData = JSON.parse(localStorage.getItem("analytics")) || [];
        const newName = prompt("Enter new name:", analyticsData[index].name);
        const newValue = prompt("Enter new value:", analyticsData[index].value);
        if (newName && newValue) {
            analyticsData[index] = { name: newName, value: newValue };
            localStorage.setItem("analytics", JSON.stringify(analyticsData));
            renderAnalytics();
        }
    };

    // Delete Analytics Data
    window.deleteAnalytics = function (index) {
        if (confirm("Are you sure you want to delete this data?")) {
            const analyticsData = JSON.parse(localStorage.getItem("analytics")) || [];
            analyticsData.splice(index, 1);
            localStorage.setItem("analytics", JSON.stringify(analyticsData));
            renderAnalytics();
        }
    };

    // Initial Render
    renderAnalytics();
});