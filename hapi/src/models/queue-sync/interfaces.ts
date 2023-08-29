export const Status = {
  pending: 'pending',
  completed: 'completed'
} as const

export type StatusType = keyof typeof Status

export interface QueueSync {
  id?: string
  from_block: number
  to_block: number
  total_synced: number
  status?: StatusType
  created_at?: Date
  updated_at?: Date
}
