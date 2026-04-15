/**
 * @fileoverview Top-level game layout component.
 * Assembles the 9x9 board grid, number pad, notes toggle, timer, and win modal.
 */

import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Pencil } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useSudokuGame } from '@/src/hooks/useSudokuGame';
import { SudokuCell } from './SudokuCell';
import { NumberPad } from './NumberPad';
import { Timer } from './Timer';
import { WinModal } from './WinModal';


/**
 * Top-level game component. Reads all state from {@link useSudokuGame} and
 * delegates rendering to {@link SudokuCell}, {@link NumberPad}, {@link Timer},
 * and {@link WinModal}.
 * @returns {JSX.Element | null} The full game UI, or null while the puzzle is loading.
 */
const SudokuBoard: React.FC = () => {
  const {
    puzzle, solution, currentGrid, notes,
    selected, setSelected,
    isNoteMode, setIsNoteMode,
    isComplete,
    timeElapsed, penaltyTrigger, setPenaltyTrigger,
    handleInput, startNewGame,
  } = useSudokuGame();

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
          </div>
          <button
            onClick={startNewGame}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
            title="New Game"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Board */}
        <div className="p-4">
          <div className="grid grid-cols-9 border-2 border-slate-400 rounded-lg overflow-hidden shadow-inner bg-slate-200">
            {currentGrid.map((row, r) =>
              row.map((val, c) => (
                <SudokuCell
                  key={`${r}-${c}`}
                  r={r} c={c}
                  value={val}
                  notes={notes[r][c]}
                  selected={selected}
                  puzzle={puzzle}
                  currentGrid={currentGrid}
                  solution={solution}
                  isComplete={isComplete}
                  onClick={() => setSelected({ row: r, col: c })}
                />
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 pt-2 space-y-6">
          <NumberPad onInput={handleInput} />
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsNoteMode(!isNoteMode)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-sm border',
                isNoteMode
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              <Pencil size={18} />
              <span>Notes {isNoteMode ? 'ON' : 'OFF'}</span>
            </button>
            <Timer
              timeElapsed={timeElapsed}
              penaltyTrigger={penaltyTrigger}
              onPenaltyAnimationComplete={() => setPenaltyTrigger(null)}
            />
          </div>
        </div>
      </motion.div>

      <WinModal
        isComplete={isComplete}
        timeElapsed={timeElapsed}
        onPlayAgain={startNewGame}
      />

      {/* Footer */}
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
