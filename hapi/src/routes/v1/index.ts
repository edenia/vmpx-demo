import { Server } from '@hapi/hapi'

import * as transactionRoute from './transaction.route'

const baseRoute = '/api/v1'

export const routes = (server: Server) => {
  transactionRoute.routes(server, baseRoute)
}
