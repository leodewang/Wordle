import { useState, useEffect, useRef } from 'react';
import './App.css';

// Hard-coded secret word
const HARD_CODED_WORD = "queen";

function App() {
  console.log("WORDLE CLONE APP COMPONENT LOADED");

  const [secretWord, setSecretWord] = useState(HARD_CODED_WORD);
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentRow, setCurrentRow] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [flippingRow, setFlippingRow] = useState(-1);
  const [tileStatuses, setTileStatuses] = useState(
    Array(6).fill().map(() => Array(5).fill(''))
  );

  // Handle keyboard input
  useEffect(() => {
    if (gameOver) return;

    const handleKeyDown = (e) => {
      if (gameOver) return;
      
      // Don't allow input during animation
      if (flippingRow !== -1) return;
      
      if (e.key === 'Enter') {
        if (currentGuess.length !== 5) {
          setErrorMessage('Word must be 5 letters');
          setTimeout(() => setErrorMessage(''), 1500);
          return;
        }
        
        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);
        
        // Start the flipping animation
        setFlippingRow(currentRow);
        
        // Create a new array for tile statuses
        const newTileStatuses = [...tileStatuses];
        
        // For each tile, set up a timeout to update its status at the right moment
        for (let i = 0; i < 5; i++) {
          // Calculate when this tile will be at the halfway point of its flip
          // Each tile starts flipping after i*300ms, and reaches halfway 300ms later
          const halfwayPoint = i * 300 + 300;
          
          setTimeout(() => {
            const status = getLetterStatus(currentGuess[i], i, currentGuess);
            newTileStatuses[currentRow][i] = status;
            setTileStatuses([...newTileStatuses]);
          }, halfwayPoint);
        }
        
        // After all animations complete (last tile flip + animation duration)
        const animationCompleteTime = 5 * 300 + 300; // Last tile starts + animation duration
        setTimeout(() => {
          if (currentGuess.toLowerCase() === secretWord.toLowerCase()) {
            setGameWon(true);
            setGameOver(true);
          } else if (currentRow === 5) {
            setGameOver(true);
          } else {
            setCurrentRow(currentRow + 1);
            setCurrentGuess('');
          }
          
          // Reset flipping state
          setFlippingRow(-1);
        }, animationCompleteTime);
      } else if (e.key === 'Backspace') {
        setCurrentGuess(currentGuess.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
        setCurrentGuess(currentGuess + e.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, currentRow, gameOver, guesses, secretWord, flippingRow, tileStatuses]);

  // Check letter status (correct, present, or absent)
  const getLetterStatus = (letter, index, word) => {
    if (!letter) return '';
    if (!secretWord) return '';
    
    if (letter.toLowerCase() === secretWord[index]?.toLowerCase()) {
      return 'correct';
    } else if (secretWord.toLowerCase().includes(letter.toLowerCase())) {
      return 'present';
    } else {
      return 'absent';
    }
  };

  // Get all used letters and their statuses for the keyboard
  const getKeyboardLetterStatuses = () => {
    const statuses = {};
    
    for (let i = 0; i < currentRow; i++) {
      const guess = guesses[i];
      for (let j = 0; j < guess.length; j++) {
        const letter = guess[j].toLowerCase();
        const status = tileStatuses[i][j] || getLetterStatus(letter, j, guess);
        
        // Only upgrade status (absent -> present -> correct)
        if (status === 'correct') {
          statuses[letter] = 'correct';
        } else if (status === 'present' && statuses[letter] !== 'correct') {
          statuses[letter] = 'present';
        } else if (!statuses[letter]) {
          statuses[letter] = status;
        }
      }
    }
    
    return statuses;
  };

  const keyboardLetterStatuses = getKeyboardLetterStatuses();
  
  // Keyboard layout
  const keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
  ];

  // Handle virtual keyboard clicks
  const handleKeyClick = (key) => {
    if (gameOver || flippingRow !== -1) return;
    
    if (key === 'enter') {
      if (currentGuess.length !== 5) {
        setErrorMessage('Word must be 5 letters');
        setTimeout(() => setErrorMessage(''), 1500);
        return;
      }
      
      const newGuesses = [...guesses];
      newGuesses[currentRow] = currentGuess;
      setGuesses(newGuesses);
      
      // Start the flipping animation
      setFlippingRow(currentRow);
      
      // Create a new array for tile statuses
      const newTileStatuses = [...tileStatuses];
      
      // For each tile, set up a timeout to update its status at the right moment
      for (let i = 0; i < 5; i++) {
        // Calculate when this tile will be at the halfway point of its flip
        // Each tile starts flipping after i*300ms, and reaches halfway 300ms later
        const halfwayPoint = i * 300 + 300;
        
        setTimeout(() => {
          const status = getLetterStatus(currentGuess[i], i, currentGuess);
          newTileStatuses[currentRow][i] = status;
          setTileStatuses([...newTileStatuses]);
        }, halfwayPoint);
      }
      
      // After all animations complete (last tile flip + animation duration)
      const animationCompleteTime = 5 * 300 + 300; // Last tile starts + animation duration
      setTimeout(() => {
        if (currentGuess.toLowerCase() === secretWord.toLowerCase()) {
          setGameWon(true);
          setGameOver(true);
        } else if (currentRow === 5) {
          setGameOver(true);
        } else {
          setCurrentRow(currentRow + 1);
          setCurrentGuess('');
        }
        
        // Reset flipping state
        setFlippingRow(-1);
      }, animationCompleteTime);
    } else if (key === 'backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key);
    }
  };

  // Reset the game
  const resetGame = () => {
    setSecretWord(HARD_CODED_WORD);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setCurrentRow(0);
    setErrorMessage('');
    setFlippingRow(-1);
    setTileStatuses(Array(6).fill().map(() => Array(5).fill('')));
  };

  return (
    <div className="app" style={{ backgroundColor: '#121213' }}>
      <header>
        <h1>Wordle for the newest NYU Master Student!</h1>
      </header>

      <div className="board">
        {Array(6).fill(null).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {Array(5).fill(null).map((_, colIndex) => {
              const letter = rowIndex === currentRow 
                ? currentGuess[colIndex] || '' 
                : guesses[rowIndex][colIndex] || '';
              
              // Determine flip class
              let flipClass = '';
              
              if (rowIndex === flippingRow) {
                flipClass = `flip flip-${colIndex}`;
              }
              
              // Get status from our tileStatuses state
              const status = tileStatuses[rowIndex][colIndex];
              
              return (
                <div 
                  key={colIndex} 
                  className={`tile ${status} ${flipClass}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="keyboard">
        {keyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => {
              const status = keyboardLetterStatuses[key] || '';
              const isSpecialKey = key === 'enter' || key === 'backspace';
              
              return (
                <button
                  key={key}
                  className={`key ${status} ${isSpecialKey ? 'special-key' : ''}`}
                  onClick={() => handleKeyClick(key)}
                >
                  {key === 'backspace' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="game-over">
          {gameWon ? (
            <h2>Congrats on getting into NYU - love you!!!</h2>
          ) : (
            <div>
              <h2>hold this L and try again sucka</h2>
              <p>play again</p>
            </div>
          )}
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App; 