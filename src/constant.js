import { createPosition } from "./helper"

//status strings for reference
export const Status = {
  'ongoing' : 'Ongoing',
  'promoting' : 'Promoting',
  'white' : 'White wins',
  'black' : 'Black wins',
  'stalemate' : 'Game draws due to stalemate',
  'insufficient' : 'Game draws due to insufficient material'
};

//initialization of elements for a new game
export const initGameState = {
  position : [createPosition()],
  turn : 'w',
  movesList: [],
  candidateMoves : [],
  status : Status.ongoing,
  promotionSquare : null,
  castleDirection : {
    w : 'both',
    b : 'both'
  }
};