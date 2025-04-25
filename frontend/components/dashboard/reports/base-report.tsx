"use client"

import { useState } from "react"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface BaseReportProps {
  title: string
  description?: string
  dateRange?: DateRange
  isLoading?: boolean
  children: React.ReactNode
}

export function BaseReport({
  title,
  description,
  dateRange,
  isLoading = false,
  children,
}: BaseReportProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          {dateRange?.from && dateRange?.to && (
            <CardDescription>
              Données du {dateRange.from.toLocaleDateString()} au{" "}
              {dateRange.to.toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  )
} 