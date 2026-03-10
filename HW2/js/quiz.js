// ======================================================
// HW2 - US Geography Quiz (quiz.js)
//
// What this file does (in plain English):
// 1) Grades the quiz (10 questions, 10 points each)
// 2) Shows feedback per question (text + correct/incorrect image)
// 3) Randomizes choices for at least one question (Q4)
// 4) Tracks how many times the quiz was taken (localStorage)
// 5) Shows a congrats message if score is above 80
// 6) Small UI polish: progress bar, colored borders, scroll to score
// ======================================================


// ------------------------------
// Image paths for right/wrong
// ------------------------------
const IMG_CORRECT = "../img/correct.png";
const IMG_WRONG = "../img/wrong.png";

// ------------------------------
// Scoring
// ------------------------------
const POINTS_PER_QUESTION = 10;


// ======================================================
// FEEDBACK (per question)
//
// This updates:
// - the feedback text (correct/incorrect message)
// - the feedback image (check or X)
// - small UI polish: green/red border around the question card
// ======================================================
function setFeedback(qNum, isCorrect, message) {
  const fb = document.getElementById(`q${qNum}fb`);
  const img = document.getElementById(`q${qNum}img`);

  // Put the message under the question
  fb.textContent = message;

  if (isCorrect) {
    fb.className = "small text-success";
    img.src = IMG_CORRECT;
    img.alt = "Correct";
  } else {
    fb.className = "small text-danger";
    img.src = IMG_WRONG;
    img.alt = "Incorrect";
  }

  // Make the image visible (Bootstrap d-none hides it)
  img.classList.remove("d-none");

  // ✅ UI polish: add a green/red border on the question card
  // closest(".card") walks upward to find the parent card for that feedback area
  const card = fb.closest(".card");
  if (card) {
    card.classList.remove("border", "border-success", "border-danger");
    card.classList.add("border");
    card.classList.add(isCorrect ? "border-success" : "border-danger");
  }
}


// ======================================================
// Tiny helper: normalize text
// This makes text answers case-insensitive (Austin vs austin)
// ======================================================
function normalizeText(s) {
  return String(s ?? "").trim().toLowerCase();
}


// ======================================================
// Get the selected radio option (or "" if nothing selected)
// ======================================================
function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}


// ======================================================
// Get all checked checkbox values as a sorted array
// Sorting makes comparison reliable
// ======================================================
function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(cb => cb.value)
    .sort();
}


// ======================================================
// Compare arrays exactly (for checkbox questions)
// ======================================================
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


// ======================================================
// RANDOMIZE Q4 (rubric requirement)
//
// This shuffles the choices each time the page loads
// and rebuilds the radio buttons dynamically.
// ======================================================
function buildQ4RandomChoices() {
  const choices = ["Alaska", "Texas", "California"];

  // Fisher-Yates shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  const container = document.getElementById("q4choices");
  container.innerHTML = "";

  choices.forEach((label, idx) => {
    const id = `q4_${idx}`;

    const wrap = document.createElement("div");
    wrap.className = "form-check";

    const input = document.createElement("input");
    input.className = "form-check-input";
    input.type = "radio";
    input.name = "q4";
    input.id = id;
    input.value = label;

    // Label tag = accessibility + click text to select
    const lab = document.createElement("label");
    lab.className = "form-check-label";
    lab.setAttribute("for", id);
    lab.textContent = label;

    wrap.appendChild(input);
    wrap.appendChild(lab);
    container.appendChild(wrap);
  });
}


// ======================================================
// WEB STORAGE (localStorage) for attempts
//
// localStorage keeps data even after you refresh the page.
// That’s why it’s perfect for “times taken”.
// ======================================================
function loadAttempts() {
  const raw = localStorage.getItem("hw2_attempts");
  const num = raw ? Number(raw) : 0;
  return Number.isFinite(num) ? num : 0;
}

function saveAttempts(n) {
  localStorage.setItem("hw2_attempts", String(n));
}

function updateAttemptsUI() {
  document.getElementById("attemptsCount").textContent = String(loadAttempts());
}


// ======================================================
// ✅ UI polish: progress bar
// This counts how many questions are filled in and sets %
// ======================================================
function updateProgressBar() {
  let answered = 0;

  // Q1–Q5 radio: answered if a radio value exists
  for (let i = 1; i <= 5; i++) {
    if (getRadioValue(`q${i}`) !== "") answered++;
  }

  // Q6 checkbox: answered if at least one checked
  if (getCheckedValues("q6").length > 0) answered++;

  // Q7 dropdown: answered if not empty
  if (document.getElementById("q7").value !== "") answered++;

  // Q8 text: answered if not blank
  if (normalizeText(document.getElementById("q8").value) !== "") answered++;

  // Q9 number: answered if not blank
  if (document.getElementById("q9").value !== "") answered++;

  // Q10 slider always has a value, so we count it
  answered++;

  const percent = Math.round((answered / 10) * 100);
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = percent + "%";
}


