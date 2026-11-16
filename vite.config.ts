import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { handleApiRequest } from './src/server/dev-api.ts'

export default defineConfig({
  plugins: [
    solid(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          handleApiRequest(req, res, next)
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          handleApiRequest(req, res, next)
        })
      },
    },
  ],
})
