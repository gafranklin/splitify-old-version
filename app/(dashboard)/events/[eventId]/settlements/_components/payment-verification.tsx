"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { SelectSettlement } from "@/db/schema"
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react"
import { updateSettlementAction } from "@/actions/db/settlements-actions"
import { toast } from "sonner"

interface PaymentVerificationProps {
  settlement: SelectSettlement
  payerName: string
}

export function PaymentVerification({
  settlement,
  payerName
}: PaymentVerificationProps) {
  const router = useRouter()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [notes, setNotes] = useState(settlement.notes || "")
  const [isLoading, setIsLoading] = useState(false)
  const [proofOpen, setProofOpen] = useState(false)

  // Determine if we have proof of payment
  const hasProof =
    settlement.paymentReference &&
    settlement.paymentReference.startsWith("http")

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const result = await updateSettlementAction(settlement.id, {
        status: "completed",
        completedAt: new Date(),
        notes: notes || undefined
      })

      if (result.isSuccess) {
        toast.success("Payment confirmed successfully")
        setIsConfirmDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.message || "Failed to confirm payment")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const result = await updateSettlementAction(settlement.id, {
        status: "cancelled",
        notes: notes || undefined
      })

      if (result.isSuccess) {
        toast.success("Payment rejected")
        setIsRejectDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.message || "Failed to reject payment")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Verify Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Verify that you have received payment of{" "}
              <span className="font-bold">
                ${parseFloat(settlement.amount).toFixed(2)}
              </span>{" "}
              from {payerName}.
            </p>

            {settlement.paymentMethod && (
              <p className="text-muted-foreground text-sm">
                Payment method:{" "}
                <span className="font-medium">{settlement.paymentMethod}</span>
                {settlement.paymentReference && !hasProof && (
                  <> (Reference: {settlement.paymentReference})</>
                )}
              </p>
            )}

            {hasProof && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setProofOpen(true)}
                >
                  <ExternalLink className="size-4" />
                  View Payment Proof
                </Button>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                <CheckCircle2 className="size-4" />
                Confirm Payment
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                <XCircle className="size-4" />
                Reject Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are confirming that you have received payment of $
              {parseFloat(settlement.amount).toFixed(2)} from {payerName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add any notes about this payment (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              You are indicating that you have not received this payment or
              there is an issue with it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a reason for rejecting this payment"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Image Dialog */}
      {hasProof && (
        <Dialog open={proofOpen} onOpenChange={setProofOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Proof</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image
                src={settlement.paymentReference || ""}
                alt="Payment proof"
                fill
                className="object-contain"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setProofOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
