import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  canPlacePiece,
  placePiece,
  findFullLines,
  clearLines,
  hasAnyLegalMove,
  getGhostCoordinates,
  BOARD_SIZE,
} from '../utils/boardLogic';
import { calculateMoveScore } from '../utils/comboCalculator';
import { SHAPE_DEFINITIONS, getTileCount, generatePieceTray } from '../utils/polyominos';

describe('Board Logic - Initialization', () => {
  it('creates an empty 8x8 board matrix filled with null', () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_SIZE);
    expect(board[0]).toHaveLength(BOARD_SIZE);

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        expect(board[r][c]).toBeNull();
      }
    }
  });
});

describe('Board Logic - Boundary Validation', () => {
  const line1x3 = [[1, 1, 1]];
  const line3x1 = [[1], [1], [1]];
  const square2x2 = [
    [1, 1],
    [1, 1],
  ];

  it('allows placement within standard board boundaries', () => {
    const board = createEmptyBoard();
    expect(canPlacePiece(board, line1x3, 0, 0)).toBe(true);
    expect(canPlacePiece(board, line1x3, 7, 5)).toBe(true);
    expect(canPlacePiece(board, square2x2, 6, 6)).toBe(true);
  });

  it('rejects placement that overflows right boundary', () => {
    const board = createEmptyBoard();
    // 1x3 piece at col 6 needs cols 6, 7, 8 (col 8 is out of bounds)
    expect(canPlacePiece(board, line1x3, 0, 6)).toBe(false);
  });

  it('rejects placement that overflows bottom boundary', () => {
    const board = createEmptyBoard();
    // 3x1 piece at row 6 needs rows 6, 7, 8 (row 8 is out of bounds)
    expect(canPlacePiece(board, line3x1, 6, 0)).toBe(false);
  });

  it('rejects placement with negative anchor coordinates', () => {
    const board = createEmptyBoard();
    expect(canPlacePiece(board, line1x3, -1, 0)).toBe(false);
    expect(canPlacePiece(board, line1x3, 0, -1)).toBe(false);
  });

  it('accurately tests 1x5 line at boundary limits', () => {
    const board = createEmptyBoard();
    const line1x5 = [[1, 1, 1, 1, 1]];
    // col 3 + 5 = 8 (valid cols 3,4,5,6,7)
    expect(canPlacePiece(board, line1x5, 0, 3)).toBe(true);
    // col 4 + 5 = 9 (invalid)
    expect(canPlacePiece(board, line1x5, 0, 4)).toBe(false);
  });
});

describe('Board Logic - Collision Detection', () => {
  it('detects collision when placing on an occupied cell', () => {
    const board = createEmptyBoard();
    board[2][2] = { color: '#06b6d4', accent: '#22d3ee', type: 'DOT' };

    const dot = [[1]];
    expect(canPlacePiece(board, dot, 2, 2)).toBe(false);
    expect(canPlacePiece(board, dot, 2, 3)).toBe(true);
  });

  it('handles non-rectangular shapes correctly without false collisions', () => {
    const board = createEmptyBoard();
    // Occupy cell (0, 1)
    board[0][1] = { color: '#f59e0b', type: 'BLOCK' };

    // Corner L where (0, 1) is 0:
    // [[1, 0],
    //  [1, 1]]
    const cornerL = [
      [1, 0],
      [1, 1],
    ];

    // Placing at (0, 0) occupies (0,0), (1,0), (1,1). Cell (0,1) is empty in the piece!
    expect(canPlacePiece(board, cornerL, 0, 0)).toBe(true);

    // But if (0, 0) is occupied, it should collide
    board[0][0] = { color: '#f59e0b', type: 'BLOCK' };
    expect(canPlacePiece(board, cornerL, 0, 0)).toBe(false);
  });
});

