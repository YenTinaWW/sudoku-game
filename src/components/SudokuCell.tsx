/**
 * @fileoverview Individual Sudoku cell component.
 * Renders either an animated digit or a 3×3 pencil-mark note grid per cell.
 */

import React from 'react';
import { motion } from 'motion/react';
import type { CellPos, Grid } from '@/src/types/sudoku';
import { getCellClasses } from '@/src/utils/cellUtils';

interface SudokuCellProps {
  r: number;
  c: number;
  value: number | null;
  notes: Set<number>;
  selected: CellPos;
  puzzle: Grid;
  currentGrid: Grid;
  solution: Grid;
  isComplete: boolean;
  onClick: () => void;
}


/**
 * A single interactive Sudoku cell.
 * @param {SudokuCellProps} props
 * @param {number} props.r - Row index (0–8).
 * @param {number} props.c - Column index (0–8).
 * @param {number | null} props.value - The current cell value, or null if empty.
 * @param {Set<number>} props.notes - Pencil-mark candidates for this cell.
 * @param {CellPos} props.selected - The currently selected cell position.
 * @param {Grid} props.puzzle - The original puzzle (locks pre-filled cells).
 * @param {Grid} props.currentGrid - The player's current board state.
 * @param {Grid} props.solution - The correct solution (used for error highlighting).
 * @param {boolean} props.isComplete - Whether the puzzle has been solved.
 * @param {() => void} props.onClick - Callback when the cell is clicked.
 * @returns {JSX.Element} A styled, animated, clickable cell element.
 */
export const SudokuCell: React.FC<SudokuCellProps> = ({
  r, c, value, notes,
  selected, puzzle, currentGrid, solution, isComplete,
  onClick,
}) => (
  <div
    className={getCellClasses({ r, c, selected, puzzle, currentGrid, solution, isComplete })}
    onClick={onClick}
  >
    {value !== null ? (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={`${r}-${c}-${value}`}
      >
        {value}
      </motion.span>
    ) : (
      <div className="grid grid-cols-3 w-full h-full p-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <div
            key={n}
            className="flex items-center justify-center text-[8px] leading-none text-indigo-400 font-bold"
          >
            {notes.has(n) ? n : ''}
          </div>
        ))}
      </div>
    )}
  </div>
);
