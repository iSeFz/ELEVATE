import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Ignore rollup warnings
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore all warnings
        return
        
        // Or ignore specific warnings:
        // if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        // if (warning.code === 'CIRCULAR_DEPENDENCY') return
        // warn(warning)
      }
    },
    // Don't fail on missing imports
    commonjsOptions: {
      ignoreTryCatch: false
    }
  },
  // Disable type checking
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})