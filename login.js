// app.js
// Firebase config provided by you
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

// UI elements
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginMessage = document.getElementById('login-message');
const signupMessage = document.getElementById('signup-message');
const forgotBtn = document.getElementById('forgot-password');

const profileCard = document.getElementById('profile-card');
const authCard = document.getElementById('auth-card');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

// Tab toggles
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
  clearMessages();
});
tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
  clearMessages();
});

function clearMessages(){
  loginMessage.textContent = '';
  signupMessage.textContent = '';
}

// SIGN UP
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupMessage.textContent = '';
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!name) return signupMessage.textContent = 'Please enter your full name.';
  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCred.user;
    await user.updateProfile({ displayName: name });
    await db.ref('users/' + user.uid).set({
      name,
      email,
      createdAt: Date.now()
    });
    signupMessage.style.color = 'lightgreen';
    signupMessage.textContent = 'Account created successfully!';
    signupForm.reset();

    // ✅ Redirect to home.html after signup
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  } catch (err) {
    signupMessage.style.color = '#ff9b9b';
    signupMessage.textContent = err.message;
  }
});

// LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginMessage.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginMessage.style.color = 'lightgreen';
    loginMessage.textContent = 'Logged in successfully!';
    loginForm.reset();

    // ✅ Redirect to home.html after login
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  } catch (err) {
    loginMessage.style.color = '#ff9b9b';
    loginMessage.textContent = err.message;
  }
});

// FORGOT PASSWORD
forgotBtn.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    loginMessage.style.color = '#ff9b9b';
    loginMessage.textContent = 'Enter your email to reset password.';
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    loginMessage.style.color = 'lightgreen';
    loginMessage.textContent = 'Password reset email sent!';
  } catch (err) {
    loginMessage.style.color = '#ff9b9b';
    loginMessage.textContent = err.message;
  }
});

// AUTH STATE CHANGE (optional redirect safety)
auth.onAuthStateChanged(user => {
  if (user) {
    // if already logged in, go to home directly
    if (!window.location.href.includes("home.html")) {
      window.location.href = "home.html";
    }
  }
});

// LOGOUT
logoutBtn.addEventListener('click', async () => {
  try {
    await auth.signOut();
    window.location.href = "index.html"; // redirect to login page after logout
  } catch (err) {
    console.error('Sign out error', err);
  }
});
