import { areSameColorTiles, findPieceCoords } from "../helper";
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnCaptures, getPawnMoves, getQueenMoves, getRookMoves, getCastlingMoves, getKingPosition, getPieces } from "./getMoves"
import { movePawn, movePiece } from "./move";

const arbiter = {
  getRegularMoves : function({position,piece,rank,file}) {
    {/*normal moves*/}

    {/* Rook */}
    if(piece.endsWith('r')){
      return getRookMoves({position,piece,rank,file})
    }
    {/* Knight */}
    if(piece.endsWith('n')){
      return getKnightMoves({position,rank,file})
    }
    {/* Bishop */}
    if(piece.endsWith('b')){
      return getBishopMoves({position,piece,rank,file})
    }
    {/* Queen */}
    if(piece.endsWith('q')){
      return getQueenMoves({position,piece,rank,file})
    }
    {/* King */}
    if(piece.endsWith('k')){
      return getKingMoves({position,piece,rank,file})
    }
    {/* Pawns */}
    if(piece.endsWith('p')){
      return getPawnMoves({position,piece,rank,file})
    }
  },

  getValidMoves : function({position,castleDirection,prevPosition,piece,rank,file}) {
    {/*special moves*/}

    let moves = this.getRegularMoves({position,piece,rank,file})
    {/*moves that do not put king in check*/}
    const notInCheckMoves = []
    {/*pawn captures*/}
    if(piece.endsWith('p')){
      moves = [
        ...moves,
        ...getPawnCaptures({position,prevPosition,piece,rank,file})
      ]
    }
    {/*castling*/}
    if(piece.endsWith('k')){
      moves = [
        ...moves,
        ...getCastlingMoves({position,castleDirection,piece,rank,file})
      ]
    }
    {/*insure moves found do not put player in check*/}
    moves.forEach(([x,y]) => {
      const positionAfterMove = this.performMove({position,piece,rank,file,x,y})

      if (!this.isPlayerInCheck({positionAfterMove,position,player:piece[0]})){
        notInCheckMoves.push([x,y])
      }
    })
    return notInCheckMoves
  },

  performMove : function ({position,piece,rank,file,x,y}) {
    {/*create position with move made*/} 
    if(piece.endsWith('p')){
      return movePawn({position,piece,rank,file,x,y})
    }
    else{
      return movePiece({position,piece,rank,file,x,y})
    }
  },

  isPlayerInCheck : function ({positionAfterMove,position,player}) {
    const enemy = player.startsWith('w') ? 'b' : 'w'
    let kingPos = getKingPosition(positionAfterMove,player)
    const enemyPieces = getPieces(positionAfterMove,enemy)

    {/*collect moves possible for opponent*/} 
    const enemyMoves = enemyPieces.reduce((acc,p) => acc = [
      ...acc,
      ...(p.piece.endsWith('p')
      ? getPawnCaptures({
          position: positionAfterMove,
          prevPosition: position,
          ...p
        })
      : this.getRegularMoves({
          position: positionAfterMove,
          ...p
        })
      )
    ], [])

    {/*if king's position is within list of possible enemy moves*/} 
    if (enemyMoves.some(([x,y]) => kingPos[0] === x && kingPos[1] === y)){
      return true
    }
    return false
  },

  isStalemate : function (position,player,castleDirection) {
    const isInCheck = this.isPlayerInCheck({positionAfterMove : position, player})
    if (isInCheck){
      return false
    }

    const pieces = getPieces(position,player)
    const moves = pieces.reduce((acc,p) => acc = [
      ...acc,
      ...(this.getValidMoves({
        position,
        castleDirection,
        ...p
        })
      )
    ], [])

    {/*stalemate = player not in check with zero legal moves*/} 
    return(!isInCheck && moves.length === 0)
  },

  insufficientMaterial : function(position) {
    const pieces =  position.reduce((acc,rank) => 
      acc = [
        ...acc,
        ...rank.filter(x => x)
      ], [])
    {/*only kings left */}
    if(pieces.length === 2){
      return true
    }
    {/*only bishop/knight and kings left */}
    if(pieces.length === 3 && (pieces.some(p => p.endsWith('b') || p.endsWith('n')))){
      return true
    }
    {/*only same color tile bishops and kings left */}
    if(pieces.length === 4 && 
      pieces.every(p => p.endsWith('b') || p.endsWith('k')) && 
      new Set(pieces).size === 4 && 
      areSameColorTiles(
        findPieceCoords(position,'w_b')[0],
        findPieceCoords(position,'b_b')[0]
      )){
        return true
      }
  },

  isCheckMate : function (position,player,castleDirection) {
    {/*same as stalemate func except king is in check*/} 
    const isInCheck = this.isPlayerInCheck({positionAfterMove : position, player})
    if(!isInCheck){
      return false
    }

    const pieces = getPieces(position,player)
    const moves = pieces.reduce((acc,p) => acc = [
      ...acc,
      ...(this.getValidMoves({
        position,
        castleDirection,
        ...p
        })
      )
    ], [])

    return(isInCheck && moves.length === 0)
  },

  
};

export default arbiter;