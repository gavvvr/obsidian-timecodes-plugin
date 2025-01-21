# Obsidian Timecodes Plugin

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=gavvvr_obsidian-timecodes-plugin&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=gavvvr_obsidian-timecodes-plugin)
[![Installations count](https://img.shields.io/github/downloads/gavvvr/obsidian-timecodes-plugin/main.js.svg)][installation-instructions]
[![tested with webdriver.io](https://img.shields.io/badge/tested%20with-webdriver.io-%23ea5906)](https://webdriver.io/)


[installation-instructions]: https://help.obsidian.md/Advanced+topics/Third-party+plugins#Discover+and+install+community+plugins

Turns raw timecodes (`MM:SS`/`HH:MM:SS`) into clickable links in Obsidian reading mode.

![Image](https://github.com/user-attachments/assets/a7b99077-1b18-42a8-a818-ebf0afe6d0f7)

Detects YouTube links of the following forms:

- raw text links: `https://www.youtube.com/watch?v=...`
- markdown links: `[video](https://www.youtube.com/watch?v=...)`
- videos embedded into Obsidian note with `<iframe src="https://www.youtube.com/embed/...`
