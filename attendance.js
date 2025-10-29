// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCUHT-2Cbo9XZL_MNnEJ8tvaGW6voToeqI",
  authDomain: "introopresenty-bfa37.firebaseapp.com",
  databaseURL: "https://introopresenty-bfa37-default-rtdb.firebaseio.com",
  projectId: "introopresenty-bfa37",
  storageBucket: "introopresenty-bfa37.firebasestorage.app",
  messagingSenderId: "128448141846",
  appId: "1:128448141846:web:507cf9b159d9ff476b7337"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// DOM
const markBtn = document.getElementById("markBtn");
const statusMsg = document.getElementById("statusMsg");
const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const attendanceList = document.getElementById("attendanceList");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");

backBtn?.addEventListener("click", () => window.location.href = "home.html");
logoutBtn?.addEventListener("click", async () => { await auth.signOut(); window.location.href = "index.html"; });

let currentDate = new Date();
let userUID = null;

// Helper formatters
function isoDate(d) {
  // returns YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function displayTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(); // includes date + time in user's locale
}

// realtime listener to update UI instantly when DB changes
function attachRealtimeListeners(uid) {
  // listen to all attendance of this user
  const userRef = db.ref(`attendance/${uid}`);
  userRef.on("value", snapshot => {
    const all = snapshot.val() || {};
    // update history list sorted by newest
    const entries = Object.keys(all).map(k => ({ date: k, ...all[k] }))
      .sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
    renderHistory(entries);
    // re-render calendar so marked days show instantly
    renderCalendarFromData(all);
  });
}

// mark attendance - one click
markBtn.addEventListener("click", async () => {
  if (!userUID) return;
  const today = isoDate(new Date());
  const nowTs = Date.now();

  const ref = db.ref(`attendance/${userUID}/${today}`);
  const snap = await ref.once("value");
  if (snap.exists()) {
    // already marked: update UI message and flash the today's cell
    statusMsg.textContent = `✅ You already marked today at ${displayTime(snap.val().timestamp)}.`;
    highlightToday(true);
    setTimeout(() => statusMsg.textContent = "", 4000);
    return;
  }

  // write atomically with server timestamp
  await ref.set({
    date: today,
    timestamp: nowTs,
    markedBy: userUID
  });

  // immediate feedback
  statusMsg.textContent = `🎉 Marked present at ${displayTime(nowTs)}!`;
  highlightToday(true);
  setTimeout(() => statusMsg.textContent = "", 5000);
});

// authorize & initialize UI
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userUID = user.uid;
  attachRealtimeListeners(userUID);
  renderCalendar(); // initial render (will be filled by realtime listener)
});

// Calendar rendering helpers

// We'll keep the last-fetched data here for fast rendering
let lastAttendanceData = {}; // { "YYYY-MM-DD": {timestamp,...}, ... }

function renderCalendarFromData(data) {
  lastAttendanceData = data || {};
  // re-render current month with knowledge of present days
  renderCalendar();
}

function renderCalendar() {
  if (!userUID) return;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthYear.textContent = `${currentDate.toLocaleString('default',{month:'long'})} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayIso = isoDate(new Date());

  calendarDays.innerHTML = "";

  // empty cells for alignment
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.classList.add('day', 'empty');
    calendarDays.appendChild(empty);
  }

  // fill days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dateIso = isoDate(dateObj);
    const cell = document.createElement('div');
    cell.classList.add('day');
    const num = document.createElement('div'); num.classList.add('date-num'); num.textContent = d;
    cell.appendChild(num);

    // if attendance exists for that date, show present + time
    if (lastAttendanceData && lastAttendanceData[dateIso]) {
      const rec = lastAttendanceData[dateIso];
      cell.classList.add('present');
      const t = document.createElement('div'); t.classList.add('time'); t.textContent = displayTime(rec.timestamp);
      cell.appendChild(t);
    } else {
      // show placeholder small text for not marked
      const t = document.createElement('div'); t.classList.add('time'); t.textContent = '';
      cell.appendChild(t);
    }

    // highlight today if it is current calendar month
    if (dateIso === isoDate(new Date())) {
      cell.classList.add(lastAttendanceData[dateIso] ? 'today-marked' : 'today');
    }

    // clicking a date shows details (or allow marking a past date if admin later)
    cell.addEventListener('click', () => {
      if (lastAttendanceData[dateIso]) {
        // show a quick modal-like alert with time (simple)
        alert(`Marked present on ${dateIso}\nTime: ${displayTime(lastAttendanceData[dateIso].timestamp)}`);
      } else if (dateIso === isoDate(new Date())) {
        // if it is today and not marked, prompt to mark
        const ok = confirm('Mark attendance for TODAY?');
        if (ok) markBtn.click();
      } else {
        alert(`No record for ${dateIso}`);
      }
    });

    calendarDays.appendChild(cell);
  }
}

// visually highlight today cell with animation when mark occurs
function highlightToday(marked) {
  // after renderCalendar runs, the 'today' cell has class today or today-marked
  // we add a quick pulse
  const todayCells = Array.from(calendarDays.querySelectorAll('.day'))
    .filter(c => c.classList.contains('today') || c.classList.contains('today-marked') || c.classList.contains('present'));
  if (!todayCells.length) return;
  const el = todayCells.find(c => c.querySelector('.date-num')?.textContent == new Date().getDate());
  if (!el) return;
  el.animate([
    { transform: 'scale(1)', boxShadow: '0 0 10px rgba(0,0,0,0)' },
    { transform: 'scale(1.03)', boxShadow: '0 10px 30px rgba(0,255,157,0.14)' },
    { transform: 'scale(1)', boxShadow: '0 0 10px rgba(0,0,0,0)' }
  ], { duration: 800 });
}

// render the recent history list (most recent first)
function renderHistory(entries) {
  attendanceList.innerHTML = '';
  if (!entries.length) {
    attendanceList.innerHTML = '<li>No attendance yet</li>';
    return;
  }
  for (const e of entries) {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${e.date}</strong>`;
    const right = document.createElement('div');
    right.classList.add('time');
    right.textContent = e.timestamp ? displayTime(e.timestamp) : '—';
    li.appendChild(left);
    li.appendChild(right);
    attendanceList.appendChild(li);
  }
}

// month navigation
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});
