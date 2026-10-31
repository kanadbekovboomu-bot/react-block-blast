import React from 'react';

export default function PieceTray({
  pieces = [],
  selectedPiece = null,
  onSelectPiece,
}) {
  return (
    <div className="w-full max-w-xl mx-auto mt-4 px-2">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {pieces.map((piece, index) => {
          if (!piece) {
            // Already placed piece placeholder slot
            return (
              <div
                key={`empty-slot-${index}`}
                className="h-28 sm:h-32 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800/60 flex items-center justify-center opacity-40 pointer-events-none"
              >
                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              </div>
            );
          }

          const isSelected = selectedPiece?.id === piece.id;
          const rows = piece.matrix.length;
          const cols = piece.matrix[0].length;

          return (
            <div
              key={piece.id}
              onClick={() => onSelectPiece(isSelected ? null : piece)}
              draggable
              onDragStart={(e) => {
                onSelectPiece(piece);
                e.dataTransfer.setData('text/plain', piece.id);
              }}
              className={`h-28 sm:h-32 rounded-2xl p-2 flex items-center justify-center cursor-pointer transition-all duration-200 select-none group relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-2 border-indigo-400 shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 active:scale-95'
              }`}
            >
              {/* Subtle slot indicator */}
              <div className="absolute top-1.5 left-2 text-[9px] font-mono text-slate-500 uppercase">
                {piece.type.replace(/_/g, ' ')}
              </div>

              {/* Render mini polyomino grid */}
              <div
                className="grid gap-1 items-center justify-center p-1"
                style={{
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {piece.matrix.map((rowArr, r) =>
                  rowArr.map((val, c) => (
                    <div
                      key={`mini-${r}-${c}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] transition-all"
                      style={
                        val === 1
                          ? {
                              backgroundColor: piece.color,
                              backgroundImage: `linear-gradient(135deg, ${piece.accent || piece.color} 0%, ${piece.color} 100%)`,
                              boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)`,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }
                          : { visibility: 'hidden' }
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-2 text-[11px] text-slate-500">
        Click or drag a piece to place it on the board
      </div>
    </div>
  );
}
