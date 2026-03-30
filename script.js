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
  printTicket(newItem);

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

  speak(item);
}

function nextQueue(type) {
  // find index of first matching type
  let index = queue.findIndex(q => q.type === type);

  if (index === -1) return;

  // remove that item
  queue.splice(index, 1);

  save();
  renderAll();
}

// =====================
// VOICE
// =====================
function speak(data) {
  const text = `Now serving number ${data.number}, ${data.type} patient`;

  // 🔔 DING SOUND
  const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");

  audio.play().then(() => {
    setTimeout(() => {
      speakRepeat(text, 2); // 🔁 repeat 2 times
    }, 400);
  }).catch(() => {
    speakRepeat(text, 2);
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

  if (list) {
    list.innerHTML = "";

    queue.slice(0, 4).forEach(q => {
      let typeClass = q.type === "priority" ? "priority" : "";

      list.innerHTML += `
        <div class="queue-item ${typeClass}">
          ${q.number.toString().padStart(2, '0')} 
          <span>${q.type === 'priority' ? 'Priority Patient' : 'Regular Patient'}</span>
        </div>
      `;
    });
  }
}

// =====================
// CLOCK
// =====================
function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  document.getElementById("time").innerText = `${hours}:${minutes}`;
  document.getElementById("ampm").innerText = ampm;
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
  current = JSON.parse(localStorage.getItem("current")) || null;

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