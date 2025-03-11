import { SelectParticipant } from "@/db/schema"

export interface ParticipantWithBalance extends SelectParticipant {
  balance: number
}

export interface BalanceSummary {
  totalSpent: number
  totalOwed: number
  participantsWithBalances: ParticipantWithBalance[]
}

export interface SettlementTransaction {
  fromParticipantId: string
  toParticipantId: string
  amount: number
}
