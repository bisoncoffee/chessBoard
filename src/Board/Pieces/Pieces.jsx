import './Pieces.css';
import Piece from './Piece';
import { useRef } from 'react';
import { useAppContext } from '../../contexts/Context';
import { clearCandidates, makeNewMove } from '../../reducer/actions/move';
import arbiter from '../../arbiter/arbiter';
import { openPromotion } from '../../reducer/actions/popup';
import { getCastleDirections } from '../../arbiter/getMoves';
import { detectStalemate, updateCastling, detectInsufficientMaterial, detectCheckMate } from '../../reducer/actions/game';
import { genFenFromPosition, getNewMoveNotation } from '../../helper'
import actionTypes from '../../reducer/actionTypes';


export const Pieces = () => {
  const ref = useRef()
  const {appState,dispatch} = useAppContext()
  const currPosition = appState.position[appState.position.length-1]


  const calculateCoords = e => {
    const {width,left,top} = ref.current.getBoundingClientRect()
    const size = width / 8
    const y = Math.floor((e.clientX - left) / size)
    const x = 7 - Math.floor((e.clientY - top) / size)
    return {x,y}
  }
  
  {/*pass elements for promo box func*/}
  const openPromotionBox = ({rank,file,x,y}) => {
    dispatch(openPromotion({
      rank : Number(rank),
      file : Number(file),
      x,y
    }))
  }

  {/*elems for castling possibilities*/}
  const updateCastlingState = ({piece,rank,file}) =>{
    {/*check if castling even possible*/}
    const direction = getCastleDirections({
      castleDirection : appState.castleDirection,
      piece,rank,file
    })

    if(direction){
      dispatch(updateCastling(direction))
    }
  }

  {/*piece moved*/}
  const move = async e => {
    const {x,y} = calculateCoords(e)
    const [piece, rank, file] = e.dataTransfer.getData('text').split(',')

    {/*check if legal moves are available*/}
    if(appState.candidateMoves?.find(m=> m[0] === x && m[1] === y)){
      const opponent = piece.startsWith('b') ? 'w' : 'b'
      const castleDirection = appState.castleDirection[`${piece.startsWith('b') ? 'w' : 'b'}`]

      {/*promotion*/}
      if ((piece === 'w_p' && x === 7) || (piece === 'b_p' && x === 0)){
        openPromotionBox({rank,file,x,y})
        return
      }
      {/*castle check*/}
      if (piece.endsWith('r') || piece.endsWith('k')){
        updateCastlingState({piece,rank,file})
      }
      {/*store position of board after move is made*/}
      const newPosition = arbiter.performMove({
        position : currPosition,
        piece,rank,file,
        x,y
      })
      {/*notation*/}
      const newMove = getNewMoveNotation ({
        piece,rank,file,
        x,y,
        position : currPosition
      })
      {/*perform move*/}
      dispatch(makeNewMove({newPosition, newMove}))
      
      analyzePosition(newPosition);

      {/*conditions to end game check*/}
      if (arbiter.insufficientMaterial(newPosition)){
        dispatch(detectInsufficientMaterial())
      }
      else if (arbiter.isStalemate(newPosition,opponent,castleDirection)){
        dispatch(detectStalemate())
      }
      else if (arbiter.isCheckMate(newPosition,opponent,castleDirection)){
        dispatch(detectCheckMate(piece[0]))
      }
    }
    {/*clear candidate moves*/}
    dispatch(clearCandidates())
  }


  const analyzePosition = async (newPosition) => {
    // 1) Generate FEN and flip to the *next* player
    let fen = genFenFromPosition(
      newPosition,
      appState.turn,
      appState.castleDirection,
      appState.enPassantSquare
    );
    const parts = fen.split(' ');
    const nextTurn = appState.turn === 'w' ? 'b' : 'w';
    parts[1] = nextTurn;
    fen = parts.join(' ');

    console.log(`🔍 Sending corrected FEN to backend: ${fen}`);

    try {
      const res = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen }),
      });
      const { moves } = await res.json();
      // if (!moves?.length) {
      //   console.log('❌ No valid moves returned by Stockfish.');
      //   return;
      // }

      // console.log(
      //   `📌 Stockfish Recommended Moves (${nextTurn === 'w' ? 'White' : 'Black'} to move):`
      // );
      // moves.forEach(({ moveRank, algebraic, advantage }) => {
      //   console.log(
      //     `   🎯 ${moveRank}. ${algebraic} | ${
      //       nextTurn === 'w' ? 'White' : 'Black'
      //     }: ${advantage}`
      //   );
      // });
      if (!moves?.length) {
        console.log('❌ No valid moves returned by Stockfish.');
        return;
      }
  
      // push into your global state
      dispatch({
        type: actionTypes.UPDATE_STOCKFISH,
        payload: moves
      });
    } catch (err) {
      console.error('❌ Error analyzing position:', err);
    }
  };



  {/*move isn't performed until piece is dropped*/}
  const onDrop = e => {
    e.preventDefault()
    move(e)
  }

  const onDragOver = e => {e.preventDefault()}

  return (
    <div
      ref = {ref}
      onDrop = {onDrop} 
      onDragOver = {onDragOver}
      className="pieces"
    >
      {currPosition.map((r, rank) =>
        r.map((f, file) =>
          currPosition[rank][file] ? (
            <Piece
              key={rank + '-' + file}
              rank={rank}
              file={file}
              piece={currPosition[rank][file]}
            />
          ) : null
        )
      )}
    </div>
  )
};