describe('Board Logic - Placement Execution & Ghost Coordinates', () => {
  it('places piece immutably on the board', () => {
    const board = createEmptyBoard();
    const square2x2 = [
      [1, 1],
      [1, 1],
    ];
    const cellData = { color: '#6366f1', accent: '#818cf8', type: 'SQUARE_2X2' };

    const newBoard = placePiece(board, square2x2, 2, 3, cellData);

    // Original board remains empty
    expect(board[2][3]).toBeNull();

    // New board has tiles placed
    expect(newBoard[2][3]).toMatchObject(cellData);
    expect(newBoard[2][4]).toMatchObject(cellData);
    expect(newBoard[3][3]).toMatchObject(cellData);
    expect(newBoard[3][4]).toMatchObject(cellData);
    expect(newBoard[0][0]).toBeNull();
  });

  it('throws an error if attempting invalid placement via placePiece', () => {
    const board = createEmptyBoard();
    const square2x2 = [
      [1, 1],
      [1, 1],
    ];
    expect(() => placePiece(board, square2x2, 7, 7, { color: '#f00' })).toThrow();
  });

  it('generates ghost preview coordinates', () => {
    const board = createEmptyBoard();
    const line1x2 = [[1, 1]];
    const preview = getGhostCoordinates(board, line1x2, 0, 6);

    expect(preview.isValid).toBe(true);
    expect(preview.cells).toHaveLength(2);
    expect(preview.cells[0]).toEqual({ r: 0, c: 6, inBounds: true, isValid: true });
    expect(preview.cells[1]).toEqual({ r: 0, c: 7, inBounds: true, isValid: true });
  });
});

describe('Board Logic - Simultaneous Line Clears', () => {
  it('detects a full horizontal row', () => {
    const board = createEmptyBoard();
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[3][c] = { color: '#38bdf8' };
    }

    const { rows, cols, totalLines, cellsToClear } = findFullLines(board);
    expect(rows).toEqual([3]);
    expect(cols).toEqual([]);
    expect(totalLines).toBe(1);
    expect(cellsToClear).toHaveLength(8);
  });

  it('detects a full vertical column', () => {
    const board = createEmptyBoard();
    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r][5] = { color: '#38bdf8' };
    }

    const { rows, cols, totalLines, cellsToClear } = findFullLines(board);
    expect(rows).toEqual([]);
    expect(cols).toEqual([5]);
    expect(totalLines).toBe(1);
    expect(cellsToClear).toHaveLength(8);
  });

  it('detects simultaneous row AND column clears (cross clear) without double counting intersection', () => {
    const board = createEmptyBoard();
    // Fill row 2
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[2][c] = { color: '#38bdf8' };
    }
    // Fill col 4
    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r][4] = { color: '#10b981' };
    }

    const { rows, cols, totalLines, cellsToClear } = findFullLines(board);
    expect(rows).toEqual([2]);
    expect(cols).toEqual([4]);
    expect(totalLines).toBe(2);

    // 8 in row + 8 in col - 1 intersection at (2, 4) = 15 unique cells
    expect(cellsToClear).toHaveLength(15);

    // Clear lines
    const cleared = clearLines(board, rows, cols);
    expect(cleared[2][4]).toBeNull();
    for (let c = 0; c < BOARD_SIZE; c++) {
      expect(cleared[2][c]).toBeNull();
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
      expect(cleared[r][4]).toBeNull();
    }
  });

  it('retains non-cleared cells when clearing lines', () => {
    const board = createEmptyBoard();
    // Fill row 1
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[1][c] = { color: '#f59e0b' };
    }
    // Place solitary cell at (5, 5)
    board[5][5] = { color: '#ec4899' };

    const cleared = clearLines(board, [1], []);
    expect(cleared[1][0]).toBeNull();
    expect(cleared[5][5]).toMatchObject({ color: '#ec4899' });
  });
});

describe('Scoring & Combo Calculations', () => {
  it('calculates score for tile placement with 0 lines cleared', () => {
    const result = calculateMoveScore(4, 0, 2);
    expect(result.tileScore).toBe(4);
    expect(result.lineScore).toBe(0);
    expect(result.totalPoints).toBe(4);
    expect(result.newCombo).toBe(0); // Resets combo streak!
    expect(result.comboBonusApplied).toBe(false);
  });

  it('calculates score for 1 line clear on first clear (combo = 1)', () => {
    const result = calculateMoveScore(3, 1, 0);
    // tileScore: 3
    // base: 1 * 10 = 10
    // combo multiplier: 1 + 1 * 0.5 = 1.5
    // lineScore = Math.round(10 * 1.5) = 15
    // total = 3 + 15 = 18
    expect(result.tileScore).toBe(3);
    expect(result.lineScore).toBe(15);
    expect(result.totalPoints).toBe(18);
    expect(result.newCombo).toBe(1);
  });

  it('applies combo streak multiplier on consecutive line clears', () => {
    // previous combo was 2, now clearing 1 line -> combo = 3
    const result = calculateMoveScore(2, 1, 2);
    // multiplier: 1 + 3 * 0.5 = 2.5
    // lineScore: 10 * 2.5 = 25
    // total = 2 + 25 = 27
    expect(result.newCombo).toBe(3);
    expect(result.lineScore).toBe(25);
    expect(result.totalPoints).toBe(27);
    expect(result.comboBonusApplied).toBe(true);
  });

  it('applies multi-line bonus when clearing 2 or more lines simultaneously', () => {
    const result = calculateMoveScore(4, 2, 0);
    // lines: 2
    // newCombo: 1
    // base: 2 * 10 = 20
    // multiplier: 1 + 1 * 0.5 = 1.5 -> 30
    // multiLineBonus: 2 * 15 = 30
    // lineScore = 30 + 30 = 60
    // total = 4 + 60 = 64
    expect(result.multiLineBonus).toBe(30);
    expect(result.lineScore).toBe(60);
    expect(result.totalPoints).toBe(64);
  });
});

describe('Game Over Detection Algorithm', () => {
  it('returns true when board is empty and pieces are available', () => {
    const board = createEmptyBoard();
    const pieces = [{ matrix: [[1, 1]] }, { matrix: [[1], [1]] }];
    expect(hasAnyLegalMove(board, pieces)).toBe(true);
  });

  it('returns false when board is completely filled', () => {
    const board = createEmptyBoard();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = { color: '#fff' };
      }
    }
    const pieces = [{ matrix: [[1]] }];
    expect(hasAnyLegalMove(board, pieces)).toBe(false);
  });

  it('returns true if at least ONE piece in tray has a valid spot', () => {
    const board = createEmptyBoard();
    // Fill almost the entire board except cell (0, 0)
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (r !== 0 || c !== 0) {
          board[r][c] = { color: '#fff' };
        }
      }
    }

    const largePiece = {
      matrix: [
        [1, 1],
        [1, 1],
      ],
    };
    const dotPiece = { matrix: [[1]] };

    // Tray with only large piece cannot fit -> false
    expect(hasAnyLegalMove(board, [largePiece])).toBe(false);

    // Tray with large piece AND dot piece can fit dot -> true
    expect(hasAnyLegalMove(board, [largePiece, dotPiece])).toBe(true);
  });

  it('returns true when tray is empty (ready for next round)', () => {
    const board = createEmptyBoard();
    expect(hasAnyLegalMove(board, [])).toBe(true);
  });
});

describe('Polyomino Utilities & Tray Generator', () => {
  it('has at least 18 shape definitions', () => {
    expect(SHAPE_DEFINITIONS.length).toBeGreaterThanOrEqual(18);
  });

  it('calculates tile counts accurately for different shapes', () => {
    const dot = [[1]];
    const line3 = [[1, 1, 1]];
    const square3 = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ];
    expect(getTileCount(dot)).toBe(1);
    expect(getTileCount(line3)).toBe(3);
    expect(getTileCount(square3)).toBe(9);
  });

  it('generates a 3-piece tray with valid structures', () => {
    const tray = generatePieceTray();
    expect(tray).toHaveLength(3);
    tray.forEach((piece) => {
      expect(piece.id).toBeDefined();
      expect(piece.matrix).toBeDefined();
      expect(piece.matrix.length).toBeGreaterThan(0);
      expect(piece.color).toBeDefined();
      expect(piece.tileCount).toBeGreaterThan(0);
    });
  });
});
