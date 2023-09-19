import { Server } from '@hapi/hapi'

import * as serverRoute from './server.route'
import * as v1Routes from './v1'

const routes = (server: Server) => {
  serverRoute.routes(server)
  v1Routes.routes(server)
}

export default routes
