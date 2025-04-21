import { useReducer } from 'react';
import './App.css';
import { Board } from './Board/Board';
import { reducer } from './reducer/reducer';
import AppContext from './contexts/Context';
import { initGameState } from './constant';
import MovesList from './Board/Control/bits/MovesList';
import TakeBack from './Board/Control/bits/TakeBack';
import Control from './Board/Control/Control';
import StockfishReplies from './Board/Control/StockfishReplies';

const App = () => {
  const [appState, dispatch] = useReducer(reducer, initGameState);

  // ← define this before you use it
  const stockfishMoves = appState.stockfish || [];
  const nextPlayer     = appState.turn === 'w' ? 'White' : 'Black';

  return (
    <AppContext.Provider value={{ appState, dispatch }}>
      <div className="App">
        {/* now this has something to render */}
        <StockfishReplies moves={stockfishMoves} player={nextPlayer} />

        <Board />

        <Control>
          <MovesList />
          <TakeBack />
        </Control>
      </div>
    </AppContext.Provider>
  );
};

export default App;
