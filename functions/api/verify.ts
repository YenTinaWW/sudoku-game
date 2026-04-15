type Grid = (number | null)[][];

export const onRequestPost = async (context: { request: Request }) => {
  const { row, col, val, currentGrid, solution } = await context.request.json() as {
    row: number;
    col: number;
    val: number;
    currentGrid: Grid;
    solution: Grid;
  };

  // Step 1: Check if this move is correct
  const valid = solution[row][col] === val;

  // Step 2: If valid, check if the entire board is now complete
  // We treat the current cell as `val` (since it hasn't been committed to currentGrid yet)
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
