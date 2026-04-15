/**
 * @fileoverview Root application component.
 * Wraps the app shell and mounts {@link SudokuBoard} inside a full-screen layout.
 */
import SudokuBoard from './components/SudokuBoard';

/**
 * Root component. Renders the full-screen background and mounts SudokuBoard.
 * @returns {JSX.Element} A `<main>` element wrapping the game layout.
 */
export default function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SudokuBoard />
    </main>
  );
}

