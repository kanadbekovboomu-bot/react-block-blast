import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ScoreBoard from './components/ScoreBoard';
import Board from './components/Board';
import PieceTray from './components/PieceTray';
import GameOverModal from './components/GameOverModal';
import LeaderboardModal from './components/LeaderboardModal';
import AuthModal from './components/AuthModal';
import HelpModal from './components/HelpModal';

import {
  createEmptyBoard,
  canPlacePiece,
  placePiece,
  findFullLines,
  clearLines,
  hasAnyLegalMove,
} from './utils/boardLogic';
import { generatePieceTray } from './utils/polyominos';
import { calculateMoveScore } from './utils/comboCalculator';
import {
  getStoredHighScore,
  saveScore,
  subscribeToAuth,
  signOut as authSignOut,
} from './services/storageAdapter';

export default function App() {
  // Game state
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [tray, setTray] = useState(() => generatePieceTray());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getStoredHighScore());
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [piecesPlaced, setPiecesPlaced] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);

  // Interaction state
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [hoverCoords, setHoverCoords] = useState(null);
  const [clearingCells, setClearingCells] = useState([]);
  const [popups, setPopups] = useState([]);

  // Auth & modals state
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isClearingRef = useRef(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((activeUser) => {
      setUser(activeUser);
    });
    return () => unsubscribe();
  }, []);

  // Popup cleaner timer
  const addPopup = useCallback((text, x = 50, y = 50) => {
    const id = `popup_${Date.now()}_${Math.random()}`;
    setPopups((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  }, []);

  // Restarts the game loop
  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard());
    setTray(generatePieceTray());
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLinesCleared(0);
    setPiecesPlaced(0);
    setIsGameOver(false);
    setIsNewHigh(false);
    setSelectedPiece(null);
    setHoverCoords(null);
    setClearingCells([]);
    setPopups([]);
    isClearingRef.current = false;
  }, []);

  // Main piece placement handler
  const handlePlacePieceAt = useCallback(
    (row, col) => {
      if (!selectedPiece || isGameOver || isClearingRef.current) return;

      const pieceMatrix = selectedPiece.matrix;
      if (!canPlacePiece(board, pieceMatrix, row, col)) {
        return;
      }

      // Step 1: Place piece on board
      const placedBoard = placePiece(board, pieceMatrix, row, col, selectedPiece);
      const pieceTiles = selectedPiece.tileCount;

      // Step 2: Remove placed piece from current tray
      const pieceId = selectedPiece.id;
      const updatedTray = tray.map((p) => (p && p.id === pieceId ? null : p));

      // Step 3: Check full rows & columns
      const linesInfo = findFullLines(placedBoard);
      const scoreResult = calculateMoveScore(pieceTiles, linesInfo.totalLines, combo);

      const nextScore = score + scoreResult.totalPoints;
      const nextCombo = scoreResult.newCombo;
      const nextMaxCombo = Math.max(maxCombo, nextCombo);
      const nextLines = linesCleared + linesInfo.totalLines;
      const nextPiecesPlaced = piecesPlaced + 1;

      // Update basic metrics
      setScore(nextScore);
      setCombo(nextCombo);
      setMaxCombo(nextMaxCombo);
      setLinesCleared(nextLines);
      setPiecesPlaced(nextPiecesPlaced);

      // Check high score
      if (nextScore > highScore) {
        setHighScore(nextScore);
        setIsNewHigh(true);
      }

      // Deselect placed piece immediately
      setSelectedPiece(null);
      setHoverCoords(null);

      // Function to finalize round & check game over
      const finalizeStep = (finalBoard, currentTray) => {
        let activeTray = currentTray;
        // If all 3 pieces used, deal 3 new pieces
        const remainingPieces = activeTray.filter(Boolean);
        if (remainingPieces.length === 0) {
          activeTray = generatePieceTray();
          setTray(activeTray);
        } else {
          setTray(activeTray);
        }

        // Exhaustive Game Over validation
        const piecesToCheck = remainingPieces.length === 0 ? activeTray : remainingPieces;
        const canContinue = hasAnyLegalMove(finalBoard, piecesToCheck);

        if (!canContinue) {
          setIsGameOver(true);
          // Persist score
          saveScore({
            userId: user ? user.uid : 'guest',
            userDisplayName: user ? user.displayName : 'Guest User',
            score: nextScore,
            maxCombo: nextMaxCombo,
            linesCleared: nextLines,
            piecesPlaced: nextPiecesPlaced,
          });
        }
      };

      // Step 4: Handle line clearing animation or instant commit
      if (linesInfo.totalLines > 0) {
        isClearingRef.current = true;
        setClearingCells(linesInfo.cellsToClear);
        setBoard(placedBoard);

        if (scoreResult.message) {
          addPopup(scoreResult.message, 50, 40);
        }

        // Dissolve delay
        setTimeout(() => {
          const clearedBoard = clearLines(placedBoard, linesInfo.rows, linesInfo.cols);
          setBoard(clearedBoard);
          setClearingCells([]);
          isClearingRef.current = false;

          finalizeStep(clearedBoard, updatedTray);
        }, 260);
      } else {
        setBoard(placedBoard);
        finalizeStep(placedBoard, updatedTray);
      }
    },
    [
      selectedPiece,
      isGameOver,
      board,
      tray,
      score,
      highScore,
      combo,
      maxCombo,
      linesCleared,
      piecesPlaced,
      user,
      addPopup,
    ]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-4 px-2 sm:px-4">
      {/* Top Header */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={() => authSignOut()}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        highScore={highScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-xl mx-auto">
        {/* Score Board */}
        <ScoreBoard
          score={score}
          highScore={highScore}
          combo={combo}
          maxCombo={maxCombo}
          linesCleared={linesCleared}
          piecesPlaced={piecesPlaced}
          onRestart={handleRestart}
        />

        {/* 8x8 Game Board */}
        <Board
          board={board}
          clearingCells={clearingCells}
          selectedPiece={selectedPiece}
          hoverCoords={hoverCoords}
          onCellClick={(r, c) => handlePlacePieceAt(r, c)}
          onCellHover={(r, c) => setHoverCoords({ r, c })}
          onMouseLeave={() => setHoverCoords(null)}
          popups={popups}
        />

        {/* Piece Tray */}
        <PieceTray
          pieces={tray}
          selectedPiece={selectedPiece}
          onSelectPiece={(piece) => {
            setSelectedPiece(piece);
            if (!piece) setHoverCoords(null);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-600 py-2">
        Minimalist Block Blast &bull; Portfolio Edition &bull; React + Firebase
      </footer>

      {/* Modals */}
      <GameOverModal
        isOpen={isGameOver}
        score={score}
        highScore={highScore}
        isNewHigh={isNewHigh}
        maxCombo={maxCombo}
        linesCleared={linesCleared}
        piecesPlaced={piecesPlaced}
        onRestart={handleRestart}
        onOpenLeaderboard={() => {
          setIsGameOver(false);
          setIsLeaderboardOpen(true);
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
