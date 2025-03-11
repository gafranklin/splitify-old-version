"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  PlusCircle,
  Loader2,
  AlertCircle,
  Edit,
  Trash
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface PaymentMethodProps {
  paymentMethods: PaymentMethod[]
  isLoading?: boolean
  onAddPaymentMethod?: () => void
  onUpdateDefault?: (id: string) => Promise<void>
  onDeletePaymentMethod?: (id: string) => Promise<void>
}

export function PaymentMethod({
  paymentMethods = [],
  isLoading = false,
  onAddPaymentMethod,
  onUpdateDefault,
  onDeletePaymentMethod
}: PaymentMethodProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(paymentMethods.find(pm => pm.isDefault)?.id || null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDefaultChange = async () => {
    if (!selectedPaymentMethod || !onUpdateDefault) return

    setIsUpdating(true)
    try {
      await onUpdateDefault(selectedPaymentMethod)
      toast.success("Default payment method updated")
    } catch (error) {
      console.error("Error updating default payment method:", error)
      toast.error("Failed to update default payment method")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId || !onDeletePaymentMethod) return

    setIsDeleting(true)
    try {
      await onDeletePaymentMethod(deletingId)
      toast.success("Payment method removed")
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast.error("Failed to delete payment method")
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
    setShowDeleteDialog(true)
  }

  const getBrandIcon = (brand: string) => {
    // In a real implementation, you would return specific card brand icons
    return <CreditCard className="size-5" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods for subscription billing
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CreditCard className="text-muted-foreground mx-auto mb-3 size-10" />
            <p className="text-muted-foreground mb-3 text-sm">
              No payment methods found
            </p>
            <Button onClick={onAddPaymentMethod} disabled={!onAddPaymentMethod}>
              <PlusCircle className="mr-2 size-4" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <RadioGroup
              value={selectedPaymentMethod || undefined}
              onValueChange={setSelectedPaymentMethod}
              className="space-y-3"
            >
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className="flex items-center justify-between space-x-2 rounded-md border p-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label
                      htmlFor={method.id}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      {getBrandIcon(method.brand)}
                      <div>
                        <p>
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                    </Label>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => confirmDelete(method.id)}
                  >
                    <Trash className="text-muted-foreground size-4" />
                  </Button>
                </div>
              ))}
            </RadioGroup>

            {selectedPaymentMethod && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={onAddPaymentMethod}
                  disabled={!onAddPaymentMethod}
                >
                  <PlusCircle className="mr-2 size-4" />
                  Add New
                </Button>
                <Button
                  disabled={
                    isUpdating ||
                    !onUpdateDefault ||
                    paymentMethods.find(pm => pm.id === selectedPaymentMethod)
                      ?.isDefault
                  }
                  onClick={handleDefaultChange}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Set as Default"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && paymentMethods.length > 0 && (
          <Alert className="mt-6">
            <AlertCircle className="size-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Your default payment method will be used for all subscription
              charges.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function PaymentMethodSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-1 h-5 w-60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}
