import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const watchMode = args.includes("--watch");

fs.copyFileSync(
  path.join(__dirname, 'node_modules', 'mathlive', 'dist', 'mathlive.min.js'),
  path.join(__dirname, 'dist', 'mathlive.min.js')
)

const context = await esbuild.context({
  entryPoints: ['src/index.ts'],
  minify: true,
  bundle: true,
  loader: {
    '.css': 'text'
  },
  outfile: path.join(__dirname, 'dist', 'index.js'),
})
if (watchMode) {
  context.watch()
}
