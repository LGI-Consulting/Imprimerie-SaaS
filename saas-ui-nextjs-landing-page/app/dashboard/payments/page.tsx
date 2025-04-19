"use client"

import { useState } from "react"
import { Search, Plus, Eye, Receipt, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddPaymentDialog } from "@/components/dashboard/payments/add-payment-dialog"
import { ViewPaymentDialog } from "@/components/dashboard/payments/view-payment-dialog"
import { ReceiptDialog } from "@/components/dashboard/payments/receipt-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Sample data for payments
const paymentsData = [
  {
    id: "PAY-001",
    clientName: "John Smith",
    email: "john.smith@example.com",
    address: "123 Main St, New York, NY 10001",
    date: "2023-04-15",
    amount: 250.0,
    method: "Credit Card",
    status: "Completed",
    description: "Payment for Order #1234",
    invoiceNumber: "INV-1234",
  },
  {
    id: "PAY-002",
    clientName: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    date: "2023-04-16",
    amount: 175.5,
    method: "Bank Transfer",
    status: "Processing",
    description: "Monthly subscription fee",
  },
  {
    id: "PAY-003",
    clientName: "Michael Brown",
    email: "michael.brown@example.com",
    date: "2023-04-17",
    amount: 320.75,
    method: "Cash",
    status: "Completed",
    description: "Payment for services rendered",
    invoiceNumber: "INV-1236",
  },
  {
    id: "PAY-004",
    clientName: "Emily Davis",
    email: "emily.davis@example.com",
    date: "2023-04-18",
    amount: 450.0,
    method: "Credit Card",
    status: "Completed",
    description: "Payment for Order #1237",
    invoiceNumber: "INV-1237",
  },
  {
    id: "PAY-005",
    clientName: "David Wilson",
    email: "david.wilson@example.com",
    date: "2023-04-19",
    amount: 125.25,
    method: "Bank Transfer",
    status: "Failed",
    description: "Payment for Order #1238",
  },
  {
    id: "PAY-006",
    clientName: "Lisa Martinez",
    email: "lisa.martinez@example.com",
    date: "2023-04-20",
    amount: 275.0,
    method: "Cash",
    status: "Completed",
    description: "Advance payment for services",
    invoiceNumber: "INV-1239",
  },
  {
    id: "PAY-007",
    clientName: "Robert Taylor",
    email: "robert.taylor@example.com",
    date: "2023-04-21",
    amount: 190.5,
    method: "Credit Card",
    status: "Processing",
    description: "Payment for Order #1240",
  },
]

// Company information for receipt
const companyInfo = {
  name: "Acme Corporation",
  address: "456 Business Ave, Suite 200, San Francisco, CA 94107",
  phone: "(555) 987-6543",
  email: "billing@acmecorp.com",
  website: "www.acmecorp.com",
  logo: "/placeholder.svg?height=48&width=120",
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState(paymentsData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isViewPaymentOpen, setIsViewPaymentOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<(typeof paymentsData)[0] | null>(null)

  // Filter payments based on search query
  const filteredPayments = payments.filter((payment) => {
    return (
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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

  // Method badge color mapping
  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "bank transfer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cash":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Handle view payment
  const handleViewPayment = (payment: (typeof paymentsData)[0]) => {
    setSelectedPayment(payment)
    setIsViewPaymentOpen(true)
  }

  // Handle view receipt
  const handleViewReceipt = (payment: (typeof paymentsData)[0]) => {
    setSelectedPayment(payment)
    setIsReceiptOpen(true)
  }

  // Handle delete payment
  const handleDeleteClick = (payment: (typeof paymentsData)[0]) => {
    setSelectedPayment(payment)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete payment
  const confirmDelete = () => {
    if (selectedPayment) {
      setPayments(payments.filter((payment) => payment.id !== selectedPayment.id))
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle add payment
  const handleAddPayment = (newPayment: Omit<(typeof paymentsData)[0], "id">) => {
    // Generate a new payment ID
    const paymentIds = payments.map((payment) => Number.parseInt(payment.id.replace("PAY-", "")))
    const maxId = Math.max(...paymentIds)
    const newId = `PAY-${(maxId + 1).toString().padStart(3, "0")}`

    setPayments([...payments, { ...newPayment, id: newId }])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Manage and track all client payments</p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => setIsAddPaymentOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search payments..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.clientName}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getMethodColor(payment.method)}>
                          {payment.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Payment"
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Receipt"
                            onClick={() => handleViewReceipt(payment)}
                            disabled={payment.status.toLowerCase() !== "completed"}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Payment"
                            onClick={() => handleDeleteClick(payment)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <AddPaymentDialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen} onAddPayment={handleAddPayment} />

      {/* View Payment Dialog */}
      {selectedPayment && (
        <ViewPaymentDialog
          open={isViewPaymentOpen}
          onOpenChange={setIsViewPaymentOpen}
          payment={selectedPayment}
          onViewReceipt={() => {
            setIsViewPaymentOpen(false)
            setIsReceiptOpen(true)
          }}
        />
      )}

      {/* Receipt Dialog */}
      {selectedPayment && (
        <ReceiptDialog
          open={isReceiptOpen}
          onOpenChange={setIsReceiptOpen}
          payment={selectedPayment}
          companyInfo={companyInfo}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment
              {selectedPayment && <span className="font-medium"> {selectedPayment.id}</span>} and remove its data from
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
