import Hapi from '@hapi/hapi'
import { Server } from '@hapi/hapi'

import routes from './routes'
import workerService from './services/worker'
import listenerService from './services/listener'

const init = async () => {
  const server: Server = Hapi.server({
    port: process.env.PORT || 9090,
    host: '0.0.0.0'
  })

  routes(server)

  server.start()

  await workerService.init()
  listenerService.start()

  console.log(`🚀 Server ready at ${server.info.uri}`)
  server.table().forEach(route => console.log(`${route.method}\t${route.path}`))
}

process.on('uncaughtException', (err, origin) => {
  console.log('Uncaught Exception:', err, 'Exception origin:', origin)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', promise, 'reason:', reason)
})

init()
