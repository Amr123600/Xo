let timer;
let timeLeft = 30;  // الوقت المحدد لكل دور (ثواني)

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    turnIndicator.textContent = `Turn: ${currentPlayer === "X" ? player1 : player2} - Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Time's up! Skipping turn.");
      switchPlayer(); // التبديل بين اللاعبين عند انتهاء الوقت
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timeLeft = 30; // إعادة تعيين الوقت
}

// عند بدء اللعبة
form.addEventListener("submit", (e) => {
  e.preventDefault();
  player1 = document.getElementById("player1").value;
  player2 = document.getElementById("player2").value;

  playerForm.style.display = "none";
  game.style.display = "block";

  updateTurnIndicator();
  startTimer();
});

// التبديل بين اللاعبين
function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnIndicator();
  stopTimer();
  startTimer();
}
