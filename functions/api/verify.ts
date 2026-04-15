import type { Grid } from './puzzle';

/**
 * Cloudflare Pages Function — POST /api/verify
 *
 * Validates a player's move against the puzzle solution and checks whether
 * the board is fully completed after the move.
 *
 * @remarks
 * The `currentGrid` sent by the client reflects the board state **before**
 * the move is applied. The pending cell `(row, col)` is therefore evaluated
 * using `val` directly rather than reading from `currentGrid`.
 *
 * @param context.request - JSON body with the following fields:
 *   - `row`         – Zero-based row index of the cell being filled.
 *   - `col`         – Zero-based column index of the cell being filled.
 *   - `val`         – The number the player placed (1–9).
 *   - `currentGrid` – The board state prior to this move.
 *   - `puzzleId`    – The ID used to retrieve the solution grid from KV store.
 *
 * @returns A {@link Response} containing `{ valid: boolean, finish: boolean }`:
 *   - `valid`  – Whether `val` matches the solution at `(row, col)`.
 *   - `finish` – Whether every cell now matches the solution (puzzle complete).
 *
 * @complexity O(N²) where N = 9 — the `valid` check is O(1); the `finish` check scans all
 *   N² cells in the worst case (short-circuits on the first mismatch).
 */
export const onRequestPost = async (context: any) => {
  const { row, col, val, currentGrid, puzzleId } = await context.request.json() as any;

  if (!context.env?.SUDOKU_SOLUTIONS) {
    return new Response(JSON.stringify({ error: 'KV Store not configured' }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }

  const solutionStr = await context.env.SUDOKU_SOLUTIONS.get(puzzleId);
  if (!solutionStr) {
    return new Response(JSON.stringify({ error: 'Puzzle session expired or invalid' }), { 
      status: 404, headers: { 'Content-Type': 'application/json' } 
    });
  }

  const solution = JSON.parse(solutionStr) as Grid;

  // Step 1: Check if this move is correct
  const valid = solution[row][col] === val;

  // Step 2: If valid, check if the entire board is now complete.
  // We treat the current cell as `val` (since it hasn't been committed to currentGrid yet).
  let finish = false;
  if (valid) {
    finish = true;
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const checkVal = (r === row && c === col) ? val : currentGrid[r][c];
        if (checkVal !== solution[r][c]) {
          finish = false;
          break outer;
        }
      }
    }
  }

  return new Response(JSON.stringify({ valid, finish }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
