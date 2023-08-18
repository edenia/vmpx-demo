export interface HyperionAction {
  block: number
  timestamp: string
  contract: string
  action: string
  actors: string
  notified: string
  transaction_id: string
  data: {
    quantity: string
    memo: string
  }
}

export interface EthEvent {
  blockNumber: number
  blockHash: string
  transactionIndex: number
  address: string
  transactionHash: string
}
