import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({ customElement: true })],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/main.scss";`
      }
    }
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.vue'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
      input: {
        'sorting': fileURLToPath(
          new URL('./src/main.js', import.meta.url),
        ),
      },
    },
  },
  server: {
    port: 3010,
  },
})
