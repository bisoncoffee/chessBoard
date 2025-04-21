import './Board.css';
import { Files } from './bits/Files';
import { Ranks } from './bits/Ranks';
import { Pieces } from './Pieces/Pieces';
import StockfishReplies from './Control/StockfishReplies';
import { useAppContext } from '../contexts/Context';
import Popup from './Popup/Popup';
import arbiter from '../arbiter/arbiter';
import { getKingPosition } from '../arbiter/getMoves';
import PromotionBox from './Popup/PromotionBox/PromotionBox';
import GameEnds from './Popup/GameEnds/GameEnds'


{/*create game board*/}
export const Board = () => {
  {/*Arrays for ranks and files*/}
  const ranks = Array(8).fill().map((x, i) => 8 - i);
  const files = Array(8).fill().map((x, i) => i + 1);

  const {appState} = useAppContext()
  const position = appState.position[appState.position.length-1]

  
  {/*is player in check?*/}
  const isChecked = (() => {
    const isInCheck = (arbiter.isPlayerInCheck({
      positionAfterMove : position,
      player : appState.turn
    }))
    if (isInCheck){
      return getKingPosition(position,appState.turn)
    }
    return null
  })()

  {/*Color code the board*/}
  const getClassName = (i, j) => {
    let c = 'tile'
    c += (i + j) % 2 === 0 ? ' tile--dark' : ' tile--light'

    {/* space highlighting */}
    if(appState.candidateMoves?.find(m => m[0] === i && m[1] === j)){
      if(position[i][j]){
        c += ' attacking'
      }
      else{
        c += ' highlight'
      }
    }
    
    {/*checked highlight*/}
    if (isChecked && isChecked[0] === i && isChecked[1] === j){
      c += ' checked'
    }
    return c
  };

  return (
    <>
      <div className="board">
        <Ranks ranks={ranks}/>

        <div className="tiles">
          {ranks.map((rank, i) =>
            files.map((file, j) => (
              <div key={file + '-' + rank} className={getClassName(7-i, j)}>
              </div>
            ))
          )}
        </div>
        
        <Pieces/>

        <Popup>
          <PromotionBox/>
          <GameEnds/>
        </Popup>
        <StockfishReplies />
        <Files files={files}/>
      </div>
    </>
  );
};

export default Board
