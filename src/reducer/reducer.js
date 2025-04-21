import { Status } from "../constant";
import actionTypes from "./actionTypes";

export const reducer = (state, action) => {
  switch (action.type) {
    //new move
    case actionTypes.NEW_MOVE : {
      let {turn,position,movesList} = state
      turn = turn == 'w' ? 'b' : 'w'

      position = [
        ...position,
        action.payload.newPosition
      ]
      movesList = [
        ...movesList,
        action.payload.newMove
      ]
      return{
        ...state,
        turn,
        position,
        movesList
      }
    }
    //legal possible moves
    case actionTypes.GENERATE_CANDIDATE_MOVES : {
      const {candidateMoves} = action.payload
      return {
        ...state,
        candidateMoves
      }
    }
    //revert previous move
    case actionTypes.TAKE_BACK : {
      let{position,movesList,turn,castleDirection} = state
      //previous position exists check
      if(position.length > 1){
        position = position.slice(0,position.length-1)
        movesList = movesList.slice(0,position.length-1)
        turn = turn === 'w' ? 'b' : 'w'
      }
      return {
        ...state,
        position,
        movesList,
        turn,
        ...castleDirection
      }
    }
    //clear legal possible moves
    case actionTypes.CLEAR_CANDIDATE_MOVES : {
      return {
        ...state,
        candidateMoves : []
      }
    }
    //pawn up for promotion
    case actionTypes.PROMOTION_OPEN : {
      return {
        ...state,
        status : Status.promoting,
        promotionSquare : {...action.payload}
      }
    }
    //promotion piece chosen
    case actionTypes.PROMOTION_CLOSE : {
      return {
        ...state,
        status : Status.ongoing,
        promotionSquare : null
      }
    }
    //ability to castle check
    case actionTypes.CAN_CASTLE : {
      let {turn, castleDirection} = state
      castleDirection[turn] = action.payload
      return {
        ...state,
        castleDirection
      }
    }
    //game ending in stalemate
    case actionTypes.STALEMATE : {
      return {
        ...state,
        status : Status.stalemate,
      }
    }
    //new game
    case actionTypes.NEW_GAME : {
      return {
        ...action.payload
      }
    }
    //game ends due to insuff material
    case actionTypes.INSUFFICIENT_MATERIAL : {
      return {
        ...state,
        status : Status.insufficient
      }
    }
    //game ends due to a checkmate
    case actionTypes.WIN : {
      return {
        ...state,
        status : action.payload === 'w' ? Status.white : Status.black,
      }
    }

    case actionTypes.UPDATE_STOCKFISH: {
      return{
        ...state,
        stockfish: action.payload
      }
    }

    default:{
      return state
    }
  }
};