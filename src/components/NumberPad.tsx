/**
 * @fileoverview Number input pad component.
 * Provides digit buttons (1–9) and an erase button for entering values into a cell.
 */

import React from 'react';
import { Eraser } from 'lucide-react';

interface NumberPadProps {
  onInput: (num: number | null) => void;
}


/**
 * Number input pad with digit buttons (1–9) and an erase action.
 * @param {NumberPadProps} props
 * @param {(num: number | null) => void} props.onInput - Called with a digit (1–9) on press,
 *   or `null` when the erase button is pressed.
 * @returns {JSX.Element} A responsive 5-column grid of input buttons.
 */
export const NumberPad: React.FC<NumberPadProps> = ({ onInput }) => (
  <div className="grid grid-cols-5 gap-2">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
      <button
        key={n}
        onClick={() => onInput(n)}
        className="h-12 flex items-center justify-center text-xl font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-500 hover:text-white active:scale-95 transition-all shadow-sm"
      >
        {n}
      </button>
    ))}
    <button
      onClick={() => onInput(null)}
      className="h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white active:scale-95 transition-all shadow-sm"
    >
      <Eraser size={20} />
    </button>
  </div>
);
