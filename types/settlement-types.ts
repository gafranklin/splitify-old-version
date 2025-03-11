import { SelectParticipant, SelectEvent } from "@/db/schema"

export interface SettlementWithRelations {
  id: string
  eventId: string
  fromParticipantId: string
  toParticipantId: string
  amount: string
  status: "pending" | "requested" | "completed" | "cancelled"
  paymentMethod?: "cash" | "venmo" | "paypal" | "zelle" | "other" | null
  paymentReference?: string | null
  notes?: string | null
  completedAt?: Date | null
  requestedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  fromParticipant?: SelectParticipant
  toParticipant?: SelectParticipant
  event?: SelectEvent
}

export interface SettlementPlan {
  settlements: SettlementWithRelations[]
  totalAmount: string
  participantBalances: Record<string, string>
}

export interface SettlementRequest {
  eventId: string
  fromParticipantId: string
  toParticipantId: string
  amount: string
  notes?: string
}

export interface SettlementUpdate {
  status?: "pending" | "requested" | "completed" | "cancelled"
  paymentMethod?: "cash" | "venmo" | "paypal" | "zelle" | "other" | null
  paymentReference?: string | null
  notes?: string | null
  completedAt?: Date | null
  requestedAt?: Date | null
}

export interface SettlementOptimizationResult {
  settlements: {
    fromParticipantId: string
    toParticipantId: string
    amount: string
  }[]
  totalTransactions: number
  originalTransactions: number
}
