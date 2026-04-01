// =====================
// STATE
// =====================
let queue = JSON.parse(localStorage.getItem("queue")) || [];
let current = JSON.parse(localStorage.getItem("current")) || null;

let regularCounter = JSON.parse(localStorage.getItem("regularCounter")) || 1;
let priorityCounter = JSON.parse(localStorage.getItem("priorityCounter")) || 1;


// =====================
// ADD QUEUE
// =====================
function addQueue(type) {
  let number = type === "regular" ? regularCounter++ : priorityCounter++;

  let newItem = { number, type };
  queue.push(newItem);

  save();
  renderAll();

  // 🔥 CHECK TOGGLE
  let shouldPrint = document.getElementById("printToggle").checked;

  if (shouldPrint) {
    printTicket(newItem);
  }

  localStorage.setItem("regularCounter", JSON.stringify(regularCounter));
  localStorage.setItem("priorityCounter", JSON.stringify(priorityCounter));
}

// =====================
// PRINT
// =====================
function printTicket(data) {
  const printWindow = window.open('', '', 'width=300,height=400');

  printWindow.document.write(`
    <html>
      <body style="text-align:center;font-family:Arial;">
        <h3>Planet Drugstore</h3>
        <h5>- - OSMAK - -</h5>
        <p>${data.type.toUpperCase()} PATIENT</p>
        <h1>${data.number.toString().padStart(2, '0')}</h1>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

// =====================
// CALL / NEXT
// =====================
function callCurrent(type) {
  let item = queue.find(q => q.type === type);
  if (!item) return;

  // 🔥 TRIGGER GLOW HERE (ON CALL)
  localStorage.setItem("lastCalledType", item.type);
  localStorage.setItem("lastCalledTime", Date.now());

  speak(item);
}


function nextQueue(type) {
  // 🔥 ALWAYS GET FRESH DATA
  queue = JSON.parse(localStorage.getItem("queue")) || [];

  console.log("QUEUE:", queue);
  console.log("TYPE:", type);

  // 🔍 find first match
  let index = queue.findIndex(q => q.type === type);

  // if (index === -1) {
  //   alert("No patient in queue!");
  //   return;
  // }

  // ✅ remove correct item
  let called = queue.splice(index, 1)[0];

  console.log("REMOVED:", called);

  // 🔥 SAVE GLOW DATA
  localStorage.setItem("lastCalledType", called.type);
  localStorage.setItem("lastCalledTime", Date.now());

  // 🔥 SAVE UPDATED QUEUE
  localStorage.setItem("queue", JSON.stringify(queue));

  renderAll();
}
// =====================
// VOICE
// =====================
function speak(data) {
  const text = `${data.type} patient number ${data.number}, Please proceed to planet window.`;

  const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");

  audio.play().then(() => {
    setTimeout(() => {
      speakRepeat(text, 1);
    }, 400);
  }).catch(() => {
    speakRepeat(text, 1);
  });
}

function speakRepeat(text, times) {
  let count = 0;

  function speakOnce() {
    if (count >= times) return;

    const msg = new SpeechSynthesisUtterance(text);

    let voices = speechSynthesis.getVoices();

    msg.voice =
      voices.find(v => v.name.toLowerCase().includes("female")) ||
      voices[0];

    msg.rate = 0.85;
    msg.pitch = 1.1;

    msg.onend = () => {
      count++;
      setTimeout(speakOnce, 800);
    };

    speechSynthesis.speak(msg);
  }

  speakOnce();
}

// =====================
// STORAGE
// =====================
function save() {
  localStorage.setItem("queue", JSON.stringify(queue));
  localStorage.setItem("current", JSON.stringify(current));
}

// =====================
// ADMIN RENDER
// =====================
function renderAdmin() {
  let container = document.getElementById("adminQueue");
  if (!container) return;

  container.innerHTML = "";

  queue.forEach(q => {
    let typeClass = q.type === 'priority' ? 'priority' : '';

    container.innerHTML += `
      <div class="queue-item ${typeClass}">
        ${q.number.toString().padStart(2, '0')} - 
        ${q.type === 'priority' ? 'Priority Patient' : 'Regular Patient'}
      </div>
    `;
  });

  let regularNext = queue.find(q => q.type === 'regular');
  let priorityNext = queue.find(q => q.type === 'priority');

  document.getElementById("regularNow").innerText =
    regularNext ? regularNext.number.toString().padStart(2, "0") : "--";

  document.getElementById("priorityNow").innerText =
    priorityNext ? priorityNext.number.toString().padStart(2, "0") : "--";
}

// =====================
// DISPLAY RENDER
// =====================
function renderDisplay() {
  let regularBox = document.getElementById("regularServing");
  let priorityBox = document.getElementById("priorityServing");
  let list = document.getElementById("queueList");

  let regularNext = queue.find(q => q.type === "regular");
  let priorityNext = queue.find(q => q.type === "priority");

  if (regularBox) {
    regularBox.innerText = regularNext
      ? regularNext.number.toString().padStart(2, "0")
      : "--";
  }

  if (priorityBox) {
    priorityBox.innerText = priorityNext
      ? priorityNext.number.toString().padStart(2, "0")
      : "--";
  }

  // LIST
  if (list) {
    list.innerHTML = "";

    queue.forEach((q, index) => {
      let typeClass = q.type === "priority" ? "priority" : "";
      let activeClass = index === 0 ? "active" : "";

      list.innerHTML += `
        <div class="queue-item ${typeClass} ${activeClass}">
          ${q.number.toString().padStart(2, '0')} - 
          ${q.type === 'priority' ? 'Priority Patient' : 'Regular Patient'}
        </div>
      `;
    });
  }

  // 🔥 GLOW EFFECT
  let regularCard = document.getElementById("regularCard");
  let priorityCard = document.getElementById("priorityCard");

  let lastType = localStorage.getItem("lastCalledType");
  let lastTime = parseInt(localStorage.getItem("lastCalledTime"));

  if (regularCard && priorityCard) {
    regularCard.classList.remove("glow");
    priorityCard.classList.remove("glow");

    if (lastTime) {
      let diff = (Date.now() - lastTime) / 1000;

      if (diff <= 10) {
        if (lastType === "priority") {
          priorityCard.classList.add("glow");
        } else if (lastType === "regular") {
          regularCard.classList.add("glow");
        }
      }
    }
  }
}

// =====================
// CLOCK
// =====================
function updateClock() {
  const now = new Date();

  // TIME
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";

  let displayHour = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  // DATE
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  let dayName = days[now.getDay()];
  let month = months[now.getMonth()];
  let date = now.getDate();

  // GREETING
  let greeting = "Good Morning";

  if (hours >= 12 && hours < 18) {
    greeting = "Good Afternoon";
  } else if (hours >= 18) {
    greeting = "Good Evening";
  }

  // APPLY
  document.getElementById("time").innerText = `${displayHour}:${minutes}`;
  document.getElementById("ampm").innerText = ampm;

  let dayDateEl = document.getElementById("dayDate");
  if (dayDateEl) {
    dayDateEl.innerText = `${dayName}, ${month} ${date}`;
  }

  let greetEl = document.getElementById("greetingText");
  if (greetEl) {
    greetEl.innerText = greeting;
  }
}

setInterval(updateClock, 1000);
updateClock();

// =====================
// RESET
// =====================
function resetQueue() {
  if (!confirm("Reset all queues?")) return;

  queue = [];
  current = null;

  regularCounter = 1;
  priorityCounter = 1;

  localStorage.clear();

  renderAll();
}

// =====================
// REAL-TIME SYNC
// =====================
setInterval(() => {
  queue = JSON.parse(localStorage.getItem("queue")) || [];

  // 🔥 FORCE REFRESH OF GLOW DATA
  localStorage.getItem("lastCalledType");
  localStorage.getItem("lastCalledTime");

  renderDisplay();
}, 500);

// =====================
// INIT
// =====================
function renderAll() {
  renderAdmin();
  renderDisplay();
}

renderAll();