import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  entry: {
    main: 'electron/main.ts',
    preload: 'electron/preload/index.ts',
    'workers/response-processor': 'electron/workers/response-processor.ts'
  },
  format: ['cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    }
  },
  outDir: 'dist_electron',
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  dts: false,
  target: 'node20',
  external: ['electron', 'better-sqlite3'],
  noExternal: ['electron-log', 'electron-updater', 'dotenv', 'axios', 'qs', 'bcrypt', 'form-data', 'tail'],
  define: {
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
  }
});
