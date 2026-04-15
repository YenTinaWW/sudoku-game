/**
 * @fileoverview Shared TypeScript types for the Sudoku game.
 * Exports core data types (Grid, CellPos, NoteGrid) and API contract interfaces
 * (VerifyRequest, VerifyResponse).
 */

export type Grid = (number | null)[][];

export type CellPos = { row: number; col: number } | null;
export type NoteGrid = Set<number>[][];

// API request/response types
export interface VerifyRequest {
  row: number;
  col: number;
  val: number;
  currentGrid: Grid;
  puzzleId: string;
}

export interface VerifyResponse {
  valid: boolean;
  finish: boolean;
}
