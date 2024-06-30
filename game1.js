const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('.start'),
    pause: document.querySelector('.pause'),
    win: document.querySelector('.win'),
    fastestTime: document.querySelector('.fastest-time'),
    leastMoves: document.querySelector('.least-moves'),
    exitButton: document.querySelector('.exit-button') // Added exit button selector
};

const state = {
    gameStarted: false,
    gamePaused: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null,
    bestTime: localStorage.getItem('bestTime') ? parseInt(localStorage.getItem('bestTime')) : null,
    bestMoves: localStorage.getItem('bestMoves') ? parseInt(localStorage.getItem('bestMoves')) : null
};

// Function to get URL parameters
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: params.get('name')
    };
}

// Function to handle exit confirmation
function confirmExit() {
    const { name } = getQueryParams();
    if (name) {
        const confirmExit = confirm(`Are you sure you want to exit?`);
        if (confirmExit) {
            const thankYouMessage = `Thank you for playing, ${name}!`;
            alert(thankYouMessage); // First popup: Thank you message
            window.location.href = 'index.html'; // Redirect after confirmation
        }
    } else {
        const confirmExit = confirm(`Are you sure you want to exit?`);
        if (confirmExit) {
            window.location.href = 'index.html'; // Redirect after confirmation
        }
    }
}


window.onload = function() {
    const { name } = getQueryParams();
    if (name) {
        const playerNameElement = document.createElement('p');
        playerNameElement.textContent = `Player : ${name}`;
        document.getElementById('player-name').appendChild(playerNameElement);
    }
};

const initializeBestStats = () => {
    if (state.bestTime !== null) {
        selectors.fastestTime.innerText = state.bestTime;
    }
    if (state.bestMoves !== null) {
        selectors.leastMoves.innerText = state.bestMoves;
    }
};

const shuffle = array => {
    const clonedArray = [...array];

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];

        clonedArray[i] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }

    return clonedArray;
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }

    return randomPicks;
};

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.");
    }

    const imageUrls = [
        'image/mal.png', 
        'image/brunei.png',
        'image/cambodia.png',
        'image/china.png',
        'image/indon.png',
        'image/japan.png',
        'image/korea.png',
        'image/laos.png',
        'image/thai.png',
        'image/singapore.png'
    ];

    const picks = pickRandom(imageUrls, (dimensions * dimensions) / 2); 
    const items = shuffle([...picks, ...picks]);
    
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back"><img src="${item}" alt="Card"></div>
                </div>
            `).join('')}
        </div>
    `;
    
    const parser = new DOMParser().parseFromString(cards, 'text/html');

    selectors.board.replaceWith(parser.querySelector('.board'));
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        if (!state.gamePaused) {
            state.totalTime++;
        }

        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    }, 1000);
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });

    state.flippedCards = 0;
};

const flipCard = card => {
    if (state.gamePaused) return;

    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');

        if (flippedCards[0].querySelector('.card-back img').src === flippedCards[1].querySelector('.card-back img').src) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }

    if (!document.querySelectorAll('.card:not(.matched)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    Congratulations!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;

            if (state.bestTime === null || state.totalTime < state.bestTime) {
                state.bestTime = state.totalTime;
                selectors.fastestTime.innerText = state.bestTime;
                localStorage.setItem('bestTime', state.bestTime);
            }

            if (state.bestMoves === null || state.totalFlips < state.bestMoves) {
                state.bestMoves = state.totalFlips;
                selectors.leastMoves.innerText = state.bestMoves;
                localStorage.setItem('bestMoves', state.bestMoves);
            }

            clearInterval(state.loop);
        }, 1000);
    }
};

const togglePause = () => {
    state.gamePaused = !state.gamePaused;

    if (state.gamePaused) {
        clearInterval(state.loop);
        selectors.pause.innerText = 'Resume';
        selectors.pause.classList.add('paused');
    } else {
        startGame();
        selectors.pause.innerText = 'Pause';
        selectors.pause.classList.remove('paused');
    }
};

const attachEventListeners = () => {
    selectors.start.addEventListener('click', () => {
        if (!state.gameStarted) {
            startGame();
        }
    });

    selectors.pause.addEventListener('click', () => {
        togglePause();
    });

    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped') && !state.gamePaused) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame();
        }
    });

    selectors.exitButton.addEventListener('click', () => {
        confirmExit();
    });
};

generateGame();
attachEventListeners();
initializeBestStats();
