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
import { inviteParticipantAction } from "@/actions/db/participants-actions"

// Define the form schema with Zod
const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  displayName: z.string().optional(),
  role: z.enum(["organizer", "member"]).default("member")
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

interface InviteFormProps {
  eventId: string
  className?: string
  onSuccess?: () => void
}

export default function InviteForm({
  eventId,
  className,
  onSuccess
}: InviteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      displayName: "",
      role: "member"
    }
  })

  const onSubmit = async (data: InviteFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await inviteParticipantAction({
        eventId,
        email: data.email,
        displayName: data.displayName,
        role: data.role
      })

      if (response.isSuccess) {
        form.reset()
        router.refresh()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        console.error("Failed to send invitation:", response.message)
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                An invitation will be sent to this email address.
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
                A name to identify this person in the event.
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
            Send Invitation
          </Button>
        </div>
      </form>
    </Form>
  )
}
