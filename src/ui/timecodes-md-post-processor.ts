import { MarkdownPostProcessorContext } from 'obsidian'

import { Timecode } from '../types'
import { timecodeToSeconds } from '../utils/timecode-converter'
import { TIMECODE_REGEXP, matchesIterator as timeCodeMatcher } from '../utils/timecode-parser'
import { createTimecodedYouTubeLink, findYouTubeVideoId } from '../utils/youtube-links'

let latestRequiredEnricher: TextTimecodeEnricher | null = null
let latestNoteBeingProcessed: string | null = null

/*
 * From my observations, MarkdownPostProcessor:
 * - gets called once for each paragraph in a note
 * - doesn't get called again on subsequent switch to view-mode unless there was a change in paragraph
 */
export function turnRawTimecodesIntoClickableLinks(
  root: HTMLElement,
  ctx: MarkdownPostProcessorContext,
): void {
  const currentNoteSourcePath = ctx.sourcePath

  if (latestNoteBeingProcessed !== null && latestNoteBeingProcessed !== currentNoteSourcePath) {
    latestRequiredEnricher = null
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
      if (elementNode instanceof HTMLMediaElement) {
        latestRequiredEnricher = localMedicaEnricherFor(elementNode)
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text

      textForFindingVideoLink = textNode.textContent
    }

    if (textForFindingVideoLink) {
      const detectedVideoId = findYouTubeVideoId(textForFindingVideoLink)

      if (detectedVideoId) {
        latestRequiredEnricher = youtubeEnricherFor(detectedVideoId)
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text
      const nodeTextContent = textNode.textContent
      if (!nodeTextContent) continue
      const textNodeContainsTimecodes = TIMECODE_REGEXP.test(nodeTextContent)

      if (textNodeContainsTimecodes && latestRequiredEnricher !== null) {
        nodesWithTimecodes.push(textNode)
      }
    }
  }

  if (latestRequiredEnricher === null) return

  for (const node of nodesWithTimecodes) {
    enrichTextNodeWithClickableTimecodes(node, latestRequiredEnricher)
  }
}

function enrichTextNodeWithClickableTimecodes(node: Text, strategy: TextTimecodeEnricher): void {
  const textNode = node as ChildNode
  const textContent = textNode.textContent
  if (textContent === null) return

  const textFragmentEnrichedWithLinks = createTextFragmentEnrichedWithLinks(textContent, strategy)
  textNode.replaceWith(textFragmentEnrichedWithLinks)
}

const createTextFragmentEnrichedWithLinks
  = (rawTextContent: string, strategy: TextTimecodeEnricher): DocumentFragment => {
    const textFragmentEnrichedWithLinks = document.createDocumentFragment()
    let lastIndex = 0
    let match: { index: number, fullMatch: string, timecode: Timecode } | null
    const matcher = timeCodeMatcher(rawTextContent)

    while ((match = matcher.next()) !== null) {
      const fullMatch = match.fullMatch

      const theTextBefore = rawTextContent.slice(lastIndex, match.index)
      textFragmentEnrichedWithLinks.appendChild(document.createTextNode(theTextBefore))

      const timecodeLinkEl = strategy.composeLinkElementWithTimecode(fullMatch, match.timecode)
      textFragmentEnrichedWithLinks.appendChild(timecodeLinkEl)

      lastIndex = match.index + fullMatch.length
    }
    const theTextAfter = rawTextContent.slice(lastIndex)
    textFragmentEnrichedWithLinks.appendChild(document.createTextNode(theTextAfter))
    return textFragmentEnrichedWithLinks
  }

interface TextTimecodeEnricher {
  composeLinkElementWithTimecode: (raw: string, t: Timecode) => HTMLAnchorElement
}

const youtubeEnricherFor = (videoId: string): TextTimecodeEnricher => ({
  composeLinkElementWithTimecode: (rawTimecodeText, timecode) => {
    const timecodedLink = createTimecodedYouTubeLink(videoId, timecode)
    const link = document.createElement('a')
    link.rel = 'noopener nofollow'
    link.className = 'external-link'
    link.href = timecodedLink
    link.target = '_blank'
    link.textContent = rawTimecodeText
    link.ariaLabel = timecodedLink
    return link
  },
})

const localMedicaEnricherFor = (media: HTMLMediaElement): TextTimecodeEnricher => ({
  composeLinkElementWithTimecode: (raw, timecode) => {
    const link = document.createElement('a')
    link.href = '#'
    link.textContent = raw
    link.addEventListener('click', (e) => {
      e.preventDefault()
      media.currentTime = timecodeToSeconds(timecode)
      void media.play()
    })
    return link
  },
})
