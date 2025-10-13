// @ts-check

import process from 'node:process'

import esbuild from 'esbuild'

import { sharedEsbuildConfig } from './esbuild.config.js'
import { instrumentWithSourceMaps } from './utils/instrument.js'

const config = sharedEsbuildConfig

const prod = process.argv[2] === 'production'
const coverage = process.argv[2] === 'coverage'

const context = await esbuild.context({
  ...config,
  ...prod
    ? { minify: true, sourcemap: false }
    : {},
  ...coverage
    ? { minify: true, sourcemap: 'inline' }
    : {},
})

if (prod) {
  await context.rebuild()
  process.exit(0)
} else if (coverage) {
  await context.rebuild()
  instrumentWithSourceMaps('out/main.js', 'out/main.js')
  process.exit(0)
} else {
  await context.watch()
}
