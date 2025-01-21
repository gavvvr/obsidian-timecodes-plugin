import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
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
