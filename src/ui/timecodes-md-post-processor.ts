import { MarkdownPostProcessorContext } from 'obsidian'

import { Timecode } from '../types'
import { TIMECODE_REGEXP, matchesIterator as timeCodeMatcher } from '../utils/timecode-parser'
import { createTimecodedYouTubeLink, findYouTubeVideoId } from '../utils/youtube-links'

let latestDetectedVideoId: string | null = null
let latestNoteBeingProcessed: string | null = null

export function turnRawTimecodesIntoClickableLinks(
  root: HTMLElement,
  ctx: MarkdownPostProcessorContext,
): void {
  const currentNoteSourcePath = ctx.sourcePath

  if (latestNoteBeingProcessed !== null && latestNoteBeingProcessed !== currentNoteSourcePath) {
    latestDetectedVideoId = null
  }
  latestNoteBeingProcessed = currentNoteSourcePath

  let node: Node | null = null
  const nodesWithTimecodes: Text[] = []
  const nodeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)
  while ((node = nodeWalker.nextNode()) != null) {
    let textForFindingVideoLink: string | null = null
    if (node.nodeType === Node.ELEMENT_NODE) {
      const elementNode = node as Element
      if (elementNode instanceof HTMLAnchorElement) {
        textForFindingVideoLink = elementNode.href
      }
      if (elementNode instanceof HTMLIFrameElement) {
        textForFindingVideoLink = elementNode.src
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text

      textForFindingVideoLink = textNode.textContent
    }

    if (textForFindingVideoLink) {
      const detectedVideoId = findYouTubeVideoId(textForFindingVideoLink)

      if (detectedVideoId) {
        latestDetectedVideoId = detectedVideoId
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text
      const nodeTextContent = textNode.textContent
      if (!nodeTextContent) continue
      const textNodeContainsTimecodes = TIMECODE_REGEXP.test(nodeTextContent)

      if (textNodeContainsTimecodes) {
        nodesWithTimecodes.push(textNode)
      }
    }
  }

  if (!latestDetectedVideoId) return

  for (const node of nodesWithTimecodes) {
    enrichTextNodeWithClickableTimecodes(node, latestDetectedVideoId)
  }
}

function enrichTextNodeWithClickableTimecodes(node: Text, videoId: string): void {
  const textNode = node as ChildNode
  const textContent = textNode.textContent
  if (textContent === null) return

  const textFragmentEnrichedWithLinks = createTextFragmentEnrichedWithLinks(textContent, videoId)
  textNode.replaceWith(textFragmentEnrichedWithLinks)
}

const createTextFragmentEnrichedWithLinks
= (rawTextContent: string, videoId: string): DocumentFragment => {
  const textFragmentEnrichedWithLinks = document.createDocumentFragment()
  let lastIndex = 0
  let match: { index: number, fullMatch: string, timecode: Timecode } | null
  const matcher = timeCodeMatcher(rawTextContent)

  while ((match = matcher.next()) !== null) {
    const fullMatch = match.fullMatch

    const theTextBefore = rawTextContent.slice(lastIndex, match.index)
    textFragmentEnrichedWithLinks.appendChild(document.createTextNode(theTextBefore))

    const timecodeLinkEl = composeYouTubeLinkElement(videoId, fullMatch, match.timecode)
    textFragmentEnrichedWithLinks.appendChild(timecodeLinkEl)

    lastIndex = match.index + fullMatch.length
  }
  const theTextAfter = rawTextContent.slice(lastIndex)
  textFragmentEnrichedWithLinks.appendChild(document.createTextNode(theTextAfter))
  return textFragmentEnrichedWithLinks
}

const composeYouTubeLinkElement
= (videoId: string, rawTimecodeText: string, timecode: Timecode): HTMLAnchorElement => {
  const timecodedLink = createTimecodedYouTubeLink(videoId, timecode)
  const link = document.createElement('a')
  link.rel = 'noopener nofollow'
  link.className = 'external-link'
  link.href = timecodedLink
  link.target = '_blank'
  link.textContent = rawTimecodeText
  link.ariaLabel = timecodedLink
  return link
}
