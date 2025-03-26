import process from "process"; 
import express, { response } from "express";
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
const convertUciToAlgebraic = (uciMove, fen) => {
    try {
        let chess = new Chess(fen); // Use FEN as is (no swapping turn)
        const from = uciMove.substring(0, 2);
        const to = uciMove.substring(2, 4);
        const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
        const moveResult = chess.move({ from, to, promotion });

        if (!moveResult) {
            console.warn(`⚠️ Warning: Could not convert move ${uciMove} to Algebraic notation.`);
            return uciMove;
        }

        return moveResult.san;
    } catch (error) {
        console.error(`❌ Error converting UCI to Algebraic for move: ${uciMove}, FEN: ${fen}`, error);
        return uciMove;
    }
};

// ** API Endpoint to Analyze a Position **
app.post("/analyze", (req, res) => {
    const { fen } = req.body;
    if (!fen) return res.status(400).json({ error: "FEN string is required" });

    console.log(`📌 Received FEN for analysis: ${fen}`);
    const stockfish = createStockfishProcess();
    let responseBuffer = "";
    let sentResponse = false;

    let fenParts = fen.split(" ");
    const currentPlayer = fenParts[1]; // "w" or "b"

    // 🔹 Confirm we are analyzing the right player's turn
    console.log(`🔍 Analyzing for: ${currentPlayer === "w" ? "White" : "Black"} to move`);

    stockfish.stdout.on("data", (data) => {
        const output = data.toString();
        console.log("🐟 Raw Stockfish Output:", output);
        responseBuffer += output;
        const moveRegex = /info depth \d+ seldepth \d+ multipv (\d+) score (cp|mate) (-?\d+) .*? pv (\S+)/g;
        let match;
        let moves = [];
        let previousScore = null;

        while ((match = moveRegex.exec(responseBuffer)) !== null) {
            let move = match[4]; // Move in UCI notation
            let evaluation = match[2] === "mate" ? `#${match[3]}` : parseInt(match[3]) / 100;

            // ✅ Ensure advantage is correctly signed
            let advantage = evaluation;
            if (currentPlayer === "b" && typeof advantage === "number") {
                advantage = -advantage; // Invert score for Black's perspective
            }

            if (moves.length === 0) previousScore = advantage;

            moves.push({
                move,
                advantage,
                scoreChange: previousScore !== null ? `${previousScore} -> ${advantage}` : `N/A`,
            });
        }

        // ✅ Ensure correct sorting
        if (currentPlayer === "w") {
            // White wants the highest score (positive)
            moves.sort((a, b) => b.advantage - a.advantage);
        } else {
            // Black wants the lowest score (most negative)
            moves.sort((a, b) => a.advantage - b.advantage);
        }

        const uniqueMoves = [];
        const seenMoves = new Set();

        moves.forEach((move) => {
            if (!seenMoves.has(move.move)) {
                seenMoves.add(move.move);
                uniqueMoves.push(move);
            }
        });

        moves = uniqueMoves.slice(0, 3);

        // 🔹 Convert moves to algebraic notation before sending response
        moves = moves.map((m) => ({
            ...m,
            algebraic: convertUciToAlgebraic(m.move, fen)
        }));

        moves.forEach((move, index) => {
            move.moveRank = index + 1;
        });

        if (!sentResponse && responseBuffer.includes("bestmove")) {
            sentResponse = true;

            if (moves.length > 0) {
                console.log(`📌 Stockfish Recommended Moves (Player: ${currentPlayer === "w" ? "White" : "Black"} to move):`);
                moves.forEach((m) => {
                    console.log(`   🎯 ${m.moveRank}. ${m.algebraic} | ${currentPlayer === "w" ? "White" : "Black"}: ${m.advantage}`);
                });
                res.json({ moves });
            } else {
                console.log("❌ No valid moves found.");
                res.json({ moves: [] });
            }

            stockfish.kill();
        }
    });

    // Function to determine adaptive depth based on game stage
    const getAdaptiveDepth = (fen) => {
        const pieceCount = fen.split(" ")[0].replace(/\d/g, "").length; // Count non-empty squares
        if (pieceCount > 25) return 15;  // Early game: Medium depth
        if (pieceCount > 15) return 20;  // Midgame: High depth
        return 25; // Endgame: Max depth
    };
    
    const getAdaptiveMultiPV = (fen) => {
        const pieceCount = fen.split(" ")[0].replace(/\d/g, "").length;
        return pieceCount > 20 ? 3 : 5; // Early game = 3, Late game = 5
    };
    const adaptiveDepth = getAdaptiveDepth(fen); // Get best depth
    const adaptiveMultiPV = getAdaptiveMultiPV(fen); // Get best MultiPV

    // ✅ Print exactly what we are sending to Stockfish
    console.log(`🛠️ Sending this FEN to Stockfish: ${fen}`);

    stockfish.stdin.write(`setoption name MultiPV value ${adaptiveMultiPV}\n`);
    stockfish.stdin.write("setoption name UCI_LimitStrength value false\n");
    stockfish.stdin.write("setoption name UCI_Elo value 3200\n");
    stockfish.stdin.write("setoption name Threads value 4\n"); // Use 4 threads for faster search
    stockfish.stdin.write("go movetime 500\n"); // 500ms per move (~0.5 seconds)
    stockfish.stdin.write(`position fen ${fen}\n`);
    setTimeout(() => {
        stockfish.stdin.write(`go depth ${adaptiveDepth}\n`); // Use calculated depth
    }, 500);
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
