onmessage = async (event) => {
  const command = event.data
  const Stockfish = await import('stockfish.js')
  const engine =  Stockfish.default()
  engine.addMessageListener((msg) => postMessage(msg))
  engine.postMessage(command)
}