/**
 * Polyomino definitions, generators, and shape helpers for Block Blast.
 */

export const SHAPE_DEFINITIONS = [
  // 1x1 Dot
  {
    type: 'DOT_1X1',
    matrix: [[1]],
    color: '#06b6d4', // Cyan
    accent: '#22d3ee',
  },
  // Lines (Horizontal and Vertical)
  {
    type: 'LINE_1X2',
    matrix: [[1, 1]],
    color: '#38bdf8', // Sky
    accent: '#7dd3fc',
  },
  {
    type: 'LINE_2X1',
    matrix: [[1], [1]],
    color: '#38bdf8',
    accent: '#7dd3fc',
  },
  {
    type: 'LINE_1X3',
    matrix: [[1, 1, 1]],
    color: '#6366f1', // Indigo
    accent: '#818cf8',
  },
  {
    type: 'LINE_3X1',
    matrix: [[1], [1], [1]],
    color: '#6366f1',
    accent: '#818cf8',
  },
  {
    type: 'LINE_1X4',
    matrix: [[1, 1, 1, 1]],
    color: '#8b5cf6', // Violet
    accent: '#a78bfa',
  },
  {
    type: 'LINE_4X1',
    matrix: [[1], [1], [1], [1]],
    color: '#8b5cf6',
    accent: '#a78bfa',
  },
  {
    type: 'LINE_1X5',
    matrix: [[1, 1, 1, 1, 1]],
    color: '#d946ef', // Fuchsia
    accent: '#e879f9',
  },
  {
    type: 'LINE_5X1',
    matrix: [[1], [1], [1], [1], [1]],
    color: '#d946ef',
    accent: '#e879f9',
  },
  // Squares
  {
    type: 'SQUARE_2X2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: '#f59e0b', // Amber
    accent: '#fbbf24',
  },
  {
    type: 'SQUARE_3X3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: '#f97316', // Orange
    accent: '#fb923c',
  },
  // 2x2 Corner L-shapes
  {
    type: 'CORNER_L_2X2_TL',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: '#10b981', // Emerald
    accent: '#34d399',
  },
  {
    type: 'CORNER_L_2X2_TR',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    color: '#10b981',
    accent: '#34d399',
  },
  {
    type: 'CORNER_L_2X2_BL',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: '#10b981',
    accent: '#34d399',
  },
  {
    type: 'CORNER_L_2X2_BR',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    color: '#10b981',
    accent: '#34d399',
  },
  // 3x3 Big L-shapes
  {
    type: 'BIG_L_3X3_BL',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#ec4899', // Pink
    accent: '#f472b6',
  },
  {
    type: 'BIG_L_3X3_BR',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#ec4899',
    accent: '#f472b6',
  },
  {
    type: 'BIG_L_3X3_TL',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: '#ec4899',
    accent: '#f472b6',
  },
  {
    type: 'BIG_L_3X3_TR',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    color: '#ec4899',
    accent: '#f472b6',
  },
  // T-shapes
  {
    type: 'T_SHAPE_DOWN',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: '#14b8a6', // Teal
    accent: '#2dd4bf',
  },
  {
    type: 'T_SHAPE_UP',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#14b8a6',
    accent: '#2dd4bf',
  },
  {
    type: 'T_SHAPE_RIGHT',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: '#14b8a6',
    accent: '#2dd4bf',
  },
  {
    type: 'T_SHAPE_LEFT',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: '#14b8a6',
    accent: '#2dd4bf',
  },
];

/**
 * Counts the active tiles in a polyomino matrix.
 * @param {number[][]} matrix
 * @returns {number}
 */
export function getTileCount(matrix) {
  let count = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) count++;
    }
  }
  return count;
}

/**
 * Generates a random set of 3 playable pieces.
 * Avoids generating multiple large 3x3 squares in the same round to ensure fair gameplay.
 * @returns {Array<{ id: string, type: string, matrix: number[][], color: string, accent: string, tileCount: number }>}
 */
export function generatePieceTray() {
  const pieces = [];
  let largeSquareCount = 0;

  for (let i = 0; i < 3; i++) {
    let available = SHAPE_DEFINITIONS;
    if (largeSquareCount >= 1) {
      available = SHAPE_DEFINITIONS.filter((s) => s.type !== 'SQUARE_3X3');
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];

    if (chosen.type === 'SQUARE_3X3') {
      largeSquareCount++;
    }

    pieces.push({
      id: `piece_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      type: chosen.type,
      matrix: chosen.matrix.map((row) => [...row]),
      color: chosen.color,
      accent: chosen.accent,
      tileCount: getTileCount(chosen.matrix),
    });
  }

  return pieces;
}
