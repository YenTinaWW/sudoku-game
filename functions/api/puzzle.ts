/**
 * Represents a 9x9 Sudoku grid where each cell holds a number (1–9) or `null` for an empty cell.
 */
export type Grid = (number | null)[][];

/**
 * Creates a 9x9 grid with all cells initialized to `null`.
 *
 * @returns A blank {@link Grid} ready to be filled.
 *
 * @complexity O(N²) where N = 9 — initializes all 81 cells.
 */
export function generateEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

/**
 * Checks whether placing `num` at `(row, col)` violates any Sudoku constraint.
 * Validates the row, column, and the 3×3 box that contains the cell.
 *
 * @param grid - The current state of the grid.
 * @param row  - Zero-based row index of the target cell.
 * @param col  - Zero-based column index of the target cell.
 * @param num  - The candidate number to validate (1–9).
 * @returns `true` if placing `num` is legal, `false` otherwise.
 *
 * @complexity O(N) where N = 9 — scans the row (N), column (N), and 3×3 box (N), totalling 3N checks.
 */
function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

/**
 * Fills `grid` with a complete, valid Sudoku solution using backtracking.
 * Numbers are shuffled randomly so each call produces a different solution.
 *
 * @param grid - The grid to solve in-place (modified directly).
 * @returns `true` if the grid was solved successfully, `false` if no solution exists.
 *
 * @complexity O(N · N^(N²)) worst case where N = 9 — backtracking over up to N² empty cells,
 *   trying N candidates each, with an O(N) `isValid` check per candidate.
 *   In practice the Sudoku constraints prune the search space heavily, making this very fast.
 */
function solve(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solve(grid)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Counts the number of valid solutions for `grid`, stopping early once two solutions
 * are found (used to verify that a puzzle has a unique solution).
 *
 * @param grid - The partially-filled grid to analyze (modified in-place during search, then restored).
 * @returns The number of solutions found, capped at 2.
 *
 * @complexity O(N · N^(N²)) worst case — same backtracking structure as {@link solve},
 *   but early-exits as soon as a second solution is found, so it terminates sooner in practice.
 */
function countSolutions(grid: Grid): number {
  let count = 0;

  function countHelper(): void {
    if (count > 1) return;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              countHelper();
              grid[row][col] = null;
              if (count > 1) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }

  countHelper();
  return count;
}

/**
 * Generates a Sudoku puzzle with a unique solution by:
 * 1. Creating a fully-solved grid via {@link solve}.
 * 2. Randomly removing up to 20 cells while preserving uniqueness.
 *
 * @returns An object containing:
 *   - `puzzle`   – The grid with some cells removed (playable board).
 *   - `solution` – The complete, solved grid.
 *
 * @complexity O(N² · N · N^(N²)) — dominated by up to N² calls to {@link countSolutions}
 *   (one per candidate cell to remove). The solve step and shuffle are negligible by comparison.
 */
export function generatePuzzle(): { puzzle: Grid; solution: Grid } {
  const solution: Grid = generateEmptyGrid();
  solve(solution);

  const puzzle: Grid = solution.map((row) => [...row]);

  const cells: {r: number, c: number}[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push({r, c});
    }
  }
  cells.sort(() => Math.random() - 0.5);

  let removedCount = 0;

  for (const cell of cells) {
    if (removedCount >= 20) break;

    const temp = puzzle[cell.r][cell.c];
    puzzle[cell.r][cell.c] = null;

    if (countSolutions(puzzle) === 1) {
      removedCount++;
    } else {
      puzzle[cell.r][cell.c] = temp;
    }
  }

  return { puzzle, solution };
}

/**
 * Cloudflare Pages Function — GET /api/puzzle
 *
 * Generates a new Sudoku puzzle and returns it as JSON.
 *
 * @returns A {@link Response} containing `{ puzzle: Grid, puzzleId: string }`.
 */
export const onRequestGet = async (context: any) => {
  const { puzzle, solution } = generatePuzzle();
  const puzzleId = crypto.randomUUID();

  // If KV is configured, store the solution for verification
  if (context.env?.SUDOKU_SOLUTIONS) {
    await context.env.SUDOKU_SOLUTIONS.put(
      puzzleId, 
      JSON.stringify(solution), 
      { expirationTtl: 86400 } // 24 hours expiry
    );
  }

  return new Response(JSON.stringify({ puzzle, puzzleId }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
