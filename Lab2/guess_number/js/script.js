/******************************************************
 * Lab 2: Guess the Number (1–99, 7 attempts)
 ******************************************************/

/***********************
 * EVENT LISTENERS
 ***********************/
document.querySelector("#guessBtn").addEventListener("click", checkGuess);
document.querySelector("#resetBtn").addEventListener("click", initializeGame);

/***********************
 * GLOBAL VARIABLES
 ***********************/
let randomNumber;      // the secret number (1–99)
let attempts = 0;      // how many valid guesses used
let wins = 0;          // total wins (should NOT reset)
let losses = 0;        // total losses (should NOT reset)

initializeGame();

/******************************************************
 * updateScoreboard()
 * - updates Attempts Left, Wins, Losses on the page
 ******************************************************/
function updateScoreboard() {
  // attempts left = 7 total attempts - attempts already used
  let attemptsLeft = 7 - attempts;

  document.querySelector("#attemptsLeft").textContent =
    "Attempts left: " + attemptsLeft;

  document.querySelector("#wins").textContent = wins;
  document.querySelector("#losses").textContent = losses;
}

/******************************************************
 * initializeGame()
 * - starts/restarts the game without refreshing the page
 ******************************************************/
function initializeGame() {

  // generate new secret number
  randomNumber = Math.floor(Math.random() * 99) + 1;
  console.log("Random number: " + randomNumber);

  // reset attempts for this round
  attempts = 0;

  // hide Reset, show Guess
  document.querySelector("#resetBtn").style.display = "none";
  document.querySelector("#guessBtn").style.display = "inline";

  // clear textbox + focus it
  let playerGuess = document.querySelector("#playerGuess");
  playerGuess.value = "";
  playerGuess.focus();

  // clear feedback + previous guesses
  document.querySelector("#feedback").textContent = "";
  document.querySelector("#guesses").textContent = "";

  // update attempts left + wins/losses display
  updateScoreboard();
}

/******************************************************
 * checkGuess()
 * - validates guess (1–99)
 * - increases attempts
 * - checks win / lose / high / low
 * - displays previous guesses
 ******************************************************/
function checkGuess() {

  let feedback = document.querySelector("#feedback");
  feedback.textContent = "";

  // convert textbox value to number
  let guess = Number(document.querySelector("#playerGuess").value);
  console.log("Player guess: " + guess);

  /***********************
   * 1) RANGE VALIDATION
   ***********************/
  if (guess < 1 || guess > 99) {
    feedback.textContent = "Enter a number between 1 and 99";
    feedback.style.color = "red";
    return;
  }

  /***********************
   * 2) MAIN GAME LOGIC
   ***********************/
  attempts++;
  updateScoreboard(); // refresh attempts left display

  feedback.style.color = "orange";

  // WIN
  if (guess === randomNumber) {
    wins++; // increase total wins
    updateScoreboard();

    feedback.textContent = "You guessed it! You Won!";
    feedback.style.color = "darkgreen";

    gameOver();
    return;
  }

  // show previous guesses
  document.querySelector("#guesses").textContent += guess + " ";

  // LOSE
  if (attempts === 7) {
    losses++; // increase total losses
    updateScoreboard();

    feedback.textContent = "Sorry, you lost!";
    feedback.style.color = "red";

    gameOver();
    return;
  }

  // HIGH / LOW hint
  if (guess > randomNumber) {
    feedback.textContent = "Guess was high";
  } else {
    feedback.textContent = "Guess was low";
  }
}

/******************************************************
 * gameOver()
 * - hides Guess button
 * - shows Reset button
 ******************************************************/
function gameOver() {
  document.querySelector("#guessBtn").style.display = "none";
  document.querySelector("#resetBtn").style.display = "inline";
}