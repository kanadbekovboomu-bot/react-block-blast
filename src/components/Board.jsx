import React, { useMemo } from 'react';
import Cell from './Cell';
import { getGhostCoordinates } from '../utils/boardLogic';

export default function Board({
  board,
  clearingCells = [],
  selectedPiece = null,
  hoverCoords = null,
  onCellClick,
  onCellHover,
  onMouseLeave,
  popups = [],
}) {
  // Convert clearing cells to a fast Set
  const clearingSet = useMemo(() => {
    const set = new Set();
    clearingCells.forEach((c) => set.add(`${c.r},${c.c}`));
    return set;
  }, [clearingCells]);

  // Compute ghost cells if a piece is selected and hovering
  const ghostMap = useMemo(() => {
    const map = new Map();
    if (!selectedPiece || !hoverCoords) return map;

    const { r: anchorRow, c: anchorCol } = hoverCoords;
    const { isValid, cells } = getGhostCoordinates(board, selectedPiece.matrix, anchorRow, anchorCol);

    cells.forEach((cell) => {
      if (cell.inBounds) {
        map.set(`${cell.r},${cell.c}`, isValid ? 'valid' : 'invalid');
      }
    });

    return map;
  }, [board, selectedPiece, hoverCoords]);

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto p-2.5 sm:p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-950/20">
      {/* 8x8 Grid */}
      <div
        className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5"
        onMouseLeave={onMouseLeave}
      >
        {board.map((rowArr, r) =>
          rowArr.map((cellData, c) => {
            const key = `${r}-${c}`;
            const isClearing = clearingSet.has(`${r},${c}`);
            const ghostStatus = ghostMap.get(`${r},${c}`) || null;

            return (
              <Cell
                key={key}
                row={r}
                col={c}
                cellData={cellData}
                isClearing={isClearing}
                ghostStatus={ghostStatus}
                onClick={onCellClick}
                onMouseEnter={onCellHover}
              />
            );
          })
        )}
      </div>

      {/* Floating Combo & Score Popups */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {popups.map((popup) => (
          <div
            key={popup.id}
            className="absolute z-30 font-bold font-mono text-sm sm:text-base tracking-wide px-3 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/80 text-amber-300 shadow-lg shadow-amber-500/20 animate-float-up"
            style={{
              left: `${popup.x || 50}%`,
              top: `${popup.y || 45}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {popup.text}
          </div>
        ))}
      </div>
    </div>
  );
}
