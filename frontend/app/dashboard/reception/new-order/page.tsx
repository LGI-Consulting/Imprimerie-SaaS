"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Upload, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Form schema with file validation
const formSchema = z.object({
  clientId: z.string({
    required_error: "Please select a client",
  }),
  orderType: z.string({
    required_error: "Please select an order type",
  }),
  size: z.string().optional(),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be a positive number",
  }),
  paperType: z.string().optional(),
  finishType: z.string().optional(),
  dueDate: z.date({
    required_error: "Please select a due date",
  }),
  notes: z.string().optional(),
  rush: z.boolean().default(false),
  proofRequired: z.boolean().default(false),
  designUpload: z.boolean().default(false),
})

type OrderFormValues = z.infer<typeof formSchema>

// Sample client data for dropdown
const clients = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Emily Davis" },
  { id: "5", name: "David Wilson" },
]

// Sample printing options
const orderTypes = [
  "Business Cards",
  "Flyers",
  "Brochures",
  "Posters",
  "Banners",
  "Postcards",
  "Stickers",
  "Custom Order",
]

const paperTypes = ["Gloss", "Matte", "Uncoated", "Recycled", "Cardstock", "Bond", "Specialty"]

const finishTypes = [
  "None",
  "Gloss Coating",
  "Matte Coating",
  "UV Coating",
  "Lamination",
  "Foil Stamping",
  "Die Cutting",
  "Embossing",
]

const sizeOptions = {
  "Business Cards": ['Standard (3.5" x 2")', 'Square (2.5" x 2.5")', 'Slim (3.5" x 1.5")'],
  Flyers: ['Letter (8.5" x 11")', 'Half Letter (5.5" x 8.5")', 'Legal (8.5" x 14")'],
  Brochures: ['Tri-fold (8.5" x 11")', 'Bi-fold (8.5" x 11")', 'Z-fold (8.5" x 11")'],
  Posters: ['Small (11" x 17")', 'Medium (18" x 24")', 'Large (24" x 36")'],
  Banners: ["Small (2' x 4')", "Medium (3' x 6')", "Large (4' x 8')"],
  Postcards: ['Standard (4" x 6")', 'Large (5" x 7")', 'Extra Large (6" x 9")'],
  Stickers: ['Small (2" x 2")', 'Medium (3" x 3")', 'Large (4" x 4")'],
  "Custom Order": ["Custom"],
}

export default function NewOrderPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      orderType: "",
      quantity: "1",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      rush: false,
      proofRequired: true,
      designUpload: false,
    },
  })

  const selectedOrderType = form.watch("orderType")

  function onSubmit(values: OrderFormValues) {
    setIsSubmitting(true)
    // In a real app, this would be an API call
    console.log(values)
    console.log("Uploaded files:", uploadedFiles)

    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Order created successfully",
        description: "The new print order has been created.",
      })

      // Reset form
      form.reset()
      setUploadedFiles([])
      setActiveTab("details")
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateEstimatedPrice = () => {
    // This would be a more complex calculation in a real app
    const basePrice =
      {
        "Business Cards": 25,
        Flyers: 40,
        Brochures: 75,
        Posters: 50,
        Banners: 100,
        Postcards: 30,
        Stickers: 35,
        "Custom Order": 60,
      }[selectedOrderType] || 0

    const quantity = Number(form.watch("quantity") || 1)
    const rushFee = form.watch("rush") ? 25 : 0

    return basePrice * Math.max(1, Math.floor(quantity / 100)) + rushFee
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create New Order</h2>
        <p className="text-muted-foreground">Create a new print order for a client.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="files">Design Files</TabsTrigger>
          <TabsTrigger value="summary">Order Summary</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                  <CardDescription>Enter the details for this print order.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      name="orderType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Type*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select order type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {orderTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedOrderType && (
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sizeOptions[selectedOrderType as keyof typeof sizeOptions]?.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity*</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paperType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paper Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select paper type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paperTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                      name="finishType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Finish Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select finish type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {finishTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="rush"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Rush Order</FormLabel>
                            <FormDescription>Mark this order as rush for expedited processing</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="proofRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Proof Required</FormLabel>
                            <FormDescription>Client needs to approve before final printing</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions or details about the order"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={() => setActiveTab("summary")}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("files")}>
                    Continue to Files
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Design Files</CardTitle>
                  <CardDescription>
                    Upload the design files for this print order or indicate if the client will provide them later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full gap-4">
                    <FormField
                      control={form.control}
                      name="designUpload"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Design Ready for Upload</FormLabel>
                            <FormDescription>Toggle if you have design files to upload now</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("designUpload") && (
                      <div className="grid gap-4">
                        <div className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-8">
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <h3 className="text-lg font-medium">Drop your files here or click to upload</h3>
                            <p className="text-sm text-muted-foreground">
                              Supported formats: PDF, AI, PSD, JPG, PNG, TIFF (max 50MB)
                            </p>
                            <label htmlFor="file-upload" className="mt-2">
                              <Button type="button" variant="secondary" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Select Files
                              </Button>
                              <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept=".pdf,.ai,.psd,.jpg,.jpeg,.png,.tiff"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="rounded-lg border p-4">
                            <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
                            <div className="space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between rounded-md bg-muted p-2">
                                  <div className="flex items-center overflow-hidden">
                                    <span className="truncate text-sm">{file.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </Badge>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={() => setActiveTab("details")}>
                    Back to Details
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("summary")}>
                    Continue to Summary
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review the order details before submitting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                          <p>{clients.find((c) => c.id === form.watch("clientId"))?.name || "Not selected"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Order Type</h3>
                          <p>{form.watch("orderType") || "Not selected"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                          <p>{form.watch("size") || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                          <p>{form.watch("quantity") || "1"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Paper Type</h3>
                          <p>{form.watch("paperType") || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Finish Type</h3>
                          <p>{form.watch("finishType") || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                          <p>{form.watch("dueDate") ? format(form.watch("dueDate"), "PPP") : "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Special Requirements</h3>
                          <div className="flex flex-wrap gap-2">
                            {form.watch("rush") && <Badge variant="secondary">Rush Order</Badge>}
                            {form.watch("proofRequired") && <Badge variant="secondary">Proof Required</Badge>}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Files</h3>
                        {form.watch("designUpload") ? (
                          uploadedFiles.length > 0 ? (
                            <div className="mt-1 space-y-1">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center">
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                  <span className="text-sm">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No files uploaded yet</p>
                          )
                        ) : (
                          <p>Client will provide design files</p>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                        <p className="whitespace-pre-line">{form.watch("notes") || "No additional notes"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 text-lg font-medium">Estimated Price</h3>
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm text-muted-foreground">Based on your selections</p>
                      <p className="text-2xl font-bold">${calculateEstimatedPrice().toFixed(2)}</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      This is an estimate. Final pricing may vary based on additional requirements.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={() => setActiveTab("files")}>
                    Back to Files
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Order..." : "Create Order"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
