<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Zen Sudoku (Time Attack Mode)

A modern, fast-paced "Time Attack" Sudoku built with React, Vite, and Cloudflare Pages Functions (for puzzle generation and validation API).

## How to Run Locally

**Prerequisites:** Node.js (v20+ recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Ensure you have a `.env.local` file in the root directory.

### 3. Start Development Server (Full Stack)
Since this app relies on Cloudflare Functions in the `functions/` directory as its backend API, you **must use Wrangler** instead of pure Vite to start the server. This command will simultaneously spin up the Cloudflare API backend and route the Vite React frontend with Hot-Module-Replacement (HMR) seamlessly!

Run the following command:
```bash
npx wrangler pages dev -- npm run dev
```

### 4. Play
Wrangler will boot up and provide a local URL (typically `http://localhost:8788`). Open this URL in your web browser to enjoy the game!
