export interface ParticipantSuggestion {
  id: string
  userId: string
  displayName: string
  imageUrl?: string
  score: number
}

export interface ExpenseSuggestion {
  id: string
  title: string
  amount: number
  category?: string
  score: number
}

export type SuggestionCategory =
  | "participant"
  | "expense"
  | "vendor"
  | "payment"
