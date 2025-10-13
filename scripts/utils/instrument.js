// @ts-check
import * as fs from 'node:fs'

import { createInstrumenter } from 'istanbul-lib-instrument'

/**
 * Instrument a JavaScript file with Istanbul coverage instrumentation
 * while preserving and remapping original sourcemaps
 * @param {string} inputFile
 * @param {string} outputFile
 */
export async function instrumentWithSourceMaps(inputFile, outputFile) {
  const code = fs.readFileSync(inputFile, 'utf8')

  // Extract the original sourcemap from the bundled file
  const sourceMapMatch
    = code.match(/\/\/# sourceMappingURL=data:application\/json;base64,(.+)/)
  const sourceMapJson = Buffer.from(sourceMapMatch[1].trim(), 'base64').toString('utf8')
  const originalSourceMap = JSON.parse(sourceMapJson)

  if (!sourceMapMatch) throw new Error(`No sourcemap found in ${inputFile}`)

  const instrumenter = createInstrumenter({
    esModules: false, // esbuild outputs Obsidian plugins as CommonJS
    compact: false,
    preserveComments: true,
    produceSourceMap: true,
    autoWrap: true,
  })

  try {
    const instrumentedCode = instrumenter.instrumentSync(
      code,
      inputFile,
      originalSourceMap, // <- This is critical for sourcemaps remapping!
    )
    const sourceMap = instrumenter.lastSourceMap()

    let output = instrumentedCode

    if (sourceMap) {
      const base64SourceMap = Buffer.from(JSON.stringify(sourceMap)).toString('base64')
      output
        += `\n//# sourceMappingURL=data:application/json;base64,${base64SourceMap}`
    }

    fs.writeFileSync(outputFile, output, 'utf8')

    console.log(`✓ Instrumented: ${inputFile} -> ${outputFile}`)
    return true
  } catch (error) {
    console.error(`✗ Failed to instrument ${inputFile}:`, error)
    throw error
  }
}
