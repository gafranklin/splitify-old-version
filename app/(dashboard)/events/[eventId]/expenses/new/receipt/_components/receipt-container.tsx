"use server"

import { ReceiptPageContent } from "./receipt-page-content"

interface ReceiptContainerProps {
  eventId: string
  expenseId: string
}

export async function ReceiptContainer({
  eventId,
  expenseId
}: ReceiptContainerProps) {
  return <ReceiptPageContent eventId={eventId} expenseId={expenseId} />
}
