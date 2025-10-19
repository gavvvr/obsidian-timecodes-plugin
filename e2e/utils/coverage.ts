import type { CoverageMapData } from 'istanbul-lib-coverage'

import * as fs from 'node:fs'
import * as path from 'node:path'

import { createCoverageMap } from 'istanbul-lib-coverage'
import { createContext } from 'istanbul-lib-report'
import { createSourceMapStore } from 'istanbul-lib-source-maps'
import * as reports from 'istanbul-reports'

export async function exportCoverageToLcov() {
  const coverageMap = createCoverageMap(await collectCoverageData())
  const remappedCoverageMap = await createSourceMapStore().transformCoverage(coverageMap)

  const context = createContext({
    coverageMap: remappedCoverageMap,
    dir: 'out/coverage',
    sourceFinder: (filePath: string) => {
      return fs.readFileSync(restorePathRelativeToMainPluginProject(filePath), 'utf-8')
    },
  })
  reports.create('lcov').execute(context)
}

const cwd = process.cwd()

function restorePathRelativeToMainPluginProject(filePath: string) {
  const relativePart = path.relative(cwd, filePath)
  return path.join(path.resolve(cwd, '..'), relativePart)
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