// ======================================================
// MAIN GRADING FUNCTION
// Checks each question, adds points, shows feedback.
// ======================================================
function gradeQuiz() {
  let score = 0;

  // Q1 correct: Sacramento
  {
    const ans = getRadioValue("q1");
    const ok = ans === "Sacramento";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(1, ok, ok ? "Correct!" : "Incorrect. Correct answer: Sacramento.");
  }

  // Q2 correct: Florida
  {
    const ans = getRadioValue("q2");
    const ok = ans === "Florida";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(2, ok, ok ? "Correct!" : "Incorrect. Correct answer: Florida.");
  }

  // Q3 correct: California
  {
    const ans = getRadioValue("q3");
    const ok = ans === "California";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(3, ok, ok ? "Correct!" : "Incorrect. Correct answer: California.");
  }

  // Q4 correct: Alaska (randomized options)
  {
    const ans = getRadioValue("q4");
    const ok = ans === "Alaska";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(4, ok, ok ? "Correct!" : "Incorrect. Correct answer: Alaska.");
  }

  // Q5 correct: Arizona
  {
    const ans = getRadioValue("q5");
    const ok = ans === "Arizona";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(5, ok, ok ? "Correct!" : "Incorrect. Correct answer: Arizona.");
  }

  // Q6 checkboxes correct: California, Oregon, Washington
  {
    const ans = getCheckedValues("q6");
    const correct = ["California", "Oregon", "Washington"].sort();
    const ok = arraysEqual(ans, correct);
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(6, ok, ok ? "Correct!" : "Incorrect. Correct answers: California, Oregon, Washington.");
  }

  // Q7 dropdown correct: Louisiana
  {
    const ans = document.getElementById("q7").value;
    const ok = ans === "Louisiana";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(7, ok, ok ? "Correct!" : "Incorrect. Correct answer: Louisiana.");
  }

  // Q8 text correct: Austin (case-insensitive)
  {
    const ans = normalizeText(document.getElementById("q8").value);
    const ok = ans === "austin";
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(8, ok, ok ? "Correct!" : "Incorrect. Correct answer: Austin.");
  }

  // Q9 number correct: 50
  {
    const raw = document.getElementById("q9").value;
    const ans = Number(raw);
    const ok = ans === 50;
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(9, ok, ok ? "Correct!" : "Incorrect. Correct answer: 50.");
  }

  // Q10 range slider:
  // For rubric, we still treat it as correct/incorrect with an image.
  // "Correct" if confidence is 7 or higher (just a fun rule).
  {
    const ans = Number(document.getElementById("q10").value);
    const ok = ans >= 7;
    if (ok) score += POINTS_PER_QUESTION;
    setFeedback(10, ok, ok ? "Nice confidence!" : "All good — keep practicing.");
  }

  // Update total score on page
  document.getElementById("totalScore").textContent = String(score);

  // Show congrats message if score > 80
  const congrats = document.getElementById("congrats");
  if (score > 80) congrats.classList.remove("d-none");
  else congrats.classList.add("d-none");
}


// ======================================================
// RESET QUIZ
// Clears answers and clears all feedback/images/borders.
// ======================================================
function resetQuiz() {
  document.getElementById("quizForm").reset();

  // Clear feedback and hide images
  for (let i = 1; i <= 10; i++) {
    const fb = document.getElementById(`q${i}fb`);
    const img = document.getElementById(`q${i}img`);

    fb.textContent = "";
    fb.className = "small";

    img.src = "";
    img.alt = "";
    img.classList.add("d-none");

    // Remove border colors on reset
    const card = fb.closest(".card");
    if (card) card.classList.remove("border", "border-success", "border-danger");
  }

  // Reset total score + congrats
  document.getElementById("totalScore").textContent = "0";
  document.getElementById("congrats").classList.add("d-none");

  // Reset slider label to match default slider value
  const q10 = document.getElementById("q10");
  document.getElementById("q10val").textContent = String(q10.value);

  // Reset progress bar
  updateProgressBar();
}


// ======================================================
// PAGE LOAD + EVENT LISTENERS
// This runs once the page is ready.
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  // Build randomized answers for Q4 each page load
  buildQ4RandomChoices();

  // Load attempts from storage and display it
  updateAttemptsUI();

  // Set up the progress bar from whatever is currently filled in
  updateProgressBar();

  // Anytime the user changes anything in the form, update progress bar
  document.getElementById("quizForm").addEventListener("input", updateProgressBar);

  // Slider value label updates live
  const q10 = document.getElementById("q10");
  q10.addEventListener("input", () => {
    document.getElementById("q10val").textContent = String(q10.value);
  });

  // When user submits the quiz
  document.getElementById("quizForm").addEventListener("submit", (e) => {
    e.preventDefault(); // prevents page refresh

    // Track attempts (rubric requirement)
    const attempts = loadAttempts() + 1;
    saveAttempts(attempts);
    updateAttemptsUI();

    // Grade quiz
    gradeQuiz();

    // ✅ UI polish: scroll user down to the score area
    document.getElementById("totalScore").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  // Reset answers button
  document.getElementById("resetBtn").addEventListener("click", () => {
    resetQuiz();

    // Optional: re-randomize Q4 after reset
    buildQ4RandomChoices();
  });

  // Reset attempt counter button
  document.getElementById("resetAttemptsBtn").addEventListener("click", () => {
    saveAttempts(0);
    updateAttemptsUI();
  });
});