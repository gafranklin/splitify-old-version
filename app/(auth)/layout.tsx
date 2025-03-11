/*
This server layout provides a centered layout for (auth) pages.
*/

"use server"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="from-background to-muted/30 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b p-4 md:p-8">
      <div className="absolute left-8 top-8">
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link href="/">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="mb-2">
          <Image
            src="/logo.svg"
            alt="Splitify"
            width={48}
            height={48}
            className="size-12"
          />
        </Link>
        <h1 className="text-2xl font-bold">Splitify</h1>
        <p className="text-muted-foreground text-sm">
          Split expenses with friends and family
        </p>
      </div>

      <div className="bg-card w-full max-w-md rounded-lg border p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
