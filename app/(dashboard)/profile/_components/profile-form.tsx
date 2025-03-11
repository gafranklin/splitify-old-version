"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User } from "@clerk/nextjs/server"
import { useUser } from "@clerk/nextjs"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfileAction } from "@/actions/db/profiles-actions"
import { ProfileWithPermissions } from "@/types"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters."
  })
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  profile: ProfileWithPermissions | null
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  // Default form values
  const defaultValues: Partial<ProfileFormValues> = {
    displayName: user?.fullName || ""
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues
  })

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.id) return

    setIsLoading(true)

    try {
      const result = await updateProfileAction(user.id, {
        // In this implementation, we're just using Clerk's user data
        // If you want to store additional profile fields in your database,
        // you would add them here
      })

      if (result.isSuccess) {
        toast.success("Profile updated successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-muted-foreground text-sm">
                  Update your personal information
                </p>
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your display name"
                        disabled={true}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is managed by Clerk. Update it in your Clerk profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm">Email:</p>
                <p className="text-sm font-medium">
                  {user?.emailAddresses[0]?.emailAddress || "No email found"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  Membership Status:
                </p>
                <p className="text-sm font-medium capitalize">
                  {profile?.membership || "Free"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => router.push("/settings")}
              variant="outline"
            >
              Manage Subscription
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
