"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  Edit2,
  Calendar,
  Store,
  Receipt,
  Banknote,
  PenSquare
} from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReceiptViewer } from "@/components/dashboard/receipt-viewer"
import { OCRResult, ExtendedReceipt } from "@/types"
import { updateReceiptOcrDataAction } from "@/actions/ocr-actions"

interface OCRPreviewProps {
  receipt: ExtendedReceipt
  eventId: string
  onComplete: (updatedReceipt: ExtendedReceipt) => void
}

export function OCRPreview({ receipt, eventId, onComplete }: OCRPreviewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [ocrData, setOcrData] = useState<OCRResult>(receipt.parsedOcrData || {})

  // Format and parse dates
  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return ""

    // Try to parse the date using common formats
    const formats = ["yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "MM-dd-yyyy"]

    for (const formatStr of formats) {
      const parsedDate = parse(dateStr, formatStr, new Date())
      if (isValid(parsedDate)) {
        return format(parsedDate, "yyyy-MM-dd")
      }
    }

    return dateStr
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      // Update the receipt with edited OCR data
      const updateResult = await updateReceiptOcrDataAction(receipt.id, ocrData)

      if (!updateResult.isSuccess) {
        throw new Error(updateResult.message)
      }

      toast.success("Receipt data updated successfully")
      setIsEditing(false)

      // Complete the flow with updated data
      onComplete({
        ...receipt,
        parsedOcrData: updateResult.data
      })
    } catch (error: any) {
      console.error("Error updating receipt data:", error)
      toast.error(error.message || "Failed to update receipt data")
    } finally {
      setIsSaving(false)
    }
  }

  const handleItemChange = (
    index: number,
    field: "name" | "price" | "quantity",
    value: string | number
  ) => {
    const updatedItems = [...(ocrData.items || [])]

    if (!updatedItems[index]) {
      updatedItems[index] = { name: "", price: 0 }
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "price" || field === "quantity" ? Number(value) : value
    }

    setOcrData({
      ...ocrData,
      items: updatedItems
    })
  }

  const addNewItem = () => {
    setOcrData({
      ...ocrData,
      items: [...(ocrData.items || []), { name: "", price: 0 }]
    })
  }

  const removeItem = (index: number) => {
    const updatedItems = [...(ocrData.items || [])]
    updatedItems.splice(index, 1)

    setOcrData({
      ...ocrData,
      items: updatedItems
    })
  }

  return (
    <div className="space-y-4">
      {receipt.signedUrl && (
        <ReceiptViewer imageUrl={receipt.signedUrl} className="mb-4" />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Receipt Data</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                <Check className="mr-2 size-4" />
                Done Editing
              </>
            ) : (
              <>
                <Edit2 className="mr-2 size-4" />
                Edit Data
              </>
            )}
          </Button>
        </CardHeader>

        <CardContent className="pb-0">
          <div className="space-y-4">
            {/* Merchant and Date */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Store className="mr-2 size-4" />
                  Merchant
                </Label>
                {isEditing ? (
                  <Input
                    value={ocrData.merchant || ""}
                    onChange={e =>
                      setOcrData({ ...ocrData, merchant: e.target.value })
                    }
                    placeholder="Merchant name"
                  />
                ) : (
                  <div className="bg-muted rounded p-2 text-sm">
                    {ocrData.merchant || "Not detected"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="mr-2 size-4" />
                  Date
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formatDateString(ocrData.date)}
                    onChange={e =>
                      setOcrData({ ...ocrData, date: e.target.value })
                    }
                    placeholder="Select date"
                  />
                ) : (
                  <div className="bg-muted rounded p-2 text-sm">
                    {ocrData.date || "Not detected"}
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Banknote className="mr-2 size-4" />
                  Total Amount
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={ocrData.total || ""}
                    onChange={e =>
                      setOcrData({
                        ...ocrData,
                        total: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="0.00"
                  />
                ) : (
                  <div className="bg-muted rounded p-2 text-sm">
                    {ocrData.total
                      ? `$${ocrData.total.toFixed(2)}`
                      : "Not detected"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">Tax Amount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={ocrData.taxAmount || ""}
                    onChange={e =>
                      setOcrData({
                        ...ocrData,
                        taxAmount: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="0.00"
                  />
                ) : (
                  <div className="bg-muted rounded p-2 text-sm">
                    {ocrData.taxAmount
                      ? `$${ocrData.taxAmount.toFixed(2)}`
                      : "Not detected"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">Tip Amount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={ocrData.tipAmount || ""}
                    onChange={e =>
                      setOcrData({
                        ...ocrData,
                        tipAmount: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="0.00"
                  />
                ) : (
                  <div className="bg-muted rounded p-2 text-sm">
                    {ocrData.tipAmount
                      ? `$${ocrData.tipAmount.toFixed(2)}`
                      : "Not detected"}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Receipt className="mr-2 size-4" />
                Items
              </Label>

              <div className="space-y-3">
                {(ocrData.items || []).length === 0 && (
                  <div className="text-muted-foreground py-2 text-sm">
                    No items detected
                  </div>
                )}

                {(ocrData.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center gap-2"
                  >
                    <div className="col-span-6">
                      {isEditing ? (
                        <Input
                          value={item.name}
                          onChange={e =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          placeholder="Item name"
                        />
                      ) : (
                        <div className="bg-muted rounded p-2 text-sm">
                          {item.name}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={e =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          placeholder="Qty"
                        />
                      ) : (
                        <div className="bg-muted rounded p-2 text-sm">
                          {item.quantity || 1}
                        </div>
                      )}
                    </div>

                    <div className="col-span-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={e =>
                            handleItemChange(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                        />
                      ) : (
                        <div className="bg-muted rounded p-2 text-sm">
                          ${item.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="size-8"
                        >
                          <span className="sr-only">Remove</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash-2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={addNewItem}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-plus mr-2"
                    >
                      <line x1="12" x2="12" y1="5" y2="19" />
                      <line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    Add Item
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-4">
          {isEditing ? (
            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              <Check className="mr-2 size-4" />
              Save Changes
            </Button>
          ) : (
            <Button type="button" onClick={() => onComplete(receipt)}>
              <PenSquare className="mr-2 size-4" />
              Use Receipt Data
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
