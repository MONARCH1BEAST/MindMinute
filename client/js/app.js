const beginBtn = document.getElementById("beginBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const endBtn = document.getElementById("endBtn");

const ring = document.getElementById("progressRing");
const timeText = document.getElementById("timeText");
const aiBox = document.getElementById("aiText");
const userInput = document.getElementById("userInput");

let time = 60;
let timer = null;

/* -------- RING SETUP -------- */
const RADIUS = 80;
const circumference = 2 * Math.PI * RADIUS;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = 0;

function setRing(t) {
  ring.style.strokeDashoffset =
    circumference - (t / 60) * circumference;
}

/* -------- AI CALL -------- */
beginBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();

  if (!text) {
    alert("Please type something first.");
    return;
  }

  aiBox.textContent = "Listening to you…";
  aiBox.classList.add("breathing");

  try {
    const res = await fetch("http://localhost:5000/api/generate-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    aiBox.textContent = data.reset;
  } catch (err) {
    aiBox.textContent =
      "The system paused for a moment. Please breathe and try again.";
    console.error(err);
  }

  aiBox.classList.remove("breathing");
});

/* -------- TIMER -------- */
startBtn.addEventListener("click", () => {
  if (timer) return;

  startBtn.classList.add("hide");
  pauseBtn.classList.remove("hide");
  endBtn.classList.remove("hide");

  timer = setInterval(() => {
    time--;
    timeText.textContent = time + "s";
    setRing(time);

    if (time <= 0) stopTimer();
  }, 1000);
});

pauseBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;

  startBtn.classList.remove("hide");
  pauseBtn.classList.add("hide");
});

endBtn.addEventListener("click", stopTimer);

function stopTimer() {
  clearInterval(timer);
  timer = null;

  time = 60;
  setRing(60);
  timeText.textContent = "60s";

  startBtn.classList.remove("hide");
  pauseBtn.classList.add("hide");
  endBtn.classList.add("hide");
}
