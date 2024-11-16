const express = require('express');
const router = express.Router();
const { isMoveValid } = require('../utils/chessHelpers');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the board state on the backend
let boardState = initializeBoardState();

// Track last move for en passant, and king/rook move flags for castling
let lastMove = null;
const moveFlags = {
  hasWhiteKingMoved: false,
  hasBlackKingMoved: false,
  hasWhiteRookMoved: { kingSide: false, queenSide: false },
  hasBlackRookMoved: { kingSide: false, queenSide: false },
};

// Function to set up the initial chessboard state
function initializeBoardState() {
  return [
    [{ type: "rook", color: "black" }, { type: "knight", color: "black" }, { type: "bishop", color: "black" }, { type: "queen", color: "black" }, { type: "king", color: "black" }, { type: "bishop", color: "black" }, { type: "knight", color: "black" }, { type: "rook", color: "black" }],
    [{ type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [{ type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }],
    [{ type: "rook", color: "white" }, { type: "knight", color: "white" }, { type: "bishop", color: "white" }, { type: "queen", color: "white" }, { type: "king", color: "white" }, { type: "bishop", color: "white" }, { type: "knight", color: "white" }, { type: "rook", color: "white" }]
  ];
}

// Endpoint to get the current board state
router.get('/board-state', (req, res) => {
  res.status(200).json(boardState);
});

// Endpoint to handle move validation and updating the board state
router.post('/move', (req, res) => {
  const { fromPosition, toPosition } = req.body;
  const piece = boardState[fromPosition[0]][fromPosition[1]];
  //console.log('Received move data:', { fromPosition, toPosition, piece });

  // Check if the move is valid, including special move conditions
  const isWhite = piece.color === 'white';
  const kingMovedFlag = isWhite ? moveFlags.hasWhiteKingMoved : moveFlags.hasBlackKingMoved;
  const rookMovedFlag = isWhite ? moveFlags[`has${capitalizeFirstLetter(piece.color)}RookMoved`] : moveFlags[`has${capitalizeFirstLetter(piece.color)}RookMoved`];
  
  const isValid = isMoveValid(piece, fromPosition, toPosition, boardState, lastMove, kingMovedFlag, rookMovedFlag);

  if (isValid) {
    // Move the piece if the move is valid
    const [fromRow, fromCol] = fromPosition;
    const [toRow, toCol] = toPosition;
    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = null;
  
    // Update lastMove for en passant tracking
    lastMove = { from: fromPosition, to: toPosition, piece };
  
    // Update king/rook move flags for castling tracking
    if (piece.type === 'king') {
      if (piece.color === 'white') moveFlags.hasWhiteKingMoved = true;
      if (piece.color === 'black') moveFlags.hasBlackKingMoved = true;
    }
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (fromPosition[1] === 0) moveFlags.hasWhiteRookMoved.queenSide = true;
        if (fromPosition[1] === 7) moveFlags.hasWhiteRookMoved.kingSide = true;
      }
      if (piece.color === 'black') {
        if (fromPosition[1] === 0) moveFlags.hasBlackRookMoved.queenSide = true;
        if (fromPosition[1] === 7) moveFlags.hasBlackRookMoved.kingSide = true;
      }
    }
  
    // Handle rook movement during castling
    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
      const isKingSide = toCol > fromCol;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
      const rookPiece = boardState[fromRow][rookFromCol];
  
      // Move the rook
      boardState[fromRow][rookToCol] = rookPiece;
      boardState[fromRow][rookFromCol] = null;
  
      // Update rook moved flag
      if (piece.color === 'white') {
        moveFlags.hasWhiteRookMoved[isKingSide ? 'kingSide' : 'queenSide'] = true;
      } else {
        moveFlags.hasBlackRookMoved[isKingSide ? 'kingSide' : 'queenSide'] = true;
      }
    }
  
    res.status(200).json({ valid: true, boardState }); // Send the updated board back to the frontend
  } else {
    res.status(400).json({ valid: false, message: 'Invalid move' });
  }
  
});

module.exports = router;
