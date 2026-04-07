import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Pencil,
  Eraser,
  Trophy,
  Settings,
  ChevronDown,
  Lightbulb,
  Undo2,
  Trash2,
  XCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generatePuzzle, Grid, isBoardComplete } from '@/src/lib/sudoku';

type CellPos = { row: number; col: number } | null;
type NoteGrid = Set<number>[][];

const SudokuBoard: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Grid>([]);
  const [solution, setSolution] = useState<Grid>([]);
  const [currentGrid, setCurrentGrid] = useState<Grid>([]);
  const [notes, setNotes] = useState<NoteGrid>([]);
  const [selected, setSelected] = useState<CellPos>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [history, setHistory] = useState<{ grid: Grid; mistakes: number }[]>([]);

  // Initialize game
  const startNewGame = useCallback(() => {
    const { puzzle: p, solution: s } = generatePuzzle();
    setPuzzle(p);
    setSolution(s);
    setCurrentGrid(p.map(row => [...row]));
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())));
    setSelected(null);
    setIsComplete(false);
    setMistakes(0);
    setHistory([]);
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const saveHistory = () => {
    const snapshotGrid = currentGrid.map(row => [...row]);
    const snapshotMistakes = mistakes;
    
    setHistory(prev => [...prev, { 
      grid: snapshotGrid, 
      mistakes: snapshotMistakes
    }].slice(-20)); // Keep last 20 moves
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setCurrentGrid(last.grid);
    setMistakes(last.mistakes);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleInput = useCallback((num: number | null) => {
    if (!selected || isComplete || mistakes >= 3) return;
    const { row, col } = selected;
    if (puzzle[row][col] !== null) return; // Can't change initial clues

    // Only save history for grid moves, not notes
    if (!isNoteMode) {
      saveHistory();
    }

    if (num === null) {
      // Erase
      if (!isNoteMode) {
        const newGrid = [...currentGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = null;
        setCurrentGrid(newGrid);
      }
      
      const newNotes = [...notes];
      newNotes[row] = [...newNotes[row]];
      newNotes[row][col] = new Set();
      setNotes(newNotes);
      return;
    }

    if (isNoteMode) {
      const newNotes = [...notes];
      newNotes[row] = [...newNotes[row]];
      const cellNotes = new Set(newNotes[row][col]);
      if (cellNotes.has(num)) {
        cellNotes.delete(num);
      } else {
        cellNotes.add(num);
      }
      newNotes[row][col] = cellNotes;
      setNotes(newNotes);
    } else {
      const newGrid = [...currentGrid];
      newGrid[row] = [...newGrid[row]];
      const isErasing = newGrid[row][col] === num;
      // If same number, clear it
      newGrid[row][col] = isErasing ? null : num;
      setCurrentGrid(newGrid);

      // Clear notes for this cell when a number is placed
      const newNotes = [...notes];
      newNotes[row] = [...newNotes[row]];
      newNotes[row][col] = new Set();
      setNotes(newNotes);

      // Check if mistake
      if (!isErasing && num !== null && num !== solution[row][col]) {
        setMistakes(prev => prev + 1);
      } else if (isBoardComplete(newGrid, solution)) {
        // Check if complete
        setIsComplete(true);
      }
    }
  }, [selected, isNoteMode, currentGrid, notes, puzzle, solution, isComplete, mistakes]);

  // Keyboard navigation and input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || mistakes >= 3) return;

      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleInput(null);
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNoteMode(prev => !prev);
      } else if (e.key === 'u' || e.key === 'U') {
        undo();
      } else if (e.key.startsWith('Arrow')) {
        setSelected(prev => {
          if (!prev) return { row: 0, col: 0 };
          let { row, col } = prev;
          if (e.key === 'ArrowUp') row = (row - 1 + 9) % 9;
          if (e.key === 'ArrowDown') row = (row + 1) % 9;
          if (e.key === 'ArrowLeft') col = (col - 1 + 9) % 9;
          if (e.key === 'ArrowRight') col = (col + 1) % 9;
          return { row, col };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, isComplete]);

  const getCellClasses = (r: number, c: number) => {
    const isSelected = selected?.row === r && selected?.col === c;
    const isInitial = puzzle[r][c] !== null;
    const value = currentGrid[r][c];
    const isSameNum = selected && value !== null && currentGrid[selected.row][selected.col] === value;
    const isRelated = selected && (selected.row === r || selected.col === c || (Math.floor(selected.row / 3) === Math.floor(r / 3) && Math.floor(selected.col / 3) === Math.floor(c / 3)));
    const isError = value !== null && value !== solution[r][c];

    return cn(
      "relative flex items-center justify-center w-full aspect-square text-2xl font-medium transition-all duration-200 cursor-pointer select-none border-r border-b border-slate-200",
      c % 3 === 2 && c !== 8 && "border-r-2 border-r-slate-400",
      r % 3 === 2 && r !== 8 && "border-b-2 border-b-slate-400",
      isSelected ? "bg-indigo-500 text-white z-10 scale-105 shadow-lg rounded-sm" :
        isSameNum ? "bg-indigo-100" :
          isRelated ? "bg-indigo-50/50" : "bg-white hover:bg-slate-50",
      isInitial ? "font-bold text-slate-800" : "text-indigo-600",
      isError && !isSelected && "text-rose-500 bg-rose-50",
      isComplete && "bg-emerald-50 text-emerald-600"
    );
  };

  if (puzzle.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Zen Sudoku</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mistakes:</span>
                <span className="text-xs font-bold text-rose-500">{mistakes}/3</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => startNewGame()}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
            title="New Game"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Board */}
        <div className="p-4">
          <div className="grid grid-cols-9 border-2 border-slate-400 rounded-lg overflow-hidden shadow-inner bg-slate-200">
            {currentGrid.map((row, r) => (
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={getCellClasses(r, c)}
                  onClick={() => setSelected({ row: r, col: c })}
                >
                  {val !== null ? (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={`${r}-${c}-${val}`}
                    >
                      {val}
                    </motion.span>
                  ) : (
                    <div className="grid grid-cols-3 w-full h-full p-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div key={n} className="flex items-center justify-center text-[8px] leading-none text-indigo-400 font-bold">
                          {notes[r][c].has(n) ? n : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 pt-2 space-y-6">
          {/* Number Pad */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                onClick={() => handleInput(n)}
                className="h-12 flex items-center justify-center text-xl font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-500 hover:text-white active:scale-95 transition-all shadow-sm"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleInput(null)}
              className="h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white active:scale-95 transition-all shadow-sm"
            >
              <Eraser size={20} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsNoteMode(!isNoteMode)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-sm border",
                isNoteMode
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Pencil size={18} />
              <span>Notes {isNoteMode ? 'ON' : 'OFF'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={history.length === 0}
                className="p-3 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <Undo2 size={20} />
              </button>
              <button
                onClick={() => {
                  if (selected && puzzle[selected.row][selected.col] === null) {
                    const newGrid = [...currentGrid];
                    newGrid[selected.row][selected.col] = solution[selected.row][selected.col];
                    setCurrentGrid(newGrid);
                  }
                }}
                className="p-3 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <Lightbulb size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Win Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Well Done!</h2>
              <p className="text-slate-500 mb-8">You've successfully completed the puzzle.</p>
              <button
                onClick={() => startNewGame()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {mistakes >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Game Over</h2>
              <p className="text-slate-500 mb-8">You made 3 mistakes. Better luck next time!</p>
              <button
                onClick={() => startNewGame()}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-8 text-slate-400 text-sm flex items-center gap-6">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm text-xs font-bold text-slate-500">1-9</kbd>
          <span>Input</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm text-xs font-bold text-slate-500">Arrows</kbd>
          <span>Move</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm text-xs font-bold text-slate-500">N</kbd>
          <span>Notes</span>
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;
