"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { addParticipantAction } from "@/actions/db/participants-actions"

// Define the form schema with Zod
const participantFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  displayName: z.string().optional(),
  role: z.enum(["organizer", "member"]).default("member")
})

type ParticipantFormValues = z.infer<typeof participantFormSchema>

interface ParticipantFormProps {
  eventId: string
  className?: string
  onSuccess?: () => void
}

export default function ParticipantForm({
  eventId,
  className,
  onSuccess
}: ParticipantFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      userId: "",
      displayName: "",
      role: "member"
    }
  })

  const onSubmit = async (data: ParticipantFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await addParticipantAction({
        eventId,
        userId: data.userId,
        displayName: data.displayName || null,
        role: data.role,
        isActive: "true"
      })

      if (response.isSuccess) {
        form.reset()
        router.refresh()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        console.error("Failed to add participant:", response.message)
        // Handle error (could add toast notification here)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter user ID" {...field} />
              </FormControl>
              <FormDescription>
                The Clerk user ID of the participant.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter display name"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A custom display name for this participant. If left blank, their
                profile name will be used.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Organizers can edit the event and manage participants.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Add Participant
          </Button>
        </div>
      </form>
    </Form>
  )
}
