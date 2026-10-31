/**
 * Scoring and combo calculation formulas according to the Block Blast specification.
 */

/**
 * Calculates score earned for a move, updated combo count, and message banner.
 *
 * @param {number} tileCount Number of tiles in the placed polyomino
 * @param {number} linesCleared Number of lines (rows + columns) cleared in this move
 * @param {number} previousCombo Previous consecutive clear combo streak
 * @returns {{
 *   tileScore: number,
 *   lineScore: number,
 *   totalPoints: number,
 *   newCombo: number,
 *   comboBonusApplied: boolean,
 *   multiLineBonus: number,
 *   message: string | null
 * }}
 */
export function calculateMoveScore(tileCount, linesCleared, previousCombo = 0) {
  const tileScore = Math.max(0, tileCount);

  if (linesCleared <= 0) {
    return {
      tileScore,
      lineScore: 0,
      totalPoints: tileScore,
      newCombo: 0,
      comboBonusApplied: false,
      multiLineBonus: 0,
      message: null,
    };
  }

  const newCombo = previousCombo + 1;
  const baseLinePoints = linesCleared * 10;
  const comboMultiplier = 1 + newCombo * 0.5;
  const multiLineBonus = linesCleared >= 2 ? linesCleared * 15 : 0;

  const rawLineScore = Math.round(baseLinePoints * comboMultiplier + multiLineBonus);
  const totalPoints = tileScore + rawLineScore;

  let message = `+${totalPoints}`;
  if (linesCleared >= 4) {
    message = `MEGA BLAST! +${totalPoints} (COMBO x${newCombo})`;
  } else if (linesCleared >= 2 && newCombo > 1) {
    message = `DOUBLE COMBO x${newCombo}! +${totalPoints}`;
  } else if (newCombo > 1) {
    message = `COMBO x${newCombo}! +${totalPoints}`;
  } else if (linesCleared >= 2) {
    message = `${linesCleared} LINES! +${totalPoints}`;
  }

  return {
    tileScore,
    lineScore: rawLineScore,
    totalPoints,
    newCombo,
    comboBonusApplied: newCombo > 1,
    multiLineBonus,
    message,
  };
}
