import { spawn } from 'child_process';
import electron from 'electron';
import path from 'path';

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('close', (code) => {
  process.exit(code);
});
