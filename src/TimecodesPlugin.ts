import { MarkdownPostProcessorContext, Plugin } from 'obsidian'

import { turnRawTimecodesIntoClickableLinks } from './ui/timecodes-md-post-processor'

export default class TimecodesPlugin extends Plugin {
  override onload() {
    this.registerMarkdownPostProcessor(
      (root: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        requestAnimationFrame(() => {
          turnRawTimecodesIntoClickableLinks(root, ctx)
        })
      },
    )
  }
}
