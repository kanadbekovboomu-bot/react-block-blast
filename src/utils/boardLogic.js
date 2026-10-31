/**
 * Pure board operations, validation, line detection, and game-over detection for Block Blast.
 */

export const BOARD_SIZE = 8;

/**
 * Creates an empty 8x8 board matrix.
 * @param {number} size
 * @returns {Array<Array<null | { color: string, accent: string, type: string }>>}
 */
export function createEmptyBoard(size = BOARD_SIZE) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

/**
 * Validates whether a piece matrix can be placed on the board at (anchorRow, anchorCol).
 *
 * @param {Array<Array<any>>} board
 * @param {number[][]} pieceMatrix
 * @param {number} anchorRow Top-left anchor row
 * @param {number} anchorCol Top-left anchor column
 * @returns {boolean} True if in bounds and no collision
 */
export function canPlacePiece(board, pieceMatrix, anchorRow, anchorCol) {
  if (!board || !pieceMatrix) return false;
  const boardRows = board.length;
  const boardCols = board[0].length;
  const pieceRows = pieceMatrix.length;
  const pieceCols = pieceMatrix[0].length;

  for (let r = 0; r < pieceRows; r++) {
    for (let c = 0; c < pieceCols; c++) {
      if (pieceMatrix[r][c] === 1) {
        const targetR = anchorRow + r;
        const targetC = anchorCol + c;

        // Boundary check
        if (targetR < 0 || targetR >= boardRows || targetC < 0 || targetC >= boardCols) {
          return false;
        }

        // Collision check
        if (board[targetR][targetC] !== null && board[targetR][targetC] !== 0) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Returns the ghost preview cells and overall validity.
 *
 * @param {Array<Array<any>>} board
 * @param {number[][]} pieceMatrix
 * @param {number} anchorRow
 * @param {number} anchorCol
 * @returns {{ isValid: boolean, cells: Array<{ r: number, c: number, isValid: boolean }> }}
 */
export function getGhostCoordinates(board, pieceMatrix, anchorRow, anchorCol) {
  if (!board || !pieceMatrix) return { isValid: false, cells: [] };
  const boardRows = board.length;
  const boardCols = board[0].length;
  const pieceRows = pieceMatrix.length;
  const pieceCols = pieceMatrix[0].length;

  const isValid = canPlacePiece(board, pieceMatrix, anchorRow, anchorCol);
  const cells = [];

  for (let r = 0; r < pieceRows; r++) {
    for (let c = 0; c < pieceCols; c++) {
      if (pieceMatrix[r][c] === 1) {
        const targetR = anchorRow + r;
        const targetC = anchorCol + c;
        const inBounds = targetR >= 0 && targetR < boardRows && targetC >= 0 && targetC < boardCols;
        const collision = inBounds && board[targetR][targetC] !== null && board[targetR][targetC] !== 0;

        cells.push({
          r: targetR,
          c: targetC,
          inBounds,
          isValid: inBounds && !collision,
        });
      }
    }
  }

  return { isValid, cells };
}

/**
 * Places a piece on the board, returning a new immutable board matrix.
 *
 * @param {Array<Array<any>>} board
 * @param {number[][]} pieceMatrix
 * @param {number} anchorRow
 * @param {number} anchorCol
 * @param {{ color: string, accent?: string, type?: string }} cellData
 * @returns {Array<Array<any>>}
 */
export function placePiece(board, pieceMatrix, anchorRow, anchorCol, cellData) {
  if (!canPlacePiece(board, pieceMatrix, anchorRow, anchorCol)) {
    throw new Error(`Invalid placement attempt at (${anchorRow}, ${anchorCol})`);
  }

  const newBoard = board.map((row) => [...row]);
  const pieceRows = pieceMatrix.length;
  const pieceCols = pieceMatrix[0].length;

  for (let r = 0; r < pieceRows; r++) {
    for (let c = 0; c < pieceCols; c++) {
      if (pieceMatrix[r][c] === 1) {
        newBoard[anchorRow + r][anchorCol + c] = {
          color: cellData.color,
          accent: cellData.accent || cellData.color,
          type: cellData.type || 'POLYOMINO',
        };
      }
    }
  }

  return newBoard;
}

/**
 * Finds all completed rows and completed columns simultaneously.
 *
 * @param {Array<Array<any>>} board
 * @returns {{
 *   rows: number[],
 *   cols: number[],
 *   totalLines: number,
 *   cellsToClear: Array<{ r: number, c: number }>
 * }}
 */
export function findFullLines(board) {
  const size = board.length;
  const fullRows = [];
  const fullCols = [];

  // Check rows
  for (let r = 0; r < size; r++) {
    let rowFull = true;
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null || board[r][c] === 0) {
        rowFull = false;
        break;
      }
    }
    if (rowFull) {
      fullRows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    let colFull = true;
    for (let r = 0; r < size; r++) {
      if (board[r][c] === null || board[r][c] === 0) {
        colFull = false;
        break;
      }
    }
    if (colFull) {
      fullCols.push(c);
    }
  }

  // Build unique set of cell coordinates to clear
  const cellsMap = new Map();
  fullRows.forEach((r) => {
    for (let c = 0; c < size; c++) {
      cellsMap.set(`${r},${c}`, { r, c });
    }
  });

  fullCols.forEach((c) => {
    for (let r = 0; r < size; r++) {
      cellsMap.set(`${r},${c}`, { r, c });
    }
  });

  return {
    rows: fullRows,
    cols: fullCols,
    totalLines: fullRows.length + fullCols.length,
    cellsToClear: Array.from(cellsMap.values()),
  };
}

/**
 * Clears the specified rows and columns from the board, returning a new board.
 *
 * @param {Array<Array<any>>} board
 * @param {number[]} rows
 * @param {number[]} cols
 * @returns {Array<Array<any>>}
 */
export function clearLines(board, rows = [], cols = []) {
  const rowSet = new Set(rows);
  const colSet = new Set(cols);

  return board.map((rowArr, r) =>
    rowArr.map((cell, c) => {
      if (rowSet.has(r) || colSet.has(c)) {
        return null;
      }
      return cell;
    })
  );
}

/**
 * Evaluates whether ANY remaining piece in the tray can be legally placed anywhere on the board.
 * If zero remaining pieces can fit, returns false (meaning Game Over).
 *
 * @param {Array<Array<any>>} board
 * @param {Array<{ matrix: number[][] }>} trayPieces
 * @returns {boolean} True if at least one valid move exists; false if game over
 */
export function hasAnyLegalMove(board, trayPieces) {
  if (!trayPieces || trayPieces.length === 0) {
    return true; // No pieces remaining in current tray; will deal new pieces
  }

  const size = board.length;

  for (const piece of trayPieces) {
    if (!piece || !piece.matrix) continue;
    const pieceMatrix = piece.matrix;
    const pRows = pieceMatrix.length;
    const pCols = pieceMatrix[0].length;

    // We only need to check anchor coordinates that fit within the grid
    const maxAnchorR = size - pRows;
    const maxAnchorC = size - pCols;

    for (let r = 0; r <= maxAnchorR; r++) {
      for (let c = 0; c <= maxAnchorC; c++) {
        if (canPlacePiece(board, pieceMatrix, r, c)) {
          return true; // Found at least one legal move!
        }
      }
    }
  }

  return false;
}
