import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    {
      name: 'virtual-obsidian',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'obsidian') {
          return '\0obsidian'
        }
      },
      load(id) {
        if (id === '\0obsidian') {
          return `
            export class Plugin {}
            export default {}`
        }
      },
    },
  ],
  test: {
    isolate: false,
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'html'],
      reportsDirectory: 'out/coverage',
      include: ['src/**/*.ts'],
    },
    reporters: ['default', 'junit'],
    outputFile: 'out/unit-tests-results.xml',
  },
})
