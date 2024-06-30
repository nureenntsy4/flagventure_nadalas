// Initial References (Assuming they are defined elsewhere)
let draggableObjects;
let dropPoints;
const startButton = document.getElementById("start");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const dragContainer = document.querySelector(".draggable-objects");
const dropContainer = document.querySelector(".drop-points");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");

const data = [
  "malaysia", "indonesia", "thailand", "vietnam", "laos", "china", "japan",
  "korea", "bangladesh", "pakistan", "india", "myanmar", "singapore", "brunei",
  "cambodia", "philipines", "iraq", "saudi-arabia", "syria", "yemen"
];

let deviceType = "";
let initialX = 0,
  initialY = 0;
let currentElement = "";
let moveElement = false;

let count = 0;
let score = 0;
let time = 120; // Total time for the entire game (200 seconds)
let timer;
let round = 1; // Track the current round
let gamePaused = false; // Flag to track game paused state

// Detect touch device
const isTouchDevice = () => {
  try {
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

// Random value from Array
const randomValueGenerator = () => {
  return data[Math.floor(Math.random() * data.length)];
};

// End Game Display
const stopGame = () => {
  clearInterval(timer);
  controls.classList.remove("hide");
  startButton.classList.remove("hide");
  scoreDisplay.textContent = `Score: ${score}`;
  result.innerHTML = `Game Over! Your final score is ${score}.<br>Click "Start Game" to play again.`;
  result.classList.remove("hide"); // Ensure the result element is visible
  result.style.color = "black"; // Set text color to black
  result.style.fontWeight = "bold"; // Set text to bold
};

// Timer Function
const startTimer = () => {
  clearInterval(timer); // Clear any existing timer
  timer = setInterval(() => {
    if (!gamePaused) {
      time--;
      timerDisplay.textContent = `Time: ${time}`;

      if (time <= 0) {
        clearInterval(timer);
        result.textContent = `Game Over! Your final score is ${score}`;
        stopGame();
      } else if (time % 5 === 0) {
        timerDisplay.classList.add("red-flash");
        setTimeout(() => {
          timerDisplay.classList.remove("red-flash");
        }, 400);
      }
    }
  }, 1000);
};

// Drag & Drop Functions
function dragStart(e) {
  if (isTouchDevice()) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
    moveElement = true;
    currentElement = e.target;
  } else {
    e.dataTransfer.setData("text", e.target.id);
  }
}

// Events fired on the drop target
function dragOver(e) {
  e.preventDefault();
}

// For touchscreen movement
const touchMove = (e) => {
  if (moveElement) {
    e.preventDefault();
    let newX = e.touches[0].clientX;
    let newY = e.touches[0].clientY;
    let currentSelectedElement = document.getElementById(e.target.id);
    currentSelectedElement.parentElement.style.top =
      currentSelectedElement.parentElement.offsetTop - (initialY - newY) + "px";
    currentSelectedElement.parentElement.style.left =
      currentSelectedElement.parentElement.offsetLeft - (initialX - newX) + "px";
    initialX = newX;
    initialY = newY;
  }
};

const drop = (e) => {
  e.preventDefault();
  let correctDrop = false;

  if (isTouchDevice()) {
    moveElement = false;
    const currentDrop = document.querySelector(`div[data-id='${e.target.id}']`);
    const currentDropBound = currentDrop.getBoundingClientRect();

    if (
      initialX >= currentDropBound.left &&
      initialX <= currentDropBound.right &&
      initialY >= currentDropBound.top &&
      initialY <= currentDropBound.bottom
    ) {
      correctDrop = true;
      currentDrop.classList.add("dropped");
      currentElement.classList.add("hide");
      currentDrop.innerHTML = `<img src="images/${currentElement.id}.png">`;
    } else {
      e.target.classList.add("wrong-drop");
      setTimeout(() => {
        e.target.classList.remove("wrong-drop");
      }, 500);
      penalizeTime(); // Penalize time on wrong drop
    }
  } else {
    const draggedElementData = e.dataTransfer.getData("text");
    const droppableElementData = e.target.getAttribute("data-id");

    if (draggedElementData === droppableElementData) {
      correctDrop = true;
      e.target.classList.add("dropped");
      document.getElementById(draggedElementData).classList.add("hide");
      document.getElementById(draggedElementData).setAttribute("draggable", "false");
      e.target.innerHTML = `<img src="images/${draggedElementData}.png">`;
      score += 10; // Increase score on correct drop
      scoreDisplay.textContent = `Score: ${score}`;
    } else {
      e.target.classList.add("wrong-drop");
      setTimeout(() => {
        e.target.classList.remove("wrong-drop");
      }, 500);
      penalizeTime(); // Penalize time on wrong drop
    }
  }

  if (correctDrop) {
    count += 1;
  }

  // Check if all drops are correct
  if (count === 3) {
    if (round === 7 || time <= 0) { // Adjusted to end game on round 7 or time out
      result.innerText = `Game Over! Your final score is ${score}`;
      stopGame();
    } else {
      round++;
      result.innerText = `Round ${round} completed! Your score is ${score}`;
      setTimeout(() => {
        result.innerText = '';
        startRound();
      }, 2000);
    }
  }
};

// Penalize time function
const penalizeTime = () => {
  time -= 5; // Penalize 5 seconds for each wrong drop
  if (time < 0) time = 0; // Ensure time doesn't go negative
  timerDisplay.textContent = `Time: ${time}`;
};

// Creates flags and countries
const creator = () => {
  dragContainer.innerHTML = "";
  dropContainer.innerHTML = "";
  let randomData = [];

  for (let i = 1; i <= 3; i++) {
    let randomValue = randomValueGenerator();
    if (!randomData.includes(randomValue)) {
      randomData.push(randomValue);
    } else {
      i -= 1;
    }
  }

  for (let i of randomData) {
    const flagDiv = document.createElement("div");
    flagDiv.classList.add("draggable-image");
    flagDiv.setAttribute("draggable", true);
    if (isTouchDevice()) {
      flagDiv.style.position = "absolute";
    }
    flagDiv.innerHTML = `<img src="images/${i}.png" id="${i}">`;
    dragContainer.appendChild(flagDiv);
  }

  randomData = randomData.sort(() => 0.5 - Math.random());
  for (let i of randomData) {
    const countryDiv = document.createElement("div");
    countryDiv.innerHTML = `<div class='countries' data-id='${i}'>
      ${i.charAt(0).toUpperCase() + i.slice(1).replace("-", " ")}
    </div>`;
    dropContainer.appendChild(countryDiv);
  }
};

// Start a new round
const startRound = () => {
  currentElement = "";
  controls.classList.add("hide");
  startButton.classList.add("hide");
  creator();
  count = 0;
  dropPoints = document.querySelectorAll(".countries");
  draggableObjects = document.querySelectorAll(".draggable-image");

  draggableObjects.forEach((element) => {
    element.addEventListener("dragstart", dragStart);
    element.addEventListener("touchstart", dragStart);
    element.addEventListener("touchend", drop);
    element.addEventListener("touchmove", touchMove);
  });
  dropPoints.forEach((element) => {
    element.addEventListener("dragover", dragOver);
    element.addEventListener("drop", drop);
  });

  result.textContent = '';
  timerDisplay.textContent = `Time: ${time}`;
  startTimer();
};

// Start Game
startButton.addEventListener("click", () => {
  round = 1; // Reset round count
  time = 120; // Reset time
  score = 0; // Reset score
  scoreDisplay.textContent = `Score: ${score}`;
  gamePaused = false; // Ensure game is not paused on start
  startRound();
});

// Pause Game
const pauseGame = () => {
  gamePaused = true;
  clearInterval(timer);
};

// Resume Game
const resumeGame = () => {
  if (gamePaused) {
    gamePaused = false;
    startTimer();
  }
};

// Event listeners for pause, resume, and exit buttons
document.getElementById("pause-resume").addEventListener("click", () => {
  if (gamePaused) {
    resumeGame();
    document.getElementById("pause-resume").textContent = "Pause";
  } else {
    pauseGame();
    document.getElementById("pause-resume").textContent = "Resume";
  }
});

document.getElementById("exit").addEventListener("click", () => {
  window.location.href = "index.html"; // Replace with your home page URL
});
