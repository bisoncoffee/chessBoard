import { Status } from '../../../constant'
import { useAppContext } from '../../../contexts/Context'
import { setupNewGame } from '../../../reducer/actions/game'
import './GameEnds.css'

{/*game is over*/}
const GameEnds = ({onClosePopup}) => {
  const {appState : {status}, dispatch} = useAppContext()
  
  {/*game ongoing check*/}
  if(status === Status.ongoing || status === Status.promoting){
    return null
  }

  const isWin = status.endsWith('wins')
  const newGame = () => {
    dispatch(setupNewGame())
  }

  return <div className="popup--inner popup--inner__center">
    <h1>{isWin ? status : 'Draw'}</h1>
    <p>{!isWin && status}</p>
    <div className={status}></div>
    <button onClick={newGame}>New Game</button>
  </div>
}

export default GameEnds