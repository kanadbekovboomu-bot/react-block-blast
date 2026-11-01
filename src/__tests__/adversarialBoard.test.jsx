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
import { SHAPE_DEFINITIONS, getTileCount } from '../utils/polyominos';

describe('Adversarial Stress Tests - Block Blast Board Logic', () => {
  describe('Adversarial Boundary Validation', () => {
    it('tests all 18 polyominos at extreme boundary limits (0,0) and (7,7)', () => {
      const board = createEmptyBoard();

      SHAPE_DEFINITIONS.forEach((shape) => {
        const pRows = shape.matrix.length;
        const pCols = shape.matrix[0].length;

        // Top-Left (0, 0) should always fit on empty board
        expect(canPlacePiece(board, shape.matrix, 0, 0)).toBe(true);

        // Maximum valid anchor
        const maxR = BOARD_SIZE - pRows;
        const maxC = BOARD_SIZE - pCols;
        expect(canPlacePiece(board, shape.matrix, maxR, maxC)).toBe(true);

        // 1 step beyond right boundary must fail
        expect(canPlacePiece(board, shape.matrix, 0, maxC + 1)).toBe(false);

        // 1 step beyond bottom boundary must fail
        expect(canPlacePiece(board, shape.matrix, maxR + 1, 0)).toBe(false);

        // Negative coordinates must fail
        expect(canPlacePiece(board, shape.matrix, -1, 0)).toBe(false);
        expect(canPlacePiece(board, shape.matrix, 0, -1)).toBe(false);
        expect(canPlacePiece(board, shape.matrix, -10, -10)).toBe(false);
      });
    });

    it('rejects oversized piece matrices larger than 8x8 board', () => {
      const board = createEmptyBoard();
      const hugePiece = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 1));
      expect(canPlacePiece(board, hugePiece, 0, 0)).toBe(false);
    });

    it('handles ghost coordinates at boundary overflows accurately', () => {
      const board = createEmptyBoard();
      const line1x3 = [[1, 1, 1]];
      // Anchor at (0, 7) means cells (0,7), (0,8), (0,9)
      const ghost = getGhostCoordinates(board, line1x3, 0, 7);
      expect(ghost.isValid).toBe(false);
      expect(ghost.cells).toHaveLength(3);
      expect(ghost.cells[0].inBounds).toBe(true);
      expect(ghost.cells[1].inBounds).toBe(false);
      expect(ghost.cells[2].inBounds).toBe(false);
    });
  });

  describe('Adversarial Collision & Interlocking Shape Tests', () => {
    it('accurately nests concave shapes into inverse occupied spaces', () => {
      const board = createEmptyBoard();
      // Occupy only (0, 1)
      board[0][1] = { color: '#ff0000', type: 'BLOCK' };

      // CORNER_L_2X2_BL matrix:
      // [[1, 0],
      //  [1, 1]]
      // Anchor (0, 0) needs (0,0), (1,0), (1,1). (0,1) is empty in the piece!
      const cornerBL = [
        [1, 0],
        [1, 1],
      ];
      expect(canPlacePiece(board, cornerBL, 0, 0)).toBe(true);

      // But a 2x2 square occupying (0,1) MUST collide
      const square2x2 = [
        [1, 1],
        [1, 1],
      ];
      expect(canPlacePiece(board, square2x2, 0, 0)).toBe(false);
    });

    it('treats 0 and null identically as empty cells', () => {
      const board = createEmptyBoard();
      board[0][0] = 0;
      board[0][1] = null;

      const line1x2 = [[1, 1]];
      expect(canPlacePiece(board, line1x2, 0, 0)).toBe(true);
    });

    it('throws when placePiece is called on an illegal cell', () => {
      const board = createEmptyBoard();
      board[3][3] = { color: '#333' };
      const dot = [[1]];
      expect(() => placePiece(board, dot, 3, 3, { color: '#fff' })).toThrow(/Invalid placement/);
      expect(() => placePiece(board, dot, 8, 8, { color: '#fff' })).toThrow(/Invalid placement/);
    });
  });

  describe('Simultaneous Multi-Line Clears & Board Wipes', () => {
    it('correctly handles full board wipe: 8 rows AND 8 columns simultaneously (64 cells)', () => {
      const fullBoard = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          fullBoard[r][c] = { color: '#38bdf8' };
        }
      }

      const { rows, cols, totalLines, cellsToClear } = findFullLines(fullBoard);
      expect(rows).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(cols).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(totalLines).toBe(16);
      expect(cellsToClear).toHaveLength(64); // All 64 unique cells

      // Execute board wipe clear
      const cleared = clearLines(fullBoard, rows, cols);
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          expect(cleared[r][c]).toBeNull();
        }
      }
    });

    it('handles intersecting multi-line clear (3 rows and 2 columns = 5 lines)', () => {
      const board = createEmptyBoard();
      const targetRows = [1, 3, 5];
      const targetCols = [2, 6];

      // Fill the rows
      targetRows.forEach((r) => {
        for (let c = 0; c < BOARD_SIZE; c++) board[r][c] = { color: '#f59e0b' };
      });
      // Fill the columns
      targetCols.forEach((c) => {
        for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = { color: '#10b981' };
      });

      // Place an unrelated bystander cell at (0, 0)
      board[0][0] = { color: '#ffffff' };

      const { rows, cols, totalLines, cellsToClear } = findFullLines(board);
      expect(rows).toEqual(targetRows);
      expect(cols).toEqual(targetCols);
      expect(totalLines).toBe(5);

      // Formula: 3*8 + 2*8 - 3*2 = 24 + 16 - 6 = 34 unique cells
      expect(cellsToClear).toHaveLength(34);

      // Verify clearance preserves untouched cells
      const cleared = clearLines(board, rows, cols);
      expect(cleared[0][0]).toEqual({ color: '#ffffff' }); // Bystander preserved
      expect(cleared[1][2]).toBeNull(); // Intersection cleared
      expect(cleared[3][0]).toBeNull(); // Cleared row cell
      expect(cleared[0][2]).toBeNull(); // Cleared col cell
    });

    it('returns empty lines when zero rows or columns are full', () => {
      const board = createEmptyBoard();
      // Fill partial row (7 out of 8 cells)
      for (let c = 0; c < 7; c++) board[2][c] = { color: '#fff' };

      const { rows, cols, totalLines, cellsToClear } = findFullLines(board);
      expect(rows).toEqual([]);
      expect(cols).toEqual([]);
      expect(totalLines).toBe(0);
      expect(cellsToClear).toEqual([]);
    });
  });

  describe('Combo Multipliers & Scoring Edge Cases', () => {
    it('resets combo streak to 0 when move clears 0 lines', () => {
      const res = calculateMoveScore(5, 0, 10);
      expect(res.newCombo).toBe(0);
      expect(res.comboBonusApplied).toBe(false);
      expect(res.lineScore).toBe(0);
      expect(res.totalPoints).toBe(5);
    });

    it('handles negative or 0 tile counts gracefully', () => {
      const res1 = calculateMoveScore(0, 0, 0);
      expect(res1.totalPoints).toBe(0);

      const res2 = calculateMoveScore(-5, 0, 0);
      expect(res2.totalPoints).toBe(0);
    });

    it('calculates score correctly for huge combo streaks without overflow or NaN', () => {
      // 50th consecutive combo streak!
      const res = calculateMoveScore(4, 2, 49);
      // newCombo: 50
      // baseLine: 2 * 10 = 20
      // comboMultiplier: 1 + 50 * 0.5 = 26
      // multiLineBonus: 2 * 15 = 30
      // lineScore: Math.round(20 * 26 + 30) = 520 + 30 = 550
      // totalPoints: 4 + 550 = 554
      expect(res.newCombo).toBe(50);
      expect(res.lineScore).toBe(550);
      expect(res.totalPoints).toBe(554);
      expect(Number.isFinite(res.totalPoints)).toBe(true);
      expect(res.message).toContain('DOUBLE COMBO x50!');
    });

    it('generates MEGA BLAST message for 4 or more lines cleared', () => {
      const res = calculateMoveScore(5, 4, 1);
      expect(res.message).toContain('MEGA BLAST');
      expect(res.newCombo).toBe(2);
    });
  });

  describe('Exhaustive Game-Over Detection Stress Harness', () => {
    it('handles completely full board: hasAnyLegalMove is false for any piece', () => {
      const fullBoard = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          fullBoard[r][c] = { color: '#fff' };
        }
      }

      SHAPE_DEFINITIONS.forEach((shape) => {
        expect(hasAnyLegalMove(fullBoard, [{ matrix: shape.matrix }])).toBe(false);
      });
    });

    it('handles checkerboard board: detects 1x1 dot fits, but NO domino or larger shape fits', () => {
      const checkerboard = createEmptyBoard();
      // Occupy cells where (r + c) % 2 === 0
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if ((r + c) % 2 === 0) {
            checkerboard[r][c] = { color: '#fff' };
          }
        }
      }

      // 1x1 dot MUST fit because (r + c) % 2 !== 0 are all empty
      const dotPiece = { matrix: [[1]] };
      expect(hasAnyLegalMove(checkerboard, [dotPiece])).toBe(true);

      // 1x2 horizontal line CANNOT fit anywhere on a checkerboard
      const line1x2 = { matrix: [[1, 1]] };
      expect(hasAnyLegalMove(checkerboard, [line1x2])).toBe(false);

      // 2x1 vertical line CANNOT fit anywhere
      const line2x1 = { matrix: [[1], [1]] };
      expect(hasAnyLegalMove(checkerboard, [line2x1])).toBe(false);

      // 2x2 square CANNOT fit
      const square2x2 = {
        matrix: [
          [1, 1],
          [1, 1],
        ],
      };
      expect(hasAnyLegalMove(checkerboard, [square2x2])).toBe(false);
    });

    it('handles single open cell on board: only 1x1 dot can fit', () => {
      const almostFullBoard = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          almostFullBoard[r][c] = { color: '#fff' };
        }
      }
      // Leave only (4, 4) empty
      almostFullBoard[4][4] = null;

      const dotPiece = { matrix: [[1]] };
      expect(hasAnyLegalMove(almostFullBoard, [dotPiece])).toBe(true);

      const allLargerShapes = SHAPE_DEFINITIONS.filter((s) => s.type !== 'DOT_1X1');
      allLargerShapes.forEach((shape) => {
        expect(hasAnyLegalMove(almostFullBoard, [{ matrix: shape.matrix }])).toBe(false);
      });
    });

    it('handles tray with malformed or null elements gracefully without throwing', () => {
      const board = createEmptyBoard();
      expect(hasAnyLegalMove(board, null)).toBe(true);
      expect(hasAnyLegalMove(board, [])).toBe(true);
      expect(hasAnyLegalMove(board, [null, undefined, {}])).toBe(false);
      expect(hasAnyLegalMove(board, [null, { matrix: [[1]] }])).toBe(true);
    });
  });
});
