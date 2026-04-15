/**
 * @fileoverview Application entry point.
 * Bootstraps React by rendering {@link App} into the #root DOM element.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
