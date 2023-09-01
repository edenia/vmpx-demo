export const api = process.env.HAPI_HYPERION_API || 'https://testnet.libre.org'
export const startAt =
  process.env.HAPI_HYPERION_START_AT || '2023-07-31T00:00:00.000+00:00'
export const maxTimeHyperionActionSec = Number(
  process.env.HAPI_ETH_MAX_TIME_HYPERION_ACTION_SEC || 10
)

if (maxTimeHyperionActionSec > 3600) {
  throw new Error('Max safe time for hyperion action is 3600 seconds')
}

if (maxTimeHyperionActionSec < 10) {
  throw new Error('Less safe time for hyperion action is 10 seconds')
}
