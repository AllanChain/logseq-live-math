import * as esbuild from 'esbuild'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)
const watchMode = args.includes('--watch')
const distDir = path.join(__dirname, 'dist')

const context = await esbuild.context({
  entryPoints: ['src/index.ts', 'src/parent.ts'],
  minify: true,
  bundle: true,
  loader: {
    '.css': 'text',
  },
  outdir: distDir,
})
if (watchMode) {
  context.watch()
} else {
  await context.rebuild()
  await context.dispose()
}
