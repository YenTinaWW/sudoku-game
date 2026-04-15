/**
 * @fileoverview Game timer component with penalty animation.
 * Displays elapsed time in MM:SS format and shows a floating "+30s" indicator on wrong moves.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TimerProps {
  timeElapsed: number;
  penaltyTrigger: number | null;
  onPenaltyAnimationComplete: () => void;
}


/**
 * Timer display with animated penalty indicator.
 * @param {TimerProps} props
 * @param {number} props.timeElapsed - Total elapsed seconds including all penalties.
 * @param {number | null} props.penaltyTrigger - Timestamp of the latest penalty event;
 *   acts as a React key so each penalty triggers a fresh animation.
 * @param {() => void} props.onPenaltyAnimationComplete - Called when the +30s animation ends,
 *   so the parent can clear the trigger.
 * @returns {JSX.Element} A styled timer widget with an optional floating penalty label.
 */
export const Timer: React.FC<TimerProps> = ({
  timeElapsed,
  penaltyTrigger,
  onPenaltyAnimationComplete,
}) => (
  <div className="relative flex-1 flex items-center justify-center py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
    <span className="text-lg font-bold text-slate-700 tracking-widest font-mono">
      {String(Math.floor(timeElapsed / 60)).padStart(2, '0')}:
      {String(timeElapsed % 60).padStart(2, '0')}
    </span>
    <AnimatePresence>
      {penaltyTrigger && (
        <motion.div
          key={penaltyTrigger}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -40, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onAnimationComplete={onPenaltyAnimationComplete}
          className="absolute text-rose-500 font-bold"
        >
          +30s
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
