"use client"

import { AlertTriangle, X } from "lucide-react"
import { Alert, AlertDescription } from "#components/shadcn/ui/alert"
import { Button } from "#components/shadcn/ui/button"

interface UnauthorizedAlertProps {
  onDismiss: () => void
}

export function UnauthorizedAlert({ onDismiss }: UnauthorizedAlertProps) {
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
      <div className="flex items-start justify-between">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <AlertDescription className="text-sm font-medium">You do not have access to this section</AlertDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onDismiss} className="h-6 w-6 p-0 hover:bg-amber-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </Alert>
  )
}
