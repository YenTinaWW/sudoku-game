import { Grid, isBoardComplete } from './puzzle';

export const onRequestPost = async (context: { request: Request }) => {
  const { board, solution } = await context.request.json() as {
    board: Grid;
    solution: Grid;
  };

  const success = isBoardComplete(board, solution);

  return new Response(JSON.stringify({ success }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
