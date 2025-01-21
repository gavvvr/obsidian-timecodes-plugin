// @ts-check

import process from 'node:process'

import esbuild from 'esbuild'

import { sharedEsbuildConfig } from './esbuild.config.js'

const config = sharedEsbuildConfig

const prod = process.argv[2] === 'production'

const context = await esbuild.context({
  ...config,
  ...prod
    ? { minify: true, sourcemap: false }
    : {},
})

if (prod) {
  await context.rebuild()
  process.exit(0)
} else {
  await context.watch()
}
