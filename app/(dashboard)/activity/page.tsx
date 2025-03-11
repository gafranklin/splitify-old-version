"use server"

import ActivityList from "./_components/activity-list"
import ActivityFilters from "./_components/activity-filters"
import PaymentNotifications from "./_components/payment-notifications"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ActivityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground">
          Track your recent activity and payment notifications
        </p>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="payments">Payment Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-1">
              <ActivityFilters />
            </div>
            <div className="md:col-span-3">
              <ActivityList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentNotifications />
        </TabsContent>
      </Tabs>
    </div>
  )
}
