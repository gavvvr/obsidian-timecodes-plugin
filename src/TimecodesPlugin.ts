import { Plugin } from 'obsidian'

import { turnRawTimecodesIntoClickableLinks } from './ui/timecodes-md-post-processor'

export default class TimecodesPlugin extends Plugin {
  override onload() {
    this.registerMarkdownPostProcessor(turnRawTimecodesIntoClickableLinks)
  }
}
