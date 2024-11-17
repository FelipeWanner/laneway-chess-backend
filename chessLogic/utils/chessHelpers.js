// chessLogic/utils/chessHelpers.js

// Check if position is within board boundaries
const isWithinBoard = (position) => {
  const [row, col] = position;
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Pawn movement rules with en passant
const validatePawnMove = (from, to, color, boardState, lastMove) => {
const [fromRow, fromCol] = from;
const [toRow, toCol] = to;
const direction = color === 'white' ? -1 : 1;

let isValidMove = false;

// Basic forward move (cannot capture)
if (fromCol === toCol && toRow === fromRow + direction && !boardState[toRow][toCol]) {
  isValidMove = true;
}

// Initial double forward move
if (
  fromCol === toCol &&
  ((color === 'white' && fromRow === 6) || (color === 'black' && fromRow === 1)) &&
  toRow === fromRow + 2 * direction &&
  !boardState[toRow][toCol] &&
  !boardState[fromRow + direction][fromCol]
) {
  isValidMove = true;
}

// Capture move
if (
  Math.abs(fromCol - toCol) === 1 &&
  toRow === fromRow + direction &&
  boardState[toRow][toCol] &&
  boardState[toRow][toCol].color !== color
) {
  isValidMove = true;
}

// En passant capture
if (validateEnPassant(from, to, color, boardState, lastMove)) {
  isValidMove = true;
}

// Handle regular move and promotion together
if (isValidMove) {
  const promotionRank = color === 'white' ? 0 : 7;

  // Promotion check
  if (toRow === promotionRank) {
    boardState[toRow][toCol] = {
      type: 'queen', // Default promotion to a queen
      color,
    };
    console.log(`Pawn promoted to a queen at ${toRow}, ${toCol}`);
  } else {
    // Regular move
    boardState[toRow][toCol] = boardState[fromRow][fromCol];
  }

  boardState[fromRow][fromCol] = null; // Clear the old position
  console.log("Updated Board State (after move):", boardState);
  return true; // Indicate valid move
}

return false; // Indicate invalid move
};



// En Passant validation
const validateEnPassant = (from, to, color, boardState, lastMove) => {
const [fromRow, fromCol] = from;
const [toRow, toCol] = to;
const direction = color === 'white' ? -1 : 1;
const opponentColor = color === 'white' ? 'black' : 'white';

if (
  lastMove &&
  lastMove.piece.type === 'pawn' &&
  lastMove.piece.color === opponentColor &&
  Math.abs(lastMove.from[0] - lastMove.to[0]) === 2
) {
  if (
    fromRow + direction === toRow &&
    lastMove.to[1] === toCol &&
    Math.abs(lastMove.to[1] - fromCol) === 1
  ) {
    boardState[lastMove.to[0]][lastMove.to[1]] = null;
    return true;
  }
}

//console.log("Invalid en passant move");
return false;
};


// Rook movement rules with collision handling
const validateRookMove = (from, to, boardState) => {
  //console.log("Rook moved");
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (fromRow !== toRow && fromCol !== toCol) {
    //console.log("Invalid rook move: Rook can only move in straight lines");
    return false; // Rook moves only in straight lines
  }

  // Check for path obstruction
  const rowDirection = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
  const colDirection = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);

  let row = fromRow + rowDirection;
  let col = fromCol + colDirection;
  while (row !== toRow || col !== toCol) {
    if (boardState[row][col]) {
      //console.log("Invalid rook move: Path is obstructed");
      return false;
    }
    row += rowDirection;
    col += colDirection;
  }

  // Check if destination has an ally
  if (boardState[toRow][toCol] && boardState[toRow][toCol].color === boardState[fromRow][fromCol].color) {
    //console.log("Invalid rook move: Cannot capture an ally piece");
    return false;
  }

  return true;
};

