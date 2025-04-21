import { useAppContext } from '../../../contexts/Context'
import { copyPos, getNewMoveNotation } from '../../../helper'
import { clearCandidates, makeNewMove } from '../../../reducer/actions/move'
import './PromotionBox.css'

{/*pawn promotion box*/}
const PromotionBox = ({onClosePopup}) => {
  const {appState, dispatch} = useAppContext()
  const {promotionSquare} = appState
  {/*pawn not in enemy back line*/}
  if(!promotionSquare){
    return null
  }
  
  const color = promotionSquare.x === 7 ? 'w' : 'b'
  const options = ['q','r','b','n']

  {/*position box based on if white or black/rank & file of promo square*/}
  const getPromotionBoxPos = () => {
    const style = {}
    
    if (promotionSquare.x === 7){
      style.top = '-12.5%';
    }
    else{
      style.top = '97.5%';
    }

    if (promotionSquare.y <= 1){
      style.left = '0%';
    }
    else if (promotionSquare.y >= 5){
      style.right = '0%';
    }
    else{
      style.left = `${12.5 * promotionSquare.y - 20}%`;
    }

    return style
  }

  {/*when promotion choice is selected*/}
  const onClick = (option) => {
    onClosePopup()
    const newPosition = copyPos(appState.position[appState.position.length-1])

    newPosition[promotionSquare.rank][promotionSquare.file] = ""
    newPosition[promotionSquare.x][promotionSquare.y] = `${color}_${option}`

    dispatch(clearCandidates())
    
    {/*store notation*/}
    const newMove = getNewMoveNotation({
      ...promotionSquare,
      piece : color +'_p',
      promotesTo : option,
      position: appState.position[appState.position.length-1]
    })
    
    dispatch(makeNewMove({newPosition,newMove}))
  }

  return <div className="popup--inner promotion-choices" style={getPromotionBoxPos()}>
    {options.map(option =>
      <div key={option}
        className={`piece ${color}_${option}`}
        onClick={() => onClick(option)}>
      </div>
    )}

  </div>
}

export default PromotionBox