// import {
//   ServerRoute,
//   Request,
//   ResponseToolkit,
//   ResponseObject
// } from '@hapi/hapi'

// const Boom = require('@hapi/boom')
// const Joi = require('joi')

// const { customerService } = require('../services')

import { Server } from '@hapi/hapi'

export const routes = (server: Server) => {
  server.route({
    method: 'GET',
    path: '/healthz',
    handler: () => {
      return 'OK'
    }
  })
}

// export = {
//   method: 'POST',
//   path: '/register-customer',
//   handler: async (
//     request: Request,
//     h: ResponseToolkit
//   ): Promise<ResponseObject> => {
//     try {
//       return await h.response({})
//     } catch (error: any) {
//       return h.response(error).code(500)
//       //   return Boom.badRequest(error.message)
//     }
//   }
// }
