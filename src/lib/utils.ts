/**
 * @fileoverview Shared UI utility for class name merging.
 * Provides the `cn()` helper for safely composing Tailwind CSS classes.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts so the last value wins.
 * @param {...ClassValue} inputs - Strings, objects, or arrays of conditional class names.
 * @returns {string} A single, deduplicated className string safe for use in JSX.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
