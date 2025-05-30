import { copyPos } from "../helper"

export const movePiece = ({position,piece,rank,file,x,y}) => {
  const newPosition = copyPos(position)

  {/*castle*/}
  if (piece.endsWith('k') && Math.abs(y - file) > 1){
    {/*left*/}
    if (y === 2){
      newPosition[rank][0] = ''
      newPosition[rank][3] = piece.startsWith('w') ? 'w_r' : 'b_r'
    }
    {/*right*/}
    if (y === 6){
      newPosition[rank][7] = ''
      newPosition[rank][5] = piece.startsWith('w') ? 'w_r' : 'b_r'
    }
  }
  newPosition[rank][file] = ''
  newPosition[x][y] = piece

  return newPosition
}

export const movePawn = ({position,piece,rank,file,x,y}) => {
  const newPosition = copyPos(position)
  if(!newPosition[x][y] && x !== rank && y !== file){
    newPosition[rank][y] = ''
  }
  newPosition[rank][file] = ''
  newPosition[x][y] = piece

  return newPosition
}
