export type Grid = (number | null)[][];



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

export function isBoardComplete(grid: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

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

export const onRequestGet = async () => {
  const { puzzle, solution } = generatePuzzle();
  return new Response(JSON.stringify({ puzzle, solution }), {
    headers: { 'Content-Type': 'application/json' },
  });
};