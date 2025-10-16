import type { CoverageMapData } from 'istanbul-lib-coverage'

import * as fs from 'node:fs'
import * as path from 'node:path'

import { createCoverageMap } from 'istanbul-lib-coverage'
import { createContext } from 'istanbul-lib-report'
import { createSourceMapStore } from 'istanbul-lib-source-maps'
import * as reports from 'istanbul-reports'

const cwd = process.cwd()

export async function exportCoverageToLcov(lcovFileName: string) {
  const coverageMap = createCoverageMap(await collectCoverageData())
  const remappedCoverageMap = await createSourceMapStore().transformCoverage(coverageMap)

  const context = createContext({
    coverageMap: remappedCoverageMap,
    dir: '.',
    sourceFinder: (filePath: string) => {
      const relativePart = path.relative(cwd, filePath)

      const newAbsPath = path.join(path.resolve(cwd, '..'), relativePart)
      return fs.readFileSync(newAbsPath, 'utf-8')
    },
  })
  const lcov = reports.create('lcovonly', { file: lcovFileName })

  lcov.execute(context)
}

async function collectCoverageData() {
  const coverageData = await browser.execute(() => {
    return window.__coverage__
  })
  if (!coverageData) throw new Error('No coverage data found!')
  return coverageData
}

declare global {
  interface Window {
    __coverage__?: CoverageMapData
  }
}
