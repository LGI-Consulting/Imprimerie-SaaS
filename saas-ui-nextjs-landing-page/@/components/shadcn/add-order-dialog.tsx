"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample client data for dropdown
const clients = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Emily Davis" },
  { id: "5", name: "David Wilson" },
]

// Sample inventory items for dropdown
const inventoryItems = [
  { id: "1", name: "Cotton Fabric", price: 5.99 },
  { id: "2", name: "Polyester Blend", price: 4.5 },
  { id: "3", name: "Denim", price: 8.75 },
  { id: "4", name: "Silk", price: 15.99 },
  { id: "5", name: "Wool", price: 12.25 },
  { id: "6", name: "Linen", price: 9.5 },
  { id: "7", name: "Leather", price: 22.99 },
  { id: "8", name: "Buttons (pack of 100)", price: 3.99 },
]

// Form schema
const formSchema = z.object({
  clientId: z.string({
    required_error: "Please select a client",
  }),
  orderDate: z.date({
    required_error: "Please select a date",
  }),
  dueDate: z.date({
    required_error: "Please select a due date",
  }),
  status: z.string({
    required_error: "Please select a status",
  }),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z.string({
          required_error: "Please select an item",
        }),
        quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Quantity must be a positive number",
        }),
        price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
          message: "Price must be a non-negative number",
        }),
      }),
    )
    .min(1, {
      message: "Please add at least one item to the order",
    }),
})

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddOrderDialog({ open, onOpenChange }: AddOrderDialogProps) {
  const [orderItems, setOrderItems] = useState<{ id: string; itemId: string; quantity: string; price: string }[]>([
    { id: crypto.randomUUID(), itemId: "", quantity: "1", price: "" },
  ])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      orderDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: "pending",
      notes: "",
      items: [{ itemId: "", quantity: "1", price: "" }],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onOpenChange(false)
    form.reset()
    setOrderItems([{ id: crypto.randomUUID(), itemId: "", quantity: "1", price: "" }])
  }

  const addItem = () => {
    setOrderItems([...orderItems, { id: crypto.randomUUID(), itemId: "", quantity: "1", price: "" }])
  }

  const removeItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((item) => item.id !== id))

      // Update form values
      const currentItems = form.getValues("items")
      const updatedItems = currentItems.filter((_, index) => orderItems[index].id !== id)
      form.setValue("items", updatedItems)
    }
  }

  const updateItemPrice = (index: number, itemId: string) => {
    const selectedItem = inventoryItems.find((item) => item.id === itemId)
    if (selectedItem) {
      const updatedItems = [...orderItems]
      updatedItems[index].price = selectedItem.price.toString()
      setOrderItems(updatedItems)

      // Update form values
      form.setValue(`items.${index}.price`, selectedItem.price.toString())
    }
  }

  // Calculate total
  const calculateTotal = () => {
    return orderItems
      .reduce((total, item, index) => {
        const quantity = Number(form.getValues(`items.${index}.quantity`) || 0)
        const price = Number(form.getValues(`items.${index}.price`) || 0)
        return total + quantity * price
      }, 0)
      .toFixed(2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Enter the order details below. Required fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Order Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Order Items*</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    updateItemPrice(index, value)
                                  }}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {inventoryItems.map((invItem) => (
                                      <SelectItem key={invItem.id} value={invItem.id}>
                                        {invItem.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <FormControl>
                                  <Input type="number" min="1" className="w-[80px]" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem className="space-y-0 mb-0">
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      $
                                    </span>
                                    <Input className="pl-7 w-[100px]" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          $
                          {(
                            Number(form.watch(`items.${index}.quantity`) || 0) *
                            Number(form.watch(`items.${index}.price`) || 0)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={orderItems.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="font-bold">${calculateTotal()}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional information about the order" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Any additional information about this order</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
