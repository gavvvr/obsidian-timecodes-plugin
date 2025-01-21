import { Timecode } from '../types'
import { timecodeToSeconds } from './timecode-converter'

const youTubeLinkRegexes = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch)\?v=([^?&\s]+)/,
  /(?:https?:\/\/)?youtu\.be\/([^?&\s]+)/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:embed)\/([^?&\s]+)/,
]

export const findYouTubeVideoId = (input: string): string | null => {
  for (const regex of youTubeLinkRegexes) {
    const match = input.match(regex)
    if (match) return match[1]
  }
  return null
}

export const createTimecodedYouTubeLink = (videoId: string, timecode: Timecode) =>
  `https://youtu.be/${videoId}?t=${timecodeToSeconds(timecode).toString()}`
