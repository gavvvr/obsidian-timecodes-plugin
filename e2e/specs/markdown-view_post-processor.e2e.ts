import ObsidianApp from './pageobjects/obsidian-app.page'

describe('Markdown view post-processor', () => {
  context('Link to video and timecode are within the same <p>aragraph in Markdown view', () => {
    it('renders timecode with expected clickable link', async () => {
      const noteContent = `https://youtu.be/k_ItB5btREU
22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      const link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      const href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('Link to video and timecode are in different <p>aragraphs in Markdown view', () => {
    it('renders timecode with expected clickable link', async () => {
      const noteContent = `https://youtu.be/k_ItB5btREU

22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      const link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      const href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('Timecode is on the same line as video link', () => {
    it('renders timecode with expected clickable link', async () => {
      const noteContent = `https://youtu.be/k_ItB5btREU 22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      const link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      const href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('There is a markdown link to YouTube video instead of a plain text link', () => {
    it('renders timecode with expected clickable link', async () => {
      const noteContent = `[Here](https://youtu.be/k_ItB5btREU) is a great talk about software testing

22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      const link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      const href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('The video is embedded with <iframe>', () => {
    it('renders timecode with expected clickable link', async () => {
      const noteContent = `<iframe width="560" height="315"
src="https://www.youtube.com/embed/k_ItB5btREU?si=RhjVqXP_7K1e-BxG"
title="YouTube video player" frameborder="0" allow="accelerometer;
autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      const link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      const href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('There are multiple videos', () => {
    it('renders timecodes with expected clickable link', async () => {
      const noteContent = `https://www.youtube.com/watch?v=Z5n9VK3sOnI Understanding Gradle classpaths

14:27 a use case for 'api' dependency configuration

https://youtu.be/Lipf5piizZc Another video about Gradle

4:07 - using dependency analysis plugin

https://www.youtube.com/watch?v=k_ItB5btREU

22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      let link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="14:27"]')
      await expect(link).toBePresent()
      let href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/Z5n9VK3sOnI?t=867')

      link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="4:07"]')
      await expect(link).toBePresent()
      href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/Lipf5piizZc?t=247')

      link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('There are multiple videos with mixed links types', () => {
    it('renders timecodes with expected clickable link', async () => {
      const noteContent = `https://www.youtube.com/watch?v=Z5n9VK3sOnI Understanding Gradle classpaths

14:27 a use case for 'api' dependency configuration

[Another video](https://youtu.be/Lipf5piizZc) about Gradle

4:07 - using dependency analysis plugin

      <iframe width="560" height="315"
src="https://www.youtube.com/embed/k_ItB5btREU?si=RhjVqXP_7K1e-BxG"
title="YouTube video player" frameborder="0" allow="accelerometer;
autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      let link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="14:27"]')
      await expect(link).toBePresent()
      let href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/Z5n9VK3sOnI?t=867')

      link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="4:07"]')
      await expect(link).toBePresent()
      href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/Lipf5piizZc?t=247')

      link = $('//div[contains(@class, "markdown-preview-section")]//a[text()="22:53"]')
      await expect(link).toBePresent()
      href = await link.getAttribute('href')
      await expect(href).toBe('https://youtu.be/k_ItB5btREU?t=1373')
    })
  })

  context('There are multiple videos', () => {
    it('preserves the content of a note AS-IS', async () => {
      const noteContent = `https://www.youtube.com/watch?v=Z5n9VK3sOnI Understanding Gradle classpaths

14:27 a use case for 'api' dependency configuration; https://youtu.be/Lipf5piizZc 4:07 - using dependency analysis plugin

https://www.youtube.com/watch?v=k_ItB5btREU

22:53 - effectiveness characteristics of e2e tests`
      await ObsidianApp.createNewNoteWithContent(noteContent)

      await ObsidianApp.toggleReadingView()

      /**
       * It's important to wait a bit here for note's content to get rendered in reading mode
       */
      // eslint-disable-next-line wdio/no-pause
      await browser.pause(100)

      const textLinesFromAllNoteParagraphs = $$('.markdown-preview-section p:not(.mod-ui)')
        .map(p => p.getText())
      const textFromAllNoteParagraphs = (await textLinesFromAllNoteParagraphs).join('\n\n')
      await expect(textFromAllNoteParagraphs).toBe(noteContent)
    })
  })
})
