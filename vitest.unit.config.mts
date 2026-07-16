import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Fast, isolated unit tests for pure logic and client components (jsdom, no D1).
 *
 * Kept separate from vitest.config.mts (the `.int.spec.ts` suite) because those
 * boot a real Payload/miniflare D1 instance and must be serialized; these touch
 * no I/O, so they parallelize freely and run in milliseconds.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.unit.spec.{ts,tsx}'],
  },
})
