// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCUHT-2Cbo9XZL_MNnEJ8tvaGW6voToeqI",
  authDomain: "introopresenty-bfa37.firebaseapp.com",
  databaseURL: "https://introopresenty-bfa37-default-rtdb.firebaseio.com",
  projectId: "introopresenty-bfa37",
  storageBucket: "introopresenty-bfa37.firebasestorage.app",
  messagingSenderId: "128448141846",
  appId: "1:128448141846:web:507cf9b159d9ff476b7337"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// DOM Elements
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const greeting = document.getElementById("greeting");
const logoutBtn = document.getElementById("logoutBtn");
const darkModeBtn = document.getElementById("darkModeBtn");

// Dynamic greeting
function setGreeting() {
  const hour = new Date().getHours();
  let greetText = "Welcome Back!";
  if (hour < 12) greetText = "Good Morning ☀️";
  else if (hour < 18) greetText = "Good Afternoon 🌤️";
  else greetText = "Good Evening 🌙";
  greeting.textContent = greetText;
}
setGreeting();

// Auth listener
auth.onAuthStateChanged((user) => {
  if (user) {
    userName.textContent = user.displayName || "Introo User";
    userEmail.textContent = user.email;
  } else {
    window.location.href = "index.html";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// Dark mode toggle
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  darkModeBtn.textContent = 
    document.body.classList.contains("light-mode") ? "☀️" : "🌙";
});

// 🔹 Redirect Buttons
document.querySelectorAll(".action-card button").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const section = e.target.closest(".action-card").id;
    switch (section) {
      case "attendance-section":
        window.location.href = "attendance.html";
        break;
      case "projects-section":
        window.location.href = "projects.html";
        break;
      case "chat-section":
        window.location.href = "chat.html";
        break;
      case "profile-section":
        window.location.href = "profile.html";
        break;
      default:
        alert("Section under development!");
    }
  });
});
