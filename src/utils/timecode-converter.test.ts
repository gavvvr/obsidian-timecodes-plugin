import { expect, it } from 'vitest'

import { timecodeToSeconds } from './timecode-converter'

it('calculates the right amount of seconds from 3:23', () => {
  const result = timecodeToSeconds({ hours: 0, minutes: 3, seconds: 23 })
  expect(result).toBe(203)
})

it('calculates the right amount of seconds from 02:03:23', () => {
  const result = timecodeToSeconds({ hours: 2, minutes: 3, seconds: 23 })
  expect(result).toBe(7403)
})
