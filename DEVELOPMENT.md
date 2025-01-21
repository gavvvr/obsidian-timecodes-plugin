# Development how-to

## Prerequisites

- Get a [Node.js](https://nodejs.org/)
- Execute `corepack enable` to enable PnPM package manager

## Development

- It is recommended to create a new Obsidian vault for development
- `git clone` the repo to any place on your filesystem and enter the directory you cloned
- `pnpm install` once to resolve project dependencies
- `pnpm run dev` to mount the plugin to Obsidian vault (where you would like to test it)
  with hot-reload capability to get instant feedback on any change in your code

---

Special thanks to:

- @pjeby for [hot-reload plugin][hot-reload] which gives an instant feedback on code change
- @zephraph for his [tools for Obsidian plugin development][obsidian-utils] package which makes development a breeze

[obsidian-utils]: https://github.com/obsidian-tools/obsidian-tools/tree/main/packages/obsidian-utils
[hot-reload]: https://github.com/pjeby/hot-reload
