"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SettlementGraphSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-full max-w-[250px]" />
      </div>

      <div className="flex h-[300px] w-full items-center justify-center rounded-md border">
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
