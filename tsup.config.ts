import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    main: 'electron/main.ts',
    preload: 'electron/preload.ts'
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
});
