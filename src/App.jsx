import { useState, useReducer } from 'react';
import './App.css';
import { Board } from './Board/Board';
import { reducer } from './reducer/reducer';
import AppContext from './contexts/Context';
import { initGameState } from './constant';
import MovesList from './Board/Control/bits/MovesList';
import TakeBack from './Board/Control/bits/TakeBack';
import Control from './Board/Control/Control';

const App = () => {
  // 🎯 Chess Board State
  const [appState, dispatch] = useReducer(reducer, initGameState);

  // 🎯 Stockfish State
  const [bestMove, setBestMove] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  // 🔹 Analyze Current Position with Stockfish
  const analyzePosition = async () => {
    // Replace this with the actual FEN from your chess board state
    const fen = "rnbqkb1r/pppppppp/7n/8/8/7N/PPPPPPPP/RNBQKB1R w KQkq - 0 1"; // Sample FEN

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen }),
      });

      const data = await response.json();
      console.log("Stockfish Analysis:", data);

      setBestMove(data.bestMove);
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error("Error analyzing position:", error);
    }
  };

  // 🎯 Context Provider for Chess Board
  const providerState = {
    appState,
    dispatch,
  };

  return (
    <AppContext.Provider value={providerState}>
      <div className="App">
        {/* 🎯 Chess Board */}
        <Board />

        {/* 🎯 Control Panel */}
        <Control>
          <MovesList />
          <TakeBack />

          {/* 🎯 Stockfish Analysis Section */}
          <div className="stockfish-analysis">
            <button onClick={analyzePosition} className="analyze-button">
              Analyze Position
            </button>
            <p><strong>Best Move:</strong> {bestMove || "N/A"}</p>
            <p><strong>Evaluation:</strong> {evaluation !== null ? evaluation : "N/A"}</p>
          </div>
        </Control>
      </div>
    </AppContext.Provider>
  );
};

export default App;
