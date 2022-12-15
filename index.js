// Global Variables
var words
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var winningGameOverBox = document.querySelector('#winning-game-over-section');
var losingGameOverBox = document.querySelector('#losing-game-over-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');
var gamesPlural = document.querySelector('#games-plural')

// Event Listeners
window.addEventListener('load', function () {
  fetchWords()
});

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function () { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function () { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  currentRow = 1;
  winningWord = getRandomWord(words);
  updateInputPermissions();
}

function fetchWords() {
  fetch('http://localhost:3001/api/v1/words')
    .then(respones => respones.json())
    .then(data => {
      words = data
      setGame()
      return words
    })
}
function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  inputs.forEach(input => {
    if (!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false;
    }
  })
  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if (key !== 8 && key !== 46) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner(winningGameOverBox), 1000);
    }
    else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
  checkGameCount()
}


function checkIsWord() {
  guess = '';
inputs.forEach(input => {
  if (input.id.includes(`-${currentRow}-`)) {
    guess += input.value
  }
})
  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');
  var winningWordSplit = winningWord.slipt('')
  console.log(guessLetters)
  guessLetters.forEach(letter => {
    if(winningWord.includes(letter) && winningWordSplit !== letter) {
      updateBoxColor(letter, 'wrong-location');
      updateKeyColor(letter, 'wrong-location-key');
    }
})
  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('') === letter) {
      updateBoxColor(letter, 'correct-location');
      updateKeyColor(letter, 'correct-location-key');
    } else {
      updateBoxColor(letter, 'wrong');
      updateKeyColor(letter, 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkGameCount() {
  if (currentRow > 5) {
    declareLoser()
  }
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner(stateOfWin) {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage(stateOfWin);
  setTimeout(startNewGame, 4000);
}

function declareLoser() {
  viewGameOverMessage(losingGameOverBox)
  recordGameStats();
  setTimeout(startNewGame, 4000);
}

function recordGameStats() {
  if (checkForWin()) {
    gamesPlayed.push({ solved: true, guesses: currentRow });
  } else {
    gamesPlayed.push({ solved: false, guesses: 6 });
  }
  gameStats()
}

function gameStats() {
  let winningGamesPlayed = gamesPlayed.filter(winningGame => {
    return winningGame.solved === true
  })

  // let guessesArray = gamesPlayed.map(winningGame => {
  //   if (winningGame.solved === true) {
  //   return winningGame.guesses
  // }})
  let averageGuesses = winningGamesPlayed.reduce((acc, playedGames) => 
    acc + playedGames.guesses, 0
  )
  stats.innerHTML = `
  <h3>GAME STATS</h3>
  <p class="informational-text">You've played <span id="stats-total-games">${gamesPlayed.length}</span> games.</p>
  <p class="informational-text">You've guessed the correct word <span id="stats-percent-correct">${winningGamesPlayed.length/gamesPlayed.length*100}</span>% of the time.</p>
  <p class="informational-text">On average, it takes you <span id="stats-average-guesses">${averageGuesses/winningGamesPlayed.length}</span> guesses to find the correct word.</p>`
}


function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame(winningGameOverBox);
  viewGame(losingGameOverBox);
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame(stateOfWin) {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  stateOfWin.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage(stateOfWin) {
  stateOfWin.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