// Knight movement rules (no path obstruction check needed)
const validateKnightMove = (from, to, boardState) => {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (!isWithinBoard(to)) return false; // Ensure destination is within the board

  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  return (
    (rowDiff === 2 && colDiff === 1) ||
    (rowDiff === 1 && colDiff === 2)
  ) && (!boardState[toRow][toCol] || boardState[toRow][toCol].color !== boardState[fromRow][fromCol].color);
};


// Bishop movement rules with collision handling
const validateBishopMove = (from, to, boardState) => {
  //console.log("Bishop moved");
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) {
    //console.log("Invalid bishop move: Bishop can only move diagonally");
    return false; // Diagonal moves only
  }

  const rowDirection = toRow > fromRow ? 1 : -1;
  const colDirection = toCol > fromCol ? 1 : -1;

  let row = fromRow + rowDirection;
  let col = fromCol + colDirection;
  while (row !== toRow || col !== toCol) {
    if (boardState[row][col]) {
      //console.log("Invalid bishop move: Path is obstructed");
      return false;
    }
    row += rowDirection;
    col += colDirection;
  }

  // Check if destination has an ally
  if (boardState[toRow][toCol] && boardState[toRow][toCol].color === boardState[fromRow][fromCol].color) {
    //console.log("Invalid bishop move: Cannot capture an ally piece");
    return false;
  }

  return true;
};

// Queen movement rules (combines Rook and Bishop logic)
const validateQueenMove = (from, to, boardState) => {
  //console.log("Queen moved");
  return validateRookMove(from, to, boardState) || validateBishopMove(from, to, boardState);
};

// King movement rules with collision handling
// King movement rules with castling
// Update King move to handle castling
// Castling validation
// Function to check if the path is safe for castling
const checkPathSafeForCastling = (from, to, boardState, color) => {
const [fromRow, fromCol] = from;
const [toRow, toCol] = to;

const colDirection = toCol > fromCol ? 1 : -1;
let col = fromCol;

while (col !== toCol + colDirection) {
  const square = [fromRow, col];
  if (isSquareUnderAttack(square, boardState, color)) {
    console.log("Path is under attack at:", square);
    return false;
  }
  col += colDirection;
}

return true;
};

// Function to check if a square is under attack
const isSquareUnderAttack = (square, boardState, color) => {
const opponentColor = color === 'white' ? 'black' : 'white';

for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const piece = boardState[row][col];
    if (piece && piece.color === opponentColor) {
      if (validateMoveForAttack(piece, [row, col], square, boardState)) {
        return true;
      }
    }
  }
}
return false;
};

// Simplified move validation for attack checking (ignoring king moves to prevent recursion)
const validateMoveForAttack = (piece, from, to, boardState) => {
switch (piece.type) {
  case 'pawn':
    return validatePawnAttackMove(from, to, piece.color, boardState);
  case 'rook':
    return validateRookMove(from, to, boardState);
  case 'knight':
    return validateKnightMove(from, to, boardState);
  case 'bishop':
    return validateBishopMove(from, to, boardState);
  case 'queen':
    return validateQueenMove(from, to, boardState);
  // Do not include king to avoid infinite recursion
  default:
    return false;
}
};

// Adjusted pawn attack move validation
const validatePawnAttackMove = (from, to, color, boardState) => {
const [fromRow, fromCol] = from;
const [toRow, toCol] = to;
const direction = color === 'white' ? -1 : 1;

return (
  Math.abs(fromCol - toCol) === 1 &&
  toRow === fromRow + direction
);
};

