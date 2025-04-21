
import PropTypes from 'prop-types';
import './StockfishReplies.css';

export default function StockfishReplies({ moves, player }) {
  if (!moves.length) return null;

  return (
    <div className="stockfish-replies">
      <h3>Stockfish Recommendations</h3>
      <p className="to-move">{player} to move</p>
      <ol>
        {moves.map(({ algebraic, advantage }, i) => (
          <li key={i}>
            {algebraic} {advantage >= 0 ? '+' : ''}
            {advantage}
          </li>
        ))}
      </ol>
    </div>
  );
}

StockfishReplies.propTypes = {
  moves: PropTypes.arrayOf(
    PropTypes.shape({
      moveRank: PropTypes.number.isRequired,
      algebraic: PropTypes.string.isRequired,
      advantage: PropTypes.number
    })
  )
};

StockfishReplies.defaultProps = {
  moves: []
};
