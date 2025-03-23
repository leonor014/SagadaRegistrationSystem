import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseApp } from "./firebase-config.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const adminToggleBtn = document.getElementById("toggle-admin");
const adminElements = document.querySelectorAll(".admin-only");

async function checkAdminStatus(user) {
    if (!user) {
        setAdminMode(false);
        return;
    }
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().isAdmin) {
        setAdminMode(true);
    } else {
        setAdminMode(false);
    }
}

function setAdminMode(isAdmin) {
    adminElements.forEach(el => {
        el.style.display = isAdmin ? "block" : "none";
    });
    adminToggleBtn.textContent = isAdmin ? "Disable Admin Mode" : "Enable Admin Mode";
}

adminToggleBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            await setDoc(userRef, { isAdmin: !userSnap.data().isAdmin }, { merge: true });
            setAdminMode(!userSnap.data().isAdmin);
        }
    }
});

onAuthStateChanged(auth, checkAdminStatus);
