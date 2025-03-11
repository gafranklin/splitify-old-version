/*
Helper functions for payment notification management.
*/

import { SelectParticipant, SelectSettlement } from "@/db/schema"

/**
 * Generates a shareable payment request message
 */
export function generatePaymentRequestMessage(
  settlement: SelectSettlement,
  fromParticipant: SelectParticipant,
  toParticipant: SelectParticipant,
  eventName: string,
  paymentReference: string
): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(parseFloat(settlement.amount.toString()))

  return `Payment Request: ${fromParticipant.displayName} needs to pay ${formattedAmount} to ${toParticipant.displayName} for "${eventName}". Reference: ${paymentReference}`
}

/**
 * Generates an email subject for payment request
 */
export function generatePaymentEmailSubject(
  eventName: string,
  paymentReference: string
): string {
  return `Payment Request for ${eventName} (Ref: ${paymentReference})`
}

/**
 * Generates a detailed email body for a payment request
 */
export function generatePaymentEmailBody(
  settlement: SelectSettlement,
  fromParticipant: SelectParticipant,
  toParticipant: SelectParticipant,
  eventName: string,
  paymentReference: string,
  paymentLink?: string
): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(parseFloat(settlement.amount.toString()))

  let emailBody = `
Hello ${fromParticipant.displayName},

This is a payment request for ${eventName}.

Amount Due: ${formattedAmount}
To: ${toParticipant.displayName}
Reference: ${paymentReference}
`

  if (settlement.notes) {
    emailBody += `\nNotes: ${settlement.notes}\n`
  }

  if (paymentLink) {
    emailBody += `\nYou can make this payment using the following link: ${paymentLink}\n`
  }

  emailBody += `
Please include the reference number (${paymentReference}) when making your payment to help us track it.

Thank you!
`

  return emailBody
}

/**
 * Generates a payment confirmation message
 */
export function generatePaymentConfirmationMessage(
  settlement: SelectSettlement,
  fromParticipant: SelectParticipant,
  toParticipant: SelectParticipant,
  paymentMethod: string
): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(parseFloat(settlement.amount.toString()))

  return `Payment Confirmation: ${fromParticipant.displayName} has paid ${formattedAmount} to ${toParticipant.displayName} via ${paymentMethod}. Reference: ${settlement.paymentReference || "N/A"}`
}

/**
 * Generates a shareable link with payment details
 * (for a hypothetical page where payment details can be viewed)
 */
export function generatePaymentDetailsLink(
  eventId: string,
  settlementId: string,
  host: string
): string {
  return `${host}/events/${eventId}/settlements/${settlementId}`
}

/**
 * Creates an object URL for a downloadable payment receipt
 */
export function createPaymentReceiptFile(
  settlement: SelectSettlement,
  fromParticipant: SelectParticipant,
  toParticipant: SelectParticipant,
  eventName: string
): string {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(parseFloat(settlement.amount.toString()))

  const date = settlement.completedAt
    ? new Date(settlement.completedAt).toLocaleDateString()
    : "Pending"

  const receiptText = `
PAYMENT RECEIPT

Event: ${eventName}
Date: ${date}
Amount: ${formattedAmount}
From: ${fromParticipant.displayName}
To: ${toParticipant.displayName}
Payment Method: ${settlement.paymentMethod || "N/A"}
Reference: ${settlement.paymentReference || "N/A"}
Status: ${settlement.status}

${settlement.notes ? `Notes: ${settlement.notes}` : ""}
`

  const blob = new Blob([receiptText], { type: "text/plain" })
  return URL.createObjectURL(blob)
}
