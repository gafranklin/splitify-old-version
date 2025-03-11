/*
Utility functions for generating payment information and deep links to payment apps.
*/

interface PaymentLinkOptions {
  amount: string
  receiver: string // Username, phone or email
  note?: string
  currency?: string // Default USD
}

/**
 * Generates a Venmo payment deep link
 */
export function generateVenmoLink({
  amount,
  receiver,
  note = "",
  currency = "USD"
}: PaymentLinkOptions): string {
  // Remove any @ symbol from the username if present
  const cleanReceiver = receiver.startsWith("@") ? receiver.slice(1) : receiver

  // Encode the note for URL
  const encodedNote = encodeURIComponent(note)

  // Generate the Venmo deep link
  // Format: venmo://paycharge?txn=pay&recipients=USERNAME&amount=XX&note=NOTE
  return `venmo://paycharge?txn=pay&recipients=${cleanReceiver}&amount=${amount}&note=${encodedNote}`
}

/**
 * Generates a PayPal payment link
 */
export function generatePayPalLink({
  amount,
  receiver,
  note = "",
  currency = "USD"
}: PaymentLinkOptions): string {
  // Encode the note for URL
  const encodedNote = encodeURIComponent(note)

  // Generate the PayPal payment link
  // Format: https://www.paypal.com/paypalme/USERNAME/XX
  // If receiver includes @ (email), use a different format
  if (receiver.includes("@")) {
    return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
      receiver
    )}&amount=${amount}&item_name=${encodedNote}&currency_code=${currency}`
  }

  // For PayPal.me links
  const cleanReceiver = receiver.startsWith("@") ? receiver.slice(1) : receiver
  return `https://www.paypal.com/paypalme/${cleanReceiver}/${amount}`
}

/**
 * Generates a Zelle payment information
 * Note: Zelle doesn't support deep links, so we just return the info
 */
export function generateZelleInfo({
  amount,
  receiver,
  note = ""
}: PaymentLinkOptions): {
  receiver: string
  amount: string
  note: string
} {
  return {
    receiver,
    amount,
    note
  }
}

/**
 * Generates a Cash App payment deep link
 */
export function generateCashAppLink({
  amount,
  receiver,
  note = "",
  currency = "USD"
}: PaymentLinkOptions): string {
  // Remove any $ symbol from the username if present
  const cleanReceiver = receiver.startsWith("$") ? receiver.slice(1) : receiver

  // Encode the note for URL
  const encodedNote = encodeURIComponent(note)

  // Generate the Cash App deep link
  // Format: https://cash.app/$cashtag/XX
  return `https://cash.app/$${cleanReceiver}/${amount}`
}

/**
 * Formats a payment amount with currency symbol
 */
export function formatPaymentAmount(
  amount: string,
  currency: string = "USD"
): string {
  const numAmount = parseFloat(amount)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(numAmount)
}

/**
 * Generates a payment reference code for manual tracking
 */
export function generatePaymentReference(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed potentially confusing characters like O, 0, 1, I
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}