const validateCastleMove = (from, to, boardState, hasKingMoved, hasRookMoved = {}) => {
const [fromRow, fromCol] = from;
const [toRow, toCol] = to;

console.log("Validating castling move...");
console.log("From:", from, "To:", to);
console.log("hasKingMoved:", hasKingMoved);
console.log("hasRookMoved:", hasRookMoved);

// Ensure king is moving exactly two squares horizontally
if (fromRow !== toRow || Math.abs(toCol - fromCol) !== 2) {
  console.log("Invalid castle: King must move exactly two squares horizontally");
  return false;
}

const isKingSide = toCol > fromCol; // Determine if it's king-side castling
const rookCol = isKingSide ? 7 : 0; // Rook's initial column
const rookPosition = [fromRow, rookCol];
const rook = boardState[rookPosition[0]][rookPosition[1]];

console.log("Rook position:", rookPosition);
console.log("Rook:", rook);

// Ensure the rook exists and hasn't moved
if (!rook || rook.type !== 'rook' || hasRookMoved[isKingSide ? "kingSide" : "queenSide"]) {
  console.log("Invalid castle: Rook is missing or has moved");
  return false;
}

// Ensure path between king and rook is clear
const path = isKingSide
  ? [[fromRow, fromCol + 1], [fromRow, fromCol + 2]]
  : [[fromRow, fromCol - 1], [fromRow, fromCol - 2]];

console.log("Path to check for obstruction:", path);

for (const [row, col] of path) {
  if (boardState[row][col]) {
    console.log("Invalid castle: Path is obstructed at:", [row, col]);
    return false;
  }
}

// Ensure the castling path is safe
if (!checkPathSafeForCastling(from, to, boardState, boardState[fromRow][fromCol].color)) {
  console.log("Invalid castle: Path is not safe");
  return false;
}

console.log("Castling move is valid");
return true;
};



// King movement rules
const validateKingMove = (from, to, boardState, hasKingMoved, hasRookMoved) => {
console.log("Validating king move...");
console.log("From:", from, "To:", to);
console.log("hasKingMoved:", hasKingMoved);

const [fromRow, fromCol] = from;
const [toRow, toCol] = to;

const rowDiff = Math.abs(fromRow - toRow);
const colDiff = Math.abs(fromCol - toCol);

// Regular king move
if (rowDiff <= 1 && colDiff <= 1) {
  if (boardState[toRow][toCol] && boardState[toRow][toCol].color === boardState[fromRow][fromCol].color) {
    console.log("Invalid king move: Cannot move to square occupied by ally");
    return false;
  }
  return true;
}

// Castling move
if (validateCastleMove(from, to, boardState, hasKingMoved, hasRookMoved)) {
  console.log("Castling move validated");
  return true;
}

console.log("Invalid king move");
return false;
};


// General move validator
const isMoveValid = (piece, from, to, boardState, lastMove, hasKingMoved, hasRookMoved) => {
  if (!isWithinBoard(to)) {
    return false;
  }

  const tempBoard = boardState.map((row) => row.slice()); // Clone board for simulation
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  // Simulate the move
  const originalPiece = tempBoard[toRow][toCol];
  tempBoard[toRow][toCol] = piece;
  tempBoard[fromRow][fromCol] = null;

  // Check if the move leaves the king in check
  if (isKingInCheck(piece.color, tempBoard)) {
    return false; // Illegal move: King is in check after move
  }

  switch (piece.type) {
    case 'pawn':
      return validatePawnMove(from, to, piece.color, boardState, lastMove);
    case 'rook':
      return validateRookMove(from, to, boardState);
    case 'knight':
      return validateKnightMove(from, to, boardState);
    case 'bishop':
      return validateBishopMove(from, to, boardState);
    case 'queen':
      return validateQueenMove(from, to, boardState);
    case 'king':
      return validateKingMove(from, to, boardState, hasKingMoved, hasRookMoved);
    default:
      return false;
  }
};

// Check if a king is in check
const isKingInCheck = (color, boardState) => {
  const opponentColor = color === 'white' ? 'black' : 'white';

  // Find the king's position
  let kingPosition = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingPosition = [row, col];
        break;
      }
    }
    if (kingPosition) break;
  }

  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece && piece.color === opponentColor) {
        if (validateMoveForAttack(piece, [row, col], kingPosition, boardState)) {
          return true;
        }
      }
    }
  }

  return false;
};

module.exports = { isMoveValid };
