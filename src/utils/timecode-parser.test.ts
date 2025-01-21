import { expect, it } from 'vitest'

import { matchesIterator } from './timecode-parser'

it('parses single timecode', () => {
  const matcher = matchesIterator('12:20')
  const timecodeParsed = matcher.next()
  expect(timecodeParsed?.timecode).toStrictEqual({ hours: 0, minutes: 12, seconds: 20 })
})

it('supports hours too', () => {
  const matcher = matchesIterator('01:12:20')
  const timecodeParsed = matcher.next()
  expect(timecodeParsed?.timecode).toStrictEqual({ hours: 1, minutes: 12, seconds: 20 })
})

it('parses timecode with 1 numbebr in "mintes" section', () => {
  const matcher = matchesIterator('1:23')
  const timecodeParsed = matcher.next()
  expect(timecodeParsed?.timecode).toStrictEqual({ hours: 0, minutes: 1, seconds: 23 })
})

it('parses timecode with 1 numbebr in "hours" section', () => {
  const matcher = matchesIterator('1:1:11')
  const timecodeParsed = matcher.next()
  expect(timecodeParsed?.timecode).toStrictEqual({ hours: 1, minutes: 1, seconds: 11 })
})

it('parses multiple timecodes', () => {
  const matcher = matchesIterator('03:30 29:50 01:45:28')
  expect((matcher.next())?.timecode).toStrictEqual({ hours: 0, minutes: 3, seconds: 30 })
  expect((matcher.next())?.timecode).toStrictEqual({ hours: 0, minutes: 29, seconds: 50 })
  expect((matcher.next())?.timecode).toStrictEqual({ hours: 1, minutes: 45, seconds: 28 })
})

it('ignores timecode with more than 59 seconds', () => {
  const matcher = matchesIterator('01:60 02:61')
  expect((matcher.next())).toBeNull()
})

it('ignores timecode with more than 59 minutes', () => {
  const matcher = matchesIterator('60:01 01:61:12')
  expect((matcher.next())).toBeNull()
})

it('ignores timecode not separated by spaces', () => {
  const matcher = matchesIterator('prefix03:13 03:15suffix')
  expect((matcher.next())).toBeNull()
})

it('ignores timecode with one number in "seconds" section', () => {
  const matcher = matchesIterator('01:1')
  const timecodeParsed = matcher.next()
  expect(timecodeParsed).toBeNull()
})

it('ignores a single number', () => {
  const matcher = matchesIterator('42')
  const timecodeParsed = matcher.next()
  expect(timecodeParsed).toBeNull()
})
