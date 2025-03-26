import { Status } from '../../constant'
import { useAppContext } from '../../contexts/Context'
import { closePopup } from '../../reducer/actions/popup'
import './Popup.css'
import React from 'react'

const Popup = ({children}) => {
  const {appState,dispatch} = useAppContext()
  {/*if game does not require popup*/}
  if (appState.status === Status.ongoing)
    return null

  const onClosePopup = () => {
    dispatch(closePopup())
  }
  return <div className="popup">
    {React.Children
      .toArray(children)
      .map(child => React.cloneElement(child, {onClosePopup}))
    }
  </div>
}

export default Popup