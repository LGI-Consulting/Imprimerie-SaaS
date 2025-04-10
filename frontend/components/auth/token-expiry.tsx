"use client"

import { useEffect, useState } from "react"
import { Clock, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function TokenExpiry() {
  const { timeUntilExpiry, refreshToken } = useAuth()
  const [formattedTime, setFormattedTime] = useState<string>("")

  useEffect(() => {
    if (!timeUntilExpiry) {
      setFormattedTime("Expired")
      return
    }

    const minutes = Math.floor(timeUntilExpiry / 60000)
    const seconds = Math.floor((timeUntilExpiry % 60000) / 1000)
    setFormattedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
  }, [timeUntilExpiry])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>Session expires in: {formattedTime}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refreshToken} disabled={!timeUntilExpiry}>
        <RefreshCw className="h-3 w-3" />
        <span className="sr-only">Refresh token</span>
      </Button>
    </div>
  )
}
