import arbiter from "../../arbiter/arbiter";
import { useAppContext } from "../../contexts/Context";
import { generateCandidateMoves } from "../../reducer/actions/move";

const Piece = ({ rank, file, piece }) => {
  const {appState, dispatch} = useAppContext();
  const {turn, castleDirection, position : currPos} = appState;

  {/* Piece picked up */}
  const onDragStart = e => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain',`${piece},${rank},${file}`)
    setTimeout(() =>{
      e.target.style.display = 'none'
    }, 0)

    if(turn == piece[0]) {
      const candidateMoves = 
        arbiter.getValidMoves({
          position: currPos[currPos.length-1],
          castleDirection : castleDirection[turn],
          prevPosition: currPos[currPos.length-2],
          piece,rank,file
        })
      dispatch(generateCandidateMoves({candidateMoves}))
    }
  };

  {/*Piece dropped*/}
  const onDragEnd = e => {
    e.target.style.display = 'block'
  };

  return (
    <div className={`piece ${piece} p-${file}${rank}`}
      draggable={true}
      onDragEnd = {onDragEnd}
      onDragStart={onDragStart}
    />
  );
};

export default Piece;
