/**
 * @fileoverview Core game logic hook for the Sudoku application.
 * Manages puzzle state, elapsed timer with 30-second penalties, note mode, and keyboard input.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Grid, CellPos, NoteGrid } from '@/src/types/sudoku';
import { fetchPuzzle, verifyMove } from '@/src/services/sudokuApi';

export interface SudokuGameState {
  // Board data
  puzzle: Grid;
  puzzleId: string;
  currentGrid: Grid;
  notes: NoteGrid;
  errorCells: Set<string>;

  // Interaction state
  selected: CellPos;
  setSelected: React.Dispatch<React.SetStateAction<CellPos>>;
  isNoteMode: boolean;
  setIsNoteMode: React.Dispatch<React.SetStateAction<boolean>>;
  isComplete: boolean;

  // Timer (read-only)
  timeElapsed: number;
  penaltyTrigger: number | null;
  setPenaltyTrigger: React.Dispatch<React.SetStateAction<number | null>>;

  // Actions
  handleInput: (num: number | null) => void;
  startNewGame: () => Promise<void>;
}


/**
 * Custom React hook that encapsulates all Sudoku game logic.
 * Fetches the initial puzzle, tracks player input, runs the game timer,
 * applies 30-second penalties for wrong answers, and syncs with the API.
 * @returns {SudokuGameState} All state and action handlers needed to render the game UI.
 */
export function useSudokuGame(): SudokuGameState {
  // 1. State declarations
  const [puzzle, setPuzzle] = useState<Grid>([]);
  const [puzzleId, setPuzzleId] = useState<string>('');
  const [currentGrid, setCurrentGrid] = useState<Grid>([]);
  const [notes, setNotes] = useState<NoteGrid>([]);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<CellPos>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [penaltyTrigger, setPenaltyTrigger] = useState<number | null>(null);

  // 2. Fetch a new puzzle and reset all state
  const startNewGame = useCallback(async () => {
    const { puzzle: p, puzzleId: pid } = await fetchPuzzle();
    setPuzzle(p);
    setPuzzleId(pid);
    setCurrentGrid(p.map((row: (number | null)[]) => [...row]));
    setNotes(Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set<number>())
    ));
    setErrorCells(new Set());
    setSelected(null);
    setIsComplete(false);
    setStartTime(Date.now());
    setPenaltySeconds(0);
    setTimeElapsed(0);
    setPenaltyTrigger(null);
  }, []);

  // 3. Load puzzle on mount
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // 4. Timer tick — depends on isComplete, startTime, and penaltySeconds
  useEffect(() => {
    if (isComplete) return;
    const intervalId = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000) + penaltySeconds);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isComplete, startTime, penaltySeconds]);

  // 5. Handle number/erase input from pad or keyboard
  const handleInput = useCallback((num: number | null) => {
    if (!selected || isComplete) return;
    const { row, col } = selected;
    if (puzzle[row][col] !== null) return;

    if (num === null) {
      if (!isNoteMode) {
        const newGrid = [...currentGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = null;
        setCurrentGrid(newGrid);
        
        setErrorCells(prev => {
          const next = new Set(prev);
          next.delete(`${row}-${col}`);
          return next;
        });
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
      if (cellNotes.has(num)) cellNotes.delete(num);
      else cellNotes.add(num);
      newNotes[row][col] = cellNotes;
      setNotes(newNotes);
    } else {
      const newNotes = notes.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? new Set<number>() : cell))
      );

      if (currentGrid[row][col] === num) {
        const newGrid = currentGrid.map((r, ri) =>
          r.map((v, ci) => (ri === row && ci === col ? null : v))
        );
        setCurrentGrid(newGrid);
        setNotes(newNotes);
        setErrorCells(prev => {
          const next = new Set(prev);
          next.delete(`${row}-${col}`);
          return next;
        });
        return;
      }

      verifyMove({ row, col, val: num, currentGrid, puzzleId })
        .then(({ valid, finish }) => {
          const newGrid = currentGrid.map((r, ri) =>
            r.map((v, ci) => (ri === row && ci === col ? num : v))
          );
          setCurrentGrid(newGrid);
          setNotes(newNotes);
          
          if (valid) {
            setErrorCells(prev => {
              const next = new Set(prev);
              next.delete(`${row}-${col}`);
              return next;
            });
            if (finish) setIsComplete(true);
          } else {
            setErrorCells(prev => {
              const next = new Set(prev);
              next.add(`${row}-${col}`);
              return next;
            });
            setPenaltySeconds(prev => prev + 30);
            setPenaltyTrigger(Date.now());
          }
        });
    }
  }, [selected, isNoteMode, currentGrid, notes, puzzle, puzzleId, isComplete]);

  // 6. Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleInput(null);
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNoteMode(prev => !prev);
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

  return {
    puzzle, puzzleId, currentGrid, notes, errorCells,
    selected, setSelected,
    isNoteMode, setIsNoteMode,
    isComplete,
    timeElapsed, penaltyTrigger, setPenaltyTrigger,
    handleInput, startNewGame,
  };
}
