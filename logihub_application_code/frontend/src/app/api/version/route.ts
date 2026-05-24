import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Watches all public JSX/JS/CSS files and returns a hash based on their mtimes.
// The live-reload script in LogiHub.html polls this endpoint every 2s.
// When the hash changes (because a file was edited), the browser auto-reloads.

const WATCHED_FILES = [
  'shell-v2.jsx',
  'app-v2.jsx',
  'pages-v2-setup.jsx',
  'pages-v2-decision.jsx',
  'pages-v2-explore.jsx',
  'shell.jsx',
  'pages-onboard.jsx',
  'pages-system.jsx',
  'pages-engine.jsx',
  'pages-report.jsx',
  'data.js',
  'api-bridge.js',
  'styles.css',
  'styles-v2.css',
  'LogiHub.html',
];

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  let sum = 0;

  for (const file of WATCHED_FILES) {
    try {
      const stat = fs.statSync(path.join(publicDir, file));
      sum += stat.mtimeMs;
    } catch {
      // file doesn't exist — skip
    }
  }

  const version = sum.toString(36);

  return NextResponse.json(
    { version },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}
