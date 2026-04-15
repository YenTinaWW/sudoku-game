/**
 * @fileoverview Win modal overlay component.
 * Shown when the player solves the puzzle; displays the final time and a "Play Again" button.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';

interface WinModalProps {
  isComplete: boolean;
  timeElapsed: number;
  onPlayAgain: () => void;
}


/**
 * Animated fullscreen overlay displayed on puzzle completion.
 * @param {WinModalProps} props
 * @param {boolean} props.isComplete - Controls visibility; the modal renders only when `true`.
 * @param {number} props.timeElapsed - Final elapsed time in seconds, shown in the modal.
 * @param {() => void} props.onPlayAgain - Callback invoked when the user clicks "Play Again".
 * @returns {JSX.Element | null} The animated modal overlay, or nothing when not complete.
 */
export const WinModal: React.FC<WinModalProps> = ({ isComplete, timeElapsed, onPlayAgain }) => (
  <AnimatePresence>
    {isComplete && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Well Done!</h2>
          <p className="text-slate-500 mb-2">You've successfully completed the puzzle.</p>
          <div className="text-4xl font-bold text-indigo-600 mb-8 font-mono tracking-widest">
            {String(Math.floor(timeElapsed / 60)).padStart(2, '0')}:
            {String(timeElapsed % 60).padStart(2, '0')}
          </div>
          <button
            onClick={onPlayAgain}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            Play Again
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
