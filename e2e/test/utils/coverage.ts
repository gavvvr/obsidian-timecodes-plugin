import type { CoverageMapData } from 'istanbul-lib-coverage'

import { createCoverageMap } from 'istanbul-lib-coverage'
import { createContext } from 'istanbul-lib-report'
import { createSourceMapStore } from 'istanbul-lib-source-maps'
import * as reports from 'istanbul-reports'

export async function exportCoverageToLcov(lcovFileName: string) {
  const coverageMap = createCoverageMap(await collectCoverageData())
  const remappedCoverageMap = await createSourceMapStore().transformCoverage(coverageMap)

  const context = createContext({ coverageMap: remappedCoverageMap, dir: '.' })
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
