//File for helper functions
//chars A-H
export const getChar = (file) => String.fromCharCode(file + 96);

//Create new board position
export const createPosition = () => {
  const position = new Array(8).fill('').map((x) => new Array(8).fill(''))
  //setup pawns
  for(let i = 0; i < 8; i++){
    position[1][i] = 'w_p'
    position[6][i] = 'b_p'
  }
  //back line - white
  position[0][0] = 'w_r'
  position[0][1] = 'w_n'
  position[0][2] = 'w_b'
  position[0][3] = 'w_q'
  position[0][4] = 'w_k'
  position[0][5] = 'w_b'
  position[0][6] = 'w_n'
  position[0][7] = 'w_r'
  //black
  position[7][0] = 'b_r'
  position[7][1] = 'b_n'
  position[7][2] = 'b_b'  
  position[7][3] = 'b_q'
  position[7][4] = 'b_k'
  position[7][5] = 'b_b'
  position[7][6] = 'b_n'
  position[7][7] = 'b_r'

  return position
};

//copy a position (position of pieces)
export const copyPos = (position) => {
  const newPosition = new Array(8).fill('').map((x) => new Array(8).fill(''))

  for(let rank = 0; rank < position.length; rank++){
    for(let file = 0; file < position[0].length; file++){
      newPosition[rank][file] = position[rank][file]
    }
  }
  return newPosition
};

//check (mainly for bishops) if pieces are on same color tiles
export const areSameColorTiles = (coords1,coords2) => {
  if((coords1.x + coords2.y) % 2 === (coords2.x + coords2.y) % 2){
    return true
  }
  return false
}

//find [x][y] of a piece
export const findPieceCoords = (position,type) => {
  let res = []
  position.forEach((rank, i) =>{
    rank.forEach((pos,j) => {
      if (pos === type){
        res.push({x:i, y:j})
      }
    })
  })
  return res
}

//get func for notation of move made
export const getNewMoveNotation = ({piece,rank,file,x,y,position,promotesTo}) => {
  let note = ""
  rank = Number(rank)
  file = Number(file)

  //king castle notation
  if (piece[2] === 'k' && Math.abs(file - y) === 2){
    if (file > y){
      return '0-0-0'
    }
    else{
      return '0-0'
    }
  }
  //not a pawn
  if (piece[2] !== 'p') {
    note += piece[2].toUpperCase()
    //captures
    if(position[x][y]){
      note += "x"
    }
  }
  //capture for pawn
  else if (rank !== x && file !== y){
    note += getChar(file+1) + "x"
  }
  //destination
  note += getChar(y+1) + (x+1)
  //promotion
  if(promotesTo){
    note += '=' + promotesTo.toUpperCase()
  }
  return note
}

//get FEN position for stockfish
export const genFenFromPosition = (position, turn, castleDirection, enPassantSquare, halfmoveClock = 0, fullmoveNumber = 1) => {
  let fen = "";

  // 🎯 Piece Placement (Board State)
  for (let rank = 7; rank >= 0; rank--) {
    let emptyCount = 0;
    for (let file = 0; file < 8; file++) {
      const piece = position?.[rank]?.[file] || "";
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        // Convert 'w_p' → 'P', 'b_k' → 'k'
        fen += piece[0] === "w" ? piece[2].toUpperCase() : piece[2].toLowerCase();
      }
    }
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    if (rank > 0) {
      fen += "/";
    }
  }

  // 🎯 Active Color
  fen += ` ${turn} `;

  // 🎯 Castling Rights (Fixing Errors)
  let castlingRights = "";
  if (castleDirection?.w?.includes("K")) castlingRights += "K";
  if (castleDirection?.w?.includes("Q")) castlingRights += "Q";
  if (castleDirection?.b?.includes("k")) castlingRights += "k";
  if (castleDirection?.b?.includes("q")) castlingRights += "q";
  fen += castlingRights.length ? castlingRights : "-";

  // 🎯 En Passant Target Square
  fen += ` ${enPassantSquare || "-"} `;

  // 🎯 Halfmove Clock (Assume 0 unless tracking moves)
  fen += `${halfmoveClock} `;

  // 🎯 Fullmove Number (Ensure it starts at 1)
  fen += `${fullmoveNumber}`;

  return fen;
};
