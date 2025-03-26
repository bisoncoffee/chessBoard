import actionTypes from "../actionTypes"

//open promotion box
export const openPromotion = ({rank,file,x,y}) => {
  return{
    type : actionTypes.PROMOTION_OPEN,
    payload : {rank,file,x,y}
  }
};
//close popup
export const closePopup = () => {
  return{
    type : actionTypes.PROMOTION_CLOSE
  }
};