"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SettlementGraphSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
      </div>

      <div className="bg-muted/30 flex h-[300px] items-center justify-center rounded-lg">
        <Skeleton className="size-[250px] rounded-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
