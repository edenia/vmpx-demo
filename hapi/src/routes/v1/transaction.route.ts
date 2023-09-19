import { Server } from '@hapi/hapi'
import Joi from 'joi'
import Boom from '@hapi/boom'
import { BigNumber } from 'ethers'

import { trxAdapterUtil, formatterUtil } from '../../utils'
import { transactionModel } from '../../models'

export const routes = (server: Server, parentRoute: string) => {
  // v1/estimate-tx
  server.route({
    method: 'POST',
    path: `${parentRoute}/estimate-tx`,
    handler: async (
      request: transactionModel.EthTrxPayloadRequest /* h: ResponseToolkit */
    ) => {
      try {
        if (
          request.payload.input.quantity.length < 11 ||
          !request.payload.input.quantity.includes('.')
        ) {
          throw new Error('Invalid quantity format')
        }

        const ethTx = {
          ethAddress: request.payload.input.ethAddress,
          quantity: BigNumber.from(
            formatterUtil.formatLibreVmpxToEthVmpx(
              request.payload.input.quantity
            )
          )
        }

        const {
          gasLimit,
          adjustedWeiGasPrice,
          vmpxTrxCost,
          weiGasPrice,
          ...rest
        } = await trxAdapterUtil.estimateTrxCost(ethTx)
        const response = {
          gasLimit: gasLimit.toString(),
          adjustedWeiGasPrice: adjustedWeiGasPrice.toString(),
          vmpxTrxCost: vmpxTrxCost.toString(),
          weiGasPrice: weiGasPrice.toString(),
          ...rest
        }

        return { res: !!response, data: response }
      } catch (e) {
        throw Boom.badRequest(`Error when trying to estime tx cost (${e})`)
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          input: Joi.object({
            ethAddress: Joi.string().required(),
            quantity: Joi.string().required()
          }).required()
        }).options({ stripUnknown: true })
      }
    }
  })
}
