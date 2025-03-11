"use client"

import { useState } from "react"
import { toast } from "sonner"
import { generatePaymentReference } from "@/lib/payment-links"
import { SelectParticipant, SelectSettlement } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopyToClipboard, formatCurrency } from "@/lib/hooks/use-utils"
import { RefreshCw, Plus, Copy, Check, ChevronRight } from "lucide-react"
import PaymentRequest from "./payment-request"
import PaymentConfirmation from "./payment-confirmation"
import {
  generateSettlementPlanAction,
  createSettlementsFromPlanAction
} from "@/actions/db/settlements-actions"

interface SettlementPlanProps {
  eventId: string
  participants: SelectParticipant[]
  settlements: SelectSettlement[]
  balances: Record<string, string>
}

export default function SettlementPlan({
  eventId,
  participants,
  settlements,
  balances
}: SettlementPlanProps) {
  const [activeTab, setActiveTab] = useState("plan")
  const [isGenerating, setIsGenerating] = useState(false)
  const [optimizedSettlements, setOptimizedSettlements] = useState<
    | {
        fromParticipantId: string
        toParticipantId: string
        amount: string
      }[]
    | null
  >(null)
  const [selectedSettlement, setSelectedSettlement] =
    useState<SelectSettlement | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

  const { copy, isCopied } = useCopyToClipboard()

  // Find active settlements (not cancelled)
  const activeSettlements = settlements.filter(s => s.status !== "cancelled")

  // Get participant map for quick lookups
  const participantMap = participants.reduce(
    (acc, participant) => {
      acc[participant.id] = participant
      return acc
    },
    {} as Record<string, SelectParticipant>
  )

  // Group settlements by status
  const pendingSettlements = activeSettlements.filter(
    s => s.status === "pending"
  )
  const requestedSettlements = activeSettlements.filter(
    s => s.status === "requested"
  )
  const completedSettlements = activeSettlements.filter(
    s => s.status === "completed"
  )

  const handleGenerateSettlementPlan = async () => {
    setIsGenerating(true)
    try {
      const result = await generateSettlementPlanAction(eventId, balances)
      if (result.isSuccess && result.data) {
        setOptimizedSettlements(result.data.settlements)
        toast.success("Settlement plan generated")
      } else {
        toast.error(result.message || "Failed to generate settlement plan")
      }
    } catch (error) {
      toast.error("An error occurred while generating the settlement plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateSettlements = async () => {
    if (!optimizedSettlements) return

    try {
      const result = await createSettlementsFromPlanAction(
        eventId,
        optimizedSettlements
      )
      if (result.isSuccess) {
        toast.success("Settlements created successfully")
        // Refresh the page to show the new settlements
        window.location.reload()
      } else {
        toast.error(result.message || "Failed to create settlements")
      }
    } catch (error) {
      toast.error("An error occurred while creating settlements")
    }
  }

  const openRequestModal = (settlement: SelectSettlement) => {
    setSelectedSettlement(settlement)
    setIsRequestModalOpen(true)
  }

  const openConfirmationModal = (settlement: SelectSettlement) => {
    setSelectedSettlement(settlement)
    setIsConfirmationModalOpen(true)
  }

  const handleCopyReference = (reference: string | null) => {
    if (!reference) {
      const newRef = generatePaymentReference()
      copy(newRef)
      toast.success(`New reference copied: ${newRef}`)
    } else {
      copy(reference)
      toast.success("Reference copied to clipboard")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Settlement Plan</h3>
        {activeSettlements.length === 0 && (
          <Button
            size="sm"
            onClick={handleGenerateSettlementPlan}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Generate Plan
              </>
            )}
          </Button>
        )}
      </div>

      {optimizedSettlements && optimizedSettlements.length > 0 && (
        <div className="space-y-4">
          <div className="bg-background rounded-lg border p-4">
            <h4 className="mb-3 text-sm font-medium">
              Optimized Settlement Plan
            </h4>
            <div className="space-y-3">
              {optimizedSettlements.map((settlement, i) => {
                const fromParticipant =
                  participantMap[settlement.fromParticipantId]
                const toParticipant = participantMap[settlement.toParticipantId]

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <span className="font-medium">
                        {fromParticipant?.displayName || "Unknown"}
                      </span>
                      <ChevronRight className="text-muted-foreground mx-2 size-4" />
                      <span className="font-medium">
                        {toParticipant?.displayName || "Unknown"}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(settlement.amount))}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <Button onClick={handleCreateSettlements} size="sm">
                Create Settlements
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeSettlements.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingSettlements.length})
            </TabsTrigger>
            <TabsTrigger value="requested">
              Requested ({requestedSettlements.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSettlements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-4">
            {pendingSettlements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No pending settlements
              </p>
            ) : (
              pendingSettlements.map(settlement => {
                const fromParticipant =
                  participantMap[settlement.fromParticipantId]
                const toParticipant = participantMap[settlement.toParticipantId]

                return (
                  <Card key={settlement.id} className="space-y-3 p-4">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">
                        {formatCurrency(
                          parseFloat(settlement.amount.toString())
                        )}
                      </h4>
                      <PaymentStatusBadge status={settlement.status} />
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {fromParticipant?.displayName || "Unknown"}
                      </span>
                      <ChevronRight className="text-muted-foreground size-4" />
                      <span className="font-medium">
                        {toParticipant?.displayName || "Unknown"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openRequestModal(settlement)}
                      >
                        Request Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCopyReference(settlement.paymentReference)
                        }
                      >
                        {isCopied ? (
                          <Check className="mr-2 size-4" />
                        ) : (
                          <Copy className="mr-2 size-4" />
                        )}
                        {settlement.paymentReference
                          ? "Copy Reference"
                          : "Generate Reference"}
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="requested" className="mt-4 space-y-4">
            {requestedSettlements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No requested settlements
              </p>
            ) : (
              requestedSettlements.map(settlement => {
                const fromParticipant =
                  participantMap[settlement.fromParticipantId]
                const toParticipant = participantMap[settlement.toParticipantId]

                return (
                  <Card key={settlement.id} className="space-y-3 p-4">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">
                        {formatCurrency(
                          parseFloat(settlement.amount.toString())
                        )}
                      </h4>
                      <PaymentStatusBadge status={settlement.status} />
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {fromParticipant?.displayName || "Unknown"}
                      </span>
                      <ChevronRight className="text-muted-foreground size-4" />
                      <span className="font-medium">
                        {toParticipant?.displayName || "Unknown"}
                      </span>
                    </div>

                    {settlement.paymentMethod && (
                      <div className="text-muted-foreground text-xs">
                        Payment Method: {settlement.paymentMethod}
                        {settlement.paymentReference && (
                          <> • Ref: {settlement.paymentReference}</>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openConfirmationModal(settlement)}
                      >
                        Confirm Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRequestModal(settlement)}
                      >
                        Resend Request
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {completedSettlements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No completed settlements
              </p>
            ) : (
              completedSettlements.map(settlement => {
                const fromParticipant =
                  participantMap[settlement.fromParticipantId]
                const toParticipant = participantMap[settlement.toParticipantId]

                return (
                  <Card key={settlement.id} className="space-y-3 p-4">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">
                        {formatCurrency(
                          parseFloat(settlement.amount.toString())
                        )}
                      </h4>
                      <PaymentStatusBadge status={settlement.status} />
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {fromParticipant?.displayName || "Unknown"}
                      </span>
                      <ChevronRight className="text-muted-foreground size-4" />
                      <span className="font-medium">
                        {toParticipant?.displayName || "Unknown"}
                      </span>
                    </div>

                    {settlement.paymentMethod && (
                      <div className="text-muted-foreground text-xs">
                        Paid via {settlement.paymentMethod}
                        {settlement.paymentReference && (
                          <> • Ref: {settlement.paymentReference}</>
                        )}
                        {settlement.completedAt && (
                          <>
                            {" "}
                            •{" "}
                            {new Date(
                              settlement.completedAt
                            ).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      ) : (
        optimizedSettlements === null && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No settlements found. Generate a settlement plan to start.
            </p>
          </div>
        )
      )}

      {/* Payment Request Modal */}
      {selectedSettlement && (
        <PaymentRequest
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          settlement={selectedSettlement}
          fromParticipant={participantMap[selectedSettlement.fromParticipantId]}
          toParticipant={participantMap[selectedSettlement.toParticipantId]}
          eventId={eventId}
        />
      )}

      {/* Payment Confirmation Modal */}
      {selectedSettlement && (
        <PaymentConfirmation
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          settlement={selectedSettlement}
          fromParticipant={participantMap[selectedSettlement.fromParticipantId]}
          toParticipant={participantMap[selectedSettlement.toParticipantId]}
          eventId={eventId}
        />
      )}
    </div>
  )
}
