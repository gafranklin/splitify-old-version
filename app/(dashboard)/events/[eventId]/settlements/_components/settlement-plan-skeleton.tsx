"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SettlementPlanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-full max-w-[250px]" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
