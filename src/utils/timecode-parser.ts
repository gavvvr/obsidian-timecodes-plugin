import { Timecode } from '../types'

export const TIMECODE_REGEXP = /\b(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\b/

interface ParsedTimecode {
  /**
   * The zero-based position where the timecode match begins in the original input string.
   */
  index: number
  /**
   * The full substring that matched the timecode pattern
   */
  fullMatch: string
  /**
   * The parsed timecode object containing the structured time data.
   */
  timecode: Timecode
}

export const matchesIterator = (input: string) => {
  const regexp = new RegExp(TIMECODE_REGEXP, 'g')
  return {
    next(): ParsedTimecode | null {
      const match = regexp.exec(input)
      if (!match) return null
      const hours = parseInt(match[1]) || 0
      const minutes = parseInt(match[2])
      const seconds = parseInt(match[3])
      if (seconds > 59 || minutes > 59) return null
      return { index: match.index, fullMatch: match[0], timecode: { hours, minutes, seconds },
      }
    },
  }
}
