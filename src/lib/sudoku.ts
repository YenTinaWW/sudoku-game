export type Grid = (number | null)[][];

export const DIFFICULTY_LEVELS = {
  EASY: 36,
  MEDIUM: 30,
  HARD: 24,
  EXPERT: 18,
};

export function generateEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

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

export function generatePuzzle(clues: number = DIFFICULTY_LEVELS.MEDIUM): { puzzle: Grid; solution: Grid } {
  const solution: Grid = generateEmptyGrid();
  solve(solution);

  const puzzle: Grid = solution.map((row) => [...row]);
  let attempts = 81 - clues;

  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      attempts--;
    }
  }

  return { puzzle, solution };
}

export function isBoardComplete(grid: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
