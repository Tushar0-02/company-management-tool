import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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
const auth = getAuth(app);

const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const q = query(collection(db, "teamChat"), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerText = `${data.sender}: ${data.text}`;
      messagesDiv.appendChild(div);
    });
  });

  sendBtn.addEventListener("click", async () => {
    const text = msgInput.value.trim();
    if (text === "") return;
    await addDoc(collection(db, "teamChat"), {
      text: text,
      sender: user.email,
      timestamp: new Date(),
    });
    msgInput.value = "";
  });
});
