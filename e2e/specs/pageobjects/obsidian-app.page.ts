import * as fs from 'node:fs/promises'

import { App } from 'obsidian'

import { TEST_VAULT_DIR, TIMECODES_PLUGIN_ID } from '../../constants'

class ObsidianApp {
  async removeE2eTestVaultIfExists() {
    await fs.rm(TEST_VAULT_DIR, { force: true, recursive: true })
  }

  async createAndOpenFreshVault() {
    await browser.execute((testVaultDir: string) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ipcRenderer } = require('electron')
      const shouldCreateNewVault = true
      ipcRenderer.sendSync('vault-open', testVaultDir, shouldCreateNewVault)
    }, TEST_VAULT_DIR)

    const targetPluginsDir = `${TEST_VAULT_DIR}/.obsidian/plugins/${TIMECODES_PLUGIN_ID}/`
    await fs.mkdir(targetPluginsDir, { recursive: true })
    await fs.copyFile('../manifest.json', `${targetPluginsDir}/manifest.json`)
    await fs.copyFile('../out/main.js', `${targetPluginsDir}/main.js`)

    await this.switchToMainWindow()
    await this.closeModal('Trust vault modal')
  }

  private async switchToMainWindow() {
    await browser.switchWindow('app://obsidian.md/index.html')
  }

  async activateTimecodesPlugin() {
    await this.activatePlugin(TIMECODES_PLUGIN_ID)
  }

  private async activatePlugin(pluginId: string) {
    await browser.execute((timecodesPluginId: string) => {
      // @ts-expect-error 'app' exists in Obsidian
      declare const app: App
      app.plugins.setEnable(true)
      app.plugins.enablePlugin(timecodesPluginId)
    }, pluginId)
  }

  async closeModal(modalName: string) {
    console.log(`Closing '${modalName}'`)
    await $('.modal-close-button').click()
  }

  async createNewNoteWithContent(content: string) {
    await this.doCreateNewNote(content)
  }

  async createNewNote() {
    await this.doCreateNewNote()
  }

  private async doCreateNewNote(content?: string) {
    const newNoteButton = $('aria/New note')
    await newNoteButton.click()

    const noteContent = $('.workspace-leaf.mod-active .cm-contentContainer')
    await noteContent.click()
    if (content) {
      await browser.execute((content: string) => {
        // @ts-expect-error 'app' exists in Obsidian
        declare const app: App
        app.workspace.activeEditor!.editor!.setValue(content)
      }, content)
    }
  }

  async toggleReadingView() {
    await browser.execute(() => {
      // @ts-expect-error 'app' exists in Obsidian
      declare const app: App
      app.commands.executeCommandById('markdown:toggle-preview')
    })
  }
}

export default new ObsidianApp()
