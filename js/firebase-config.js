// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
    authDomain: "sagadatouristregister.firebaseapp.com",
    projectId: "sagadatouristregister",
    storageBucket: "sagadatouristregister.appspot.com",
    messagingSenderId: "875774905793",
    appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
    measurementId: "G-2VF5GCQGZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch and display data
async function fetchData(collectionName, displayElementId) {
    const displayElement = document.getElementById(displayElementId);
    displayElement.innerHTML = "<p>Loading...</p>";

    const querySnapshot = await getDocs(collection(db, collectionName));
    displayElement.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        let content = "";

        // Customize display based on collection type
        switch (collectionName) {

            case "tourist-spots":
                content = `
                    <div class="data-card">
                        <h3>${data.name}</h3>
                        <p>${data.description}</p>
                        <p><strong>Category:</strong> ${data.category}</p>
                        <div class="button-group">
                            <button onclick="editTouristSpot('${doc.id}', '${data.name}', '${data.description}', '${data.category}')">Edit</button>
                            <button onclick="deleteData('${collectionName}', '${doc.id}')">Delete</button>
                        </div>
                    </div>
                `;
                break;


            case "reviews":
                content = `
                    <div class="data-card">
                        <h3>${data.comment}</h3>
                        <p><strong>Rating:</strong> ${data.rating}</p>
                        <div class="button-group">
                            <button onclick="editReview('${doc.id}', '${data.comment}', '${data.rating}')">Edit</button>
                            <button onclick="deleteData('${collectionName}', '${doc.id}')">Delete</button>
                        </div>
                    </div>
                `;
                break;

            case "analytics":
                content = `
                    <div class="data-card">
                        <h3>${data.title}</h3>
                        <p>${data.description}</p>
                        <div class="button-group">
                            <button onclick="editAnalytics('${doc.id}', '${data.title}', '${data.description}')">Edit</button>
                            <button onclick="deleteData('${collectionName}', '${doc.id}')">Delete</button>
                        </div>
                    </div>
                `;
                break;

            default:
                content = `<p>No data found for ${collectionName}.</p>`;
        }

        displayElement.innerHTML += content;
    });
}

// Function to add data
async function addData(collectionName, formId) {
    const form = document.getElementById(formId);
    let data = {};

    // Customize data based on collection type
    switch (collectionName) {
        
        case "tourist-spots":
            data = {
                name: form.querySelector("#spot-name").value,
                description: form.querySelector("#spot-desc").value,
                category: form.querySelector("#spot-category").value
            };
            break;


        case "reviews":
            data = {
                comment: form.querySelector("#comment").value,
                rating: form.querySelector("input[name='rating']:checked").value
            };
            break;

        case "analytics":
            data = {
                title: form.querySelector("#name-analytics").value,
                description: form.querySelector("#desc-analytics").value
            };
            break;
    }

    if (Object.keys(data).length > 0) {
        await addDoc(collection(db, collectionName), data);
        alert("Data added successfully!");
        form.reset();
        fetchData(collectionName, `${collectionName}-list`);
    } else {
        alert("Please fill in all fields.");
    }
}


// Function to edit Tourist Spot
async function editTouristSpot(id, name, description, category) {
    const newName = prompt("Edit Name:", name);
    const newDescription = prompt("Edit Description:", description);
    const newCategory = prompt("Edit Category:", category);

    if (newName && newDescription && newCategory) {
        await updateDoc(doc(db, "tourist-spots", id), {
            name: newName,
            description: newDescription,
            category: newCategory
        });
        alert("Tourist Spot updated successfully!");
        fetchData("tourist-spots", "tourist-spots-list");
    }
}

// Function to edit Review
async function editReview(id, comment, rating) {
    const newComment = prompt("Edit Comment:", comment);
    const newRating = prompt("Edit Rating (1-5):", rating);

    if (newComment && newRating) {
        await updateDoc(doc(db, "reviews", id), {
            comment: newComment,
            rating: newRating
        });
        alert("Review updated successfully!");
        fetchData("reviews", "reviews-list");
    }
}

// Function to edit Analytics
async function editAnalytics(id, title, description) {
    const newTitle = prompt("Edit Title:", title);
    const newDescription = prompt("Edit Description:", description);

    if (newTitle && newDescription) {
        await updateDoc(doc(db, "analytics", id), {
            title: newTitle,
            description: newDescription
        });
        alert("Analytics updated successfully!");
        fetchData("analytics", "analytics-list");
    }
}

// Function to delete data
async function deleteData(collectionName, docId) {
    if (confirm("Are you sure you want to delete this item?")) {
        await deleteDoc(doc(db, collectionName, docId));
        alert("Data deleted successfully!");
        fetchData(collectionName, `${collectionName}-list`);
    }
}

// Event listeners for forms
document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners for forms

    document.getElementById("addForm-tourist-spots").addEventListener("submit", function (e) {
        e.preventDefault();
        addData("tourist-spots", "addForm-tourist-spots");
    });

    document.getElementById("addForm-reviews").addEventListener("submit", function (e) {
        e.preventDefault();
        addData("reviews", "addForm-reviews");
    });

    document.getElementById("addForm-analytics").addEventListener("submit", function (e) {
        e.preventDefault();
        addData("analytics", "addForm-analytics");
    });

    // Fetch initial data
    fetchData("tourist-spots", "tourist-spots-list");
    fetchData("reviews", "reviews-list");
    fetchData("analytics", "analytics-list");
});

// Expose functions to the global scope
window.fetchData = fetchData;
window.addData = addData;
window.editTouristSpot = editTouristSpot;
window.editReview = editReview;
window.editAnalytics = editAnalytics;
window.deleteData = deleteData;