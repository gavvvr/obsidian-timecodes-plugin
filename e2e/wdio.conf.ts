/// <reference types="wdio-electron-service" />
import ObsidianApp from './specs/pageobjects/obsidian-app.page'
import { exportCoverageToLcov } from './test/utils/coverage'

const debug = process.env.DEBUG
const obsidianBinaryPath = process.env.OBSIDIAN_BINARY_PATH
const noSandbox = process.env.NO_SANDBOX === 'true'

const ONE_DAY = 24 * 60 * 60 * 1000

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
        appArgs: [noSandbox ? '--no-sandbox' : ''],
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

  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: debug ? ONE_DAY : 60000,
  },
  beforeSuite: async () => {
    await ObsidianApp.removeE2eTestVaultIfExists()
    await ObsidianApp.createAndOpenFreshVault()
    await ObsidianApp.activateTimecodesPlugin()
  },
  afterSuite: async () => {
    await exportCoverageToLcov('out/coverage/lcov.info')
  },
}
