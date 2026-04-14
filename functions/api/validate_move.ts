import { Grid } from './puzzle';

export const onRequestPost = async (context: { request: Request }) => {
  const { row, col, value, solution } = await context.request.json() as {
    row: number;
    col: number;
    value: number;
    solution: Grid;
  };

  const valid = solution[row][col] === value;

  return new Response(JSON.stringify({ valid }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
