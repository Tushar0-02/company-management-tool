import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUHT-2Cbo9XZL_MNnEJ8tvaGW6voToeqI",
  authDomain: "introopresenty-bfa37.firebaseapp.com",
  databaseURL: "https://introopresenty-bfa37-default-rtdb.firebaseio.com",
  projectId: "introopresenty-bfa37",
  storageBucket: "introopresenty-bfa37.firebasestorage.app",
  messagingSenderId: "128448141846",
  appId: "1:128448141846:web:507cf9b159d9ff476b7337"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const projectList = document.getElementById("projectList");

async function loadProjects() {
  const querySnapshot = await getDocs(collection(db, "projects"));
  projectList.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const p = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("project-card");
    div.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p><small>Status: ${p.status}</small>`;
    projectList.appendChild(div);
  });
}
loadProjects();
