import { describe, expect, it } from 'vitest'

import { createTimecodedYouTubeLink, findYouTubeVideoId } from './youtube-links'

describe(createTimecodedYouTubeLink, () => {
  it('creates expected timecoded URL', () => {
    const result = createTimecodedYouTubeLink('k_ItB5btREU', { hours: 0, minutes: 58, seconds: 58 })
    expect(result).toBe('https://youtu.be/k_ItB5btREU?t=3538')
  })
})

describe(findYouTubeVideoId, () => {
  it.each([
    ['https://youtu.be/k_ItB5btREU'],
    ['https://youtu.be/k_ItB5btREU?t=3538'],
    ['https://youtube.com/watch?v=k_ItB5btREU'],
    ['https://www.youtube.com/watch?v=k_ItB5btREU'],
    ['https://www.youtube.com/watch?v=k_ItB5btREU&t=3538s'],
    ['https://www.youtube.com/embed/k_ItB5btREU'],
    ['https://www.youtube.com/embed/k_ItB5btREU?si=CEt8uJEYDsJB6rsK'],
  ])('parse video id from: "%s"', (input) => {
    expect(findYouTubeVideoId(input)).toBe('k_ItB5btREU')
  })
})
