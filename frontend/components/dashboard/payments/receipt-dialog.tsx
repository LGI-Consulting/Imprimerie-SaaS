"use client"

import { useState, useRef } from "react"
import ReactToPrint from "react-to-print"
import { Download, Printer, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: {
    id: string
    clientName: string
    date: string
    amount: number
    method: string
    status: string
    email?: string
    address?: string
    description?: string
    invoiceNumber?: string
  }
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    logo: string
  }
}

export function ReceiptDialog({ open, onOpenChange, payment, companyInfo }: ReceiptDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Handle print receipt
  const handlePrint = () => {
    setIsGenerating(true)
  }

  // Handle download receipt as PDF
  const handleDownload = () => {
    setIsGenerating(true)
    // This will trigger the print dialog which can be used to save as PDF
    if (receiptRef.current) {
      window.print()
    }
    setIsGenerating(false)
  }

  // Generate receipt number
  const receiptNumber = `R-${payment.id.replace("PAY-", "")}`

  // Format date
  const formattedDate = new Date(payment.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Payment Receipt</DialogTitle>
          <div className="flex items-center gap-2">
            <ReactToPrint
              trigger={() => (
                <Button variant="outline" size="icon" disabled={isGenerating}>
                  <Printer className="h-4 w-4" />
                  <span className="sr-only">Print Receipt</span>
                </Button>
              )}
              content={() => receiptRef.current}
              onBeforeGetContent={() => {
                setIsGenerating(true)
                return new Promise<void>((resolve) => {
                  setTimeout(() => {
                    resolve()
                  }, 200)
                })
              }}
              onAfterPrint={() => {
                setIsGenerating(false)
              }}
            />
            <Button variant="outline" size="icon" onClick={handleDownload} disabled={isGenerating}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download Receipt</span>
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share Receipt</span>
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Receipt Content */}
        <div ref={receiptRef} className="bg-white p-6 rounded-lg" data-receipt-content>
          <div className="flex flex-col space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <img src={companyInfo.logo || "/placeholder.svg"} alt={companyInfo.name} className="h-12 w-auto mb-2" />
                <h2 className="text-xl font-bold">{companyInfo.name}</h2>
                <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
                <p className="text-sm text-muted-foreground">{companyInfo.phone}</p>
                <p className="text-sm text-muted-foreground">{companyInfo.email}</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold">Receipt</h3>
                <p className="text-sm font-medium">#{receiptNumber}</p>
                <p className="text-sm text-muted-foreground mt-2">Date: {formattedDate}</p>
                {payment.invoiceNumber && (
                  <p className="text-sm text-muted-foreground">Invoice: #{payment.invoiceNumber}</p>
                )}
                <Badge variant="outline" className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Client Info */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{payment.clientName}</p>
              {payment.email && <p className="text-sm text-muted-foreground">{payment.email}</p>}
              {payment.address && <p className="text-sm text-muted-foreground">{payment.address}</p>}
            </div>

            <Separator />

            {/* Payment Details */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Payment Details:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID:</p>
                  <p>{payment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method:</p>
                  <p>{payment.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date:</p>
                  <p>{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status:</p>
                  <p>{payment.status}</p>
                </div>
              </div>
            </div>

            {payment.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description:</h3>
                  <p className="text-sm">{payment.description}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Payment Summary */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Total Amount:</p>
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(payment.amount)}</p>
              </div>
            </div>

            <Separator />

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
              <p className="mt-1">{companyInfo.website}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
