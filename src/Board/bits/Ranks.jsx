import './Ranks.css';

export const Ranks = ({ ranks }) => {
  return (
    <div className="ranks">
      {ranks.map((rank) => 
        <span key={rank}>{rank}</span>
      )}
    </div>
  )
};
