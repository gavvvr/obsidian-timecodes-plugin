/// <reference types="wdio-electron-service" />
import { type Reporters as WdioReporters } from '@wdio/types'

import ObsidianApp from './specs/pageobjects/obsidian-app.page'
import { exportCoverageToLcov } from './utils/coverage'

const debug = process.env.DEBUG
const ONE_DAY = 24 * 60 * 60 * 1000

const obsidianBinaryPath = process.env.OBSIDIAN_BINARY_PATH
const obsidianNoSandbox = process.env.OBSIDIAN_NO_SANDBOX === 'true'

const wdioReporters: WdioReporters.ReporterEntry[] = ['spec']
if (process.env.WDIO_ALLURE_REPORTER) {
  wdioReporters.push(
    ['video', {
      saveAllVideos: false,
      videoSlowdownMultiplier: 3,
    }],
    ['allure', {
      outputDir: 'out/allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }])
}

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./specs/*.e2e.ts'],
  exclude: [],
  maxInstances: 10,
  capabilities: [
    {
      browserName: 'electron',
      'wdio:electronServiceOptions': {
        // custom application args
        appBinaryPath: obsidianBinaryPath ?? '/Applications/Obsidian.app/Contents/MacOS/Obsidian',
        appArgs: [obsidianNoSandbox ? '--no-sandbox' : '--sandbox'],
      },
    },
  ],
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['electron'],
  framework: 'mocha',

  reporters: wdioReporters,
  mochaOpts: {
    ui: 'bdd',
    timeout: debug ? ONE_DAY : 60000,
  },
  afterTest: async function (_test, _context, { error }) {
    if (error) {
      await browser.takeScreenshot()
    }
  },
  beforeSuite: async () => {
    await ObsidianApp.removeE2eTestVaultIfExists()
    await ObsidianApp.createAndOpenFreshVault()
    await ObsidianApp.activateTimecodesPlugin()
  },
  afterSuite: async () => {
    await exportCoverageToLcov()
  },
}
