import { useAppContext } from "../../../contexts/Context"
import "./MovesList.css"

{/*map each move for display*/}
const MovesList = () => {
  const {appState : {movesList}} = useAppContext()

  return <div className="moves-list">
    {movesList.map ((move,i) =>
      <div key = {i} data-number={Math.floor((i/2) + 1)}>
        {move}
      </div>
    )}
  </div>
}

export default MovesList