export const Operation = {
  pegin: 'peg-in',
  pegout: 'peg-out'
} as const

export type OperationType = (typeof Operation)[keyof typeof Operation]

export const Status = {
  pending: 'pending',
  failed: 'failed',
  completed: 'completed'
} as const

export type StatusType = keyof typeof Status

export interface Queue {
  tx_hash: string
  operation: OperationType
  fromto: string
  quantity: string
  status: StatusType
  created_at?: Date
  updated_at?: Date
  block_number?: number
}
