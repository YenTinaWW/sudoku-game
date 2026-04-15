/**
 * @fileoverview API service layer for Sudoku puzzle data.
 * Communicates with Cloudflare Functions at `/api/puzzle` and `/api/verify`.
 */

import type { Grid, VerifyRequest, VerifyResponse } from '@/src/types/sudoku';

export interface PuzzleData {
  puzzle: Grid;
  puzzleId: string;
}

/**
 * Fetches a new Sudoku puzzle and its solution from the server.
 * @returns {Promise<PuzzleData>} An object with `puzzle` and `solution` grids.
 * @throws {Error} If the server responds with a non-OK status.
 */
export async function fetchPuzzle(): Promise<PuzzleData> {
  const res = await fetch('/api/puzzle');
  if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);
  return res.json();
}

/**
 * Verifies whether a player's move is correct against the server-side solution.
 * @param {VerifyRequest} req - Move details: `{ row, col, val, currentGrid, solution }`.
 * @returns {Promise<VerifyResponse>} `{ valid: boolean, finish: boolean }`.
 * @throws {Error} If the server responds with a non-OK status.
 */
export async function verifyMove(req: VerifyRequest): Promise<VerifyResponse> {
  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to verify move: ${res.status}`);
  return res.json();
}
