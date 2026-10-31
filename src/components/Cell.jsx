import React from 'react';

export default function Cell({
  row,
  col,
  cellData,
  isClearing,
  ghostStatus, // 'valid' | 'invalid' | null
  onClick,
  onMouseEnter,
}) {
  const isFilled = Boolean(cellData);

  // Background and border styles based on cell state
  let cellStyle = {};
  let classNames =
    'relative w-full aspect-square rounded-[6px] transition-all duration-150 flex items-center justify-center cursor-pointer select-none';

  if (isClearing) {
    classNames += ' animate-line-flash z-20';
    cellStyle = {
      backgroundColor: '#ffffff',
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(56, 189, 248, 0.6)',
    };
  } else if (ghostStatus === 'valid') {
    classNames += ' bg-emerald-500/30 border-2 border-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.4)] z-10';
  } else if (ghostStatus === 'invalid') {
    classNames += ' bg-rose-500/25 border-2 border-rose-500/70 z-10';
  } else if (isFilled) {
    classNames += ' shadow-sm active:scale-95';
    cellStyle = {
      backgroundColor: cellData.color,
      backgroundImage: `linear-gradient(135deg, ${cellData.accent || cellData.color} 0%, ${cellData.color} 100%)`,
      boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)`,
      border: `1px solid rgba(255, 255, 255, 0.15)`,
    };
  } else {
    classNames +=
      ' bg-slate-900/90 border border-slate-800/70 hover:border-slate-700/80 hover:bg-slate-800/40';
  }

  return (
    <div
      data-row={row}
      data-col={col}
      onClick={() => onClick(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      className={classNames}
      style={cellStyle}
    >
      {/* Subtle inner jewel sheen for filled cells */}
      {isFilled && !isClearing && (
        <div className="absolute inset-0 rounded-[5px] pointer-events-none opacity-40 bg-gradient-to-t from-transparent via-transparent to-white/30" />
      )}
    </div>
  );
}
