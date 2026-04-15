/**
 * @fileoverview Cell styling utility for the Sudoku board.
 * Computes Tailwind CSS class names per cell based on selection, relation, error, and completion state.
 */

import { cn } from '@/src/lib/utils';
import type { CellPos, Grid } from '@/src/types/sudoku';

export interface CellClassArgs {
  r: number;
  c: number;
  selected: CellPos;
  puzzle: Grid;
  currentGrid: Grid;
  errorCells: Set<string>;
  isComplete: boolean;
}


/**
 * Computes the Tailwind CSS class string for a single Sudoku cell.
 * @param {CellClassArgs} args - Cell coordinates and full board context.
 * @param {number} args.r - Row index (0–8).
 * @param {number} args.c - Column index (0–8).
 * @param {CellPos} args.selected - The currently selected cell (null if none).
 * @param {Grid} args.puzzle - The original puzzle grid (identifies locked/pre-filled cells).
 * @param {Grid} args.currentGrid - The player's current board state.
 * @param {Set<string>} args.errorCells - Cells that have been identified as incorrect.
 * @param {boolean} args.isComplete - Whether the puzzle has been solved.
 * @returns {string} A merged Tailwind className string reflecting the cell's visual state.
 */
export function getCellClasses({
  r, c, selected, puzzle, currentGrid, errorCells, isComplete,
}: CellClassArgs): string {
  const isSelected = selected?.row === r && selected?.col === c;
  const isInitial = puzzle[r][c] !== null;
  const value = currentGrid[r][c];
  const isSameNum =
    selected && value !== null && currentGrid[selected.row][selected.col] === value;
  const isRelated =
    selected &&
    (selected.row === r ||
      selected.col === c ||
      (Math.floor(selected.row / 3) === Math.floor(r / 3) &&
        Math.floor(selected.col / 3) === Math.floor(c / 3)));
  const isError = errorCells.has(`${r}-${c}`);

  return cn(
    'relative flex items-center justify-center w-full aspect-square text-2xl font-medium transition-all duration-200 cursor-pointer select-none border-r border-b border-slate-200',
    c % 3 === 2 && c !== 8 && 'border-r-2 border-r-slate-400',
    r % 3 === 2 && r !== 8 && 'border-b-2 border-b-slate-400',
    isSelected
      ? 'bg-indigo-500 text-white z-10 scale-105 shadow-lg rounded-sm'
      : isSameNum
      ? 'bg-indigo-100'
      : isRelated
      ? 'bg-indigo-50/50'
      : 'bg-white hover:bg-slate-50',
    isInitial ? 'font-bold text-slate-800' : 'text-indigo-600',
    isError && !isSelected && 'text-rose-500 bg-rose-50',
    isComplete && 'bg-emerald-50 text-emerald-600',
  );
}
