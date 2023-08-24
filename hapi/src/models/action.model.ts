export interface HyperionAction {
  block: number
  timestamp: string
  contract: string
  action: string
  actors: string
  notified: string
  transaction_id: string
  data: {
    account: string
    quantity: string
    eth_address: string
  }
}

export interface EthEvent {
  blockNumber: number
  blockHash: string
  transactionIndex: number
  address: string
  transactionHash: string
}
