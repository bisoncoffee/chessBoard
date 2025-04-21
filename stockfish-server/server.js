import process from "process"; 
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { Chess } from "chess.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const stockfishPath = "C:\\Users\\Brycen\\Documents\\chessBoard\\stockfish-server\\stockfish.exe";

// Function to create a new Stockfish instance
const createStockfishProcess = () => {
    const stockfish = spawn("cmd", ["/c", stockfishPath]);
    stockfish.stdin.write("uci\n");  // Ensure Stockfish initializes properly
    stockfish.stdin.write("isready\n");
    return stockfish;
};

// Function to convert UCI notation to Algebraic Chess Notation
const convertUciToSan = (uciMove, fen) => {
    try {
      const chess = new Chess(fen);
      const from = uciMove.slice(0, 2);
      const to   = uciMove.slice(2, 4);
      const promo = uciMove.length > 4 ? uciMove[4] : undefined;
      const result = chess.move({ from, to, promotion: promo });
      if (!result) {
        console.warn(`⚠️ Could not convert ${uciMove} to SAN`);
        return uciMove;
      }
      return result.san;
    } catch (err) {
      console.error(`❌ SAN conversion error for ${uciMove}`, err);
      return uciMove;
    }
  };

// ** API Endpoint to Analyze a Position **
app.post("/analyze", (req, res) => {
    const { fen } = req.body;
    if (!fen) return res.status(400).json({ error: "FEN required" });
  
    console.log(`📌 Received FEN: ${fen}`);
    const sf = createStockfishProcess();
  
    let buffer = "";
    let responded = false;
  
    // We'll keep only the PV lines at the deepest depth seen
    let bestList = [];
    let maxDepth = 0;
  
    // Figure out who is to move
    const parts = fen.split(" ");
    const toMove = parts[1] === "w" ? "White" : "Black";
  
    sf.stdout.on("data", (data) => {
      buffer += data.toString();
  
      // Capture depth, multipv, score and pv
      const regex =
        /info depth (\d+) seldepth \d+ multipv (\d+) score (cp|mate) (-?\d+) .*? pv (\S+)/g;
      let match;
      while ((match = regex.exec(buffer)) !== null) {
        const depth   = parseInt(match[1], 10);
        const multipv = parseInt(match[2], 10);
        let evalRaw   =
          match[3] === "mate"
            ? `#${match[4]}`
            : parseInt(match[4], 10) / 100;
  
        // Invert sign for Black to move
        if (toMove === "Black" && typeof evalRaw === "number") {
          evalRaw = -evalRaw;
        }
  
        // If we see a new, deeper depth, reset our list
        if (depth > maxDepth) {
          maxDepth = depth;
          bestList = [];
        }
        // Only collect lines at the current maxDepth
        if (depth === maxDepth) {
          bestList.push({ multipv, uci: match[5], advantage: evalRaw });
        }
      }
  
      // Once Stockfish prints "bestmove", we're done
      if (!responded && buffer.includes("bestmove")) {
        responded = true;
  
        // Sort by multipv index (1,2,3) and take top 3
        bestList.sort((a, b) => a.multipv - b.multipv);
        const responseMoves = bestList.slice(0, 3).map((m, i) => ({
          moveRank:  i + 1,
          algebraic: convertUciToSan(m.uci, fen),
          advantage: m.advantage,
        }));
  
        console.log(`📌 Stockfish Recommended Moves (${toMove} to move):`);
        responseMoves.forEach((m) =>
          console.log(`   🎯 ${m.moveRank}. ${m.algebraic} | ${toMove}: ${m.advantage}`)
        );
  
        res.json({ moves: responseMoves });
        sf.kill();
      }
    });
  
    // Kick off the search
    sf.stdin.write(`position fen ${fen}\n`);
    sf.stdin.write("setoption name MultiPV value 3\n");
    sf.stdin.write("go depth 15\n");
});




// 🔹 Ensure the server stops Stockfish on `Ctrl + C`
process.on("SIGINT", () => {
    console.log("🛑 Shutting down Stockfish server...");
    process.exit(0);
});

// Start the Server
app.listen(PORT, () => {
    console.log(`✅ Stockfish server running at http://localhost:${PORT}`);
});
