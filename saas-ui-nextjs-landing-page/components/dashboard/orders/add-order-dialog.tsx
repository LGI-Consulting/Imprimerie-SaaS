"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, FileUp, Plus, Trash2, Upload } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Sample material types
const materialTypes = [
  { id: "bache", name: "Bâche" },
  { id: "autocollant", name: "Autocollant" },
  { id: "oneway", name: "One Way" },
  { id: "transparent", name: "Transparent" },
  { id: "dosbleu", name: "Dos Bleu" },
]

// Sample material widths by type
const materialWidths = {
  bache: [65, 100, 150, 320],
  autocollant: [50, 100, 150],
  oneway: [100, 150],
  transparent: [100, 150],
  dosbleu: [100, 150],
}

// Sample material prices per m² by type
const materialPrices = {
  bache: 3500,
  autocollant: 5000,
  oneway: 6000,
  transparent: 6000,
  dosbleu: 6000,
}

// Sample material stock levels
const materialStock = {
  bache: {
    65: 45, // 45 meters remaining
    100: 30,
    150: 20,
    320: 10,
  },
  autocollant: {
    50: 25,
    100: 20,
    150: 15,
  },
  oneway: {
    100: 15,
    150: 10,
  },
  transparent: {
    100: 12,
    150: 8,
  },
  dosbleu: {
    100: 18,
    150: 12,
  },
}

// Stock threshold for alerts
const stockThreshold = 15 // meters

// Sample additional services
const additionalServices = {
  perforation: { price: 0, available: ["bache"] },
  eyelets: { price: 100, available: ["bache"] }, // Price per eyelet
  cutting: { price: 900, available: ["autocollant"] }, // Price per m²
  lamination: { price: 1500, available: ["autocollant", "oneway", "transparent"] }, // Price per m²
}

// Sample clients data for dropdown
const clients = [
  { id: "1", name: "John Smith", phone: "678123456", email: "john@example.com" },
  { id: "2", name: "Sarah Johnson", phone: "678234567", email: "sarah@example.com" },
  { id: "3", name: "Michael Brown", phone: "678345678", email: "michael@example.com" },
  { id: "4", name: "Emily Davis", phone: "678456789", email: "emily@example.com" },
  { id: "5", name: "David Wilson", phone: "678567890", email: "david@example.com" },
]

// Sample delivery zones and pricing
const deliveryZones = [
  { id: "zone1", name: "Zone 1 (0-5km)", fee: 1000 },
  { id: "zone2", name: "Zone 2 (5-10km)", fee: 2000 },
  { id: "zone3", name: "Zone 3 (10-15km)", fee: 3000 },
  { id: "zone4", name: "Zone 4 (15km+)", fee: 5000 },
]

// Enhanced Form schema
const formSchema = z.object({
  // Client information
  clientId: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().min(1, "Client phone is required"),
  clientEmail: z.string().email("Invalid email").optional(),
  
  // Order details
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
  
  // Material details
  materialType: z.string({
    required_error: "Please select a material type",
  }),
  width: z.number({
    required_error: "Width is required",
  }).positive("Width must be positive"),
  length: z.number({
    required_error: "Length is required",
  }).positive("Length must be positive"),
  selectedWidth: z.number({
    required_error: "Please select a material width",
  }),
  
  // Finishing options
  hasPerforation: z.boolean().default(false),
  hasEyelets: z.boolean().default(false),
  eyeletCount: z.number().optional(),
  eyeletSpacing: z.string().optional(),
  hasCutting: z.boolean().default(false),
  cuttingType: z.enum(["rectangular", "custom"]).optional(),
  hasLamination: z.boolean().default(false),
  
  // Delivery
  needsDelivery: z.boolean().default(false),
  deliveryAddress: z.string().optional(),
  deliveryZone: z.string().optional(),
  deliveryFee: z.number().default(0),
  
  // Files
  hasFiles: z.boolean().default(false),
  
  // Payment
  paymentStatus: z.enum(["pending", "partial", "complete"]).default("pending"),
  advancePayment: z.number().default(0),
})

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderCreated?: (order: any) => void
}

export function AddOrderDialog({ open, onOpenChange, onOrderCreated }: AddOrderDialogProps) {
  const [clientSearch, setClientSearch] = useState("")
  const [filteredClients, setFilteredClients] = useState(clients)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isExistingClient, setIsExistingClient] = useState(false)
  
  // Calculate margin, price, etc.
  const [calculatedWidth, setCalculatedWidth] = useState<number | null>(null)
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null)
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [additionalCost, setAdditionalCost] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)
  
  // Stock tracking
  const [stockAlert, setStockAlert] = useState<string | null>(null)
  const [stockAvailable, setStockAvailable] = useState<number | null>(null)
  
  // Generate order number - in real app should come from backend
  // Using current date for sequential numbering
  const today = new Date()
  const dateString = format(today, 'yyMMdd')
  const [orderNumber, setOrderNumber] = useState(`CMD-${dateString}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      orderDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      status: "pending_payment",
      notes: "",
      materialType: "bache",
      width: 0,
      length: 0,
      selectedWidth: 0,
      hasPerforation: false,
      hasEyelets: false,
      eyeletCount: 0,
      eyeletSpacing: "standard",
      hasCutting: false,
      cuttingType: "rectangular",
      hasLamination: false,
      needsDelivery: false,
      deliveryAddress: "",
      deliveryZone: "",
      deliveryFee: 0,
      hasFiles: false,
      paymentStatus: "pending",
      advancePayment: 0,
    },
  })
  
  // Watch for form changes to calculate pricing
  const materialType = form.watch("materialType")
  const width = form.watch("width")
  const length = form.watch("length")
  const selectedWidth = form.watch("selectedWidth")
  const hasPerforation = form.watch("hasPerforation")
  const hasEyelets = form.watch("hasEyelets")
  const eyeletCount = form.watch("eyeletCount")
  const hasCutting = form.watch("hasCutting")
  const hasLamination = form.watch("hasLamination")
  const needsDelivery = form.watch("needsDelivery")
  const deliveryZone = form.watch("deliveryZone")
  const paymentStatus = form.watch("paymentStatus")
  const advancePayment = form.watch("advancePayment")
  
  // Filter clients when search changes
  useEffect(() => {
    if (clientSearch) {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.phone.includes(clientSearch) ||
        (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase()))
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [clientSearch])
  
  // Calculate material width needed with 5cm margin
  useEffect(() => {
    if (width && width > 0) {
      const withMargin = width + 5 // Add 5cm margin
      
      // Find appropriate material width
      if (materialType) {
        const availableWidths = materialWidths[materialType as keyof typeof materialWidths] || []
        const suitableWidth = availableWidths.find(w => w >= withMargin) || availableWidths[availableWidths.length - 1]
        
        if (suitableWidth) {
          form.setValue("selectedWidth", suitableWidth)
          setCalculatedWidth(width) // For price calculation, use the actual width
          
          // Check stock level for selected material and width
          const stockLevel = materialStock[materialType as keyof typeof materialStock]?.[suitableWidth] || 0
          setStockAvailable(stockLevel)
          
          // Set stock alert if below threshold
          if (stockLevel < stockThreshold) {
            setStockAlert(`Stock alert: Only ${stockLevel}m of ${materialType} in ${suitableWidth}cm width remaining`)
          } else {
            setStockAlert(null)
          }
        }
      }
    }
  }, [width, materialType, form])
  
  // Calculate area and base price
  useEffect(() => {
    if (calculatedWidth && length && selectedWidth) {
      // Area in m²
      const area = (calculatedWidth / 100) * (length / 100)
      setCalculatedArea(area)
      
      // Base price
      const basePrice = area * (materialPrices[materialType as keyof typeof materialPrices] || 0)
      setCalculatedPrice(basePrice)
      
      // Additional costs
      let additional = 0
      
      // Add perforation cost (free for bache)
      
      // Add eyelet cost
      if (hasEyelets && additionalServices.eyelets.available.includes(materialType)) {
        additional += (eyeletCount || 0) * additionalServices.eyelets.price
      }
      
      // Add cutting cost
      if (hasCutting && additionalServices.cutting.available.includes(materialType)) {
        additional += area * additionalServices.cutting.price
      }
      
      // Add lamination cost
      if (hasLamination && additionalServices.lamination.available.includes(materialType)) {
        additional += area * additionalServices.lamination.price
      }
      
      // Add delivery fee based on selected zone
      if (needsDelivery && deliveryZone) {
        const selectedZone = deliveryZones.find(zone => zone.id === deliveryZone)
        if (selectedZone) {
          additional += selectedZone.fee
          form.setValue("deliveryFee", selectedZone.fee)
        }
      }
      
      setAdditionalCost(additional)
      setTotalPrice(basePrice + additional)
    }
  }, [calculatedWidth, length, selectedWidth, materialType, hasPerforation, hasEyelets, eyeletCount, hasCutting, hasLamination, needsDelivery, deliveryZone, form])
  
  // Select client info when a client is chosen
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId)
    if (selectedClient) {
      form.setValue("clientId", selectedClient.id)
      form.setValue("clientName", selectedClient.name)
      form.setValue("clientPhone", selectedClient.phone)
      form.setValue("clientEmail", selectedClient.email || "")
      setIsExistingClient(true)
    }
  }
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...filesArray])
      
      // Create preview for first image
      if (filesArray[0].type.startsWith('image/')) {
        const url = URL.createObjectURL(filesArray[0])
        setPreviewUrl(url)
      }
      
      form.setValue("hasFiles", true)
    }
  }
  
  // Remove file from uploads
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
    
    if (newFiles.length === 0) {
      form.setValue("hasFiles", false)
      setPreviewUrl(null)
    } else if (index === 0 && newFiles[0].type.startsWith('image/')) {
      // Update preview if first file was removed
      const url = URL.createObjectURL(newFiles[0])
      setPreviewUrl(url)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Construct order object
    const order = {
      id: orderNumber,
      clientInfo: {
        id: values.clientId || 'new',
        name: values.clientName,
        phone: values.clientPhone,
        email: values.clientEmail,
        isNew: !values.clientId
      },
      orderDetails: {
        date: values.orderDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        status: values.status,
        notes: values.notes,
      },
      materialDetails: {
        type: values.materialType,
        typeLabel: materialTypes.find(m => m.id === values.materialType)?.name,
        width: values.width,
        length: values.length,
        selectedWidth: values.selectedWidth,
        calculatedArea: calculatedArea,
        requiredStock: length / 100, // Convert to meters
      },
      finishing: {
        perforation: values.hasPerforation,
        eyelets: values.hasEyelets ? {
          count: values.eyeletCount,
          spacing: values.eyeletSpacing,
        } : null,
        cutting: values.hasCutting ? {
          type: values.cuttingType
        } : null,
        lamination: values.hasLamination,
      },
      delivery: values.needsDelivery ? {
        address: values.deliveryAddress,
        zone: values.deliveryZone,
        fee: values.deliveryFee,
      } : null,
      payment: {
        status: values.paymentStatus,
        advanceAmount: values.advancePayment,
        remainingAmount: totalPrice ? totalPrice - values.advancePayment : 0,
      },
      pricing: {
        basePrice: calculatedPrice,
        additionalCosts: additionalCost,
        totalPrice: totalPrice,
      },
      files: uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // In a real implementation, you'd upload these to server and store paths
      })),
    }
    
    console.log(order)
    
    // Call callback if provided
    if (onOrderCreated) {
      onOrderCreated(order)
    }
    
    // Close dialog and reset form
    onOpenChange(false)
    form.reset()
    setUploadedFiles([])
    setPreviewUrl(null)
    setCalculatedArea(null)
    setCalculatedPrice(null)
    setAdditionalCost(0)
    setTotalPrice(null)
    setStockAlert(null)
    setStockAvailable(null)
    
    // Generate new order number for next time
    const newDateString = format(new Date(), 'yyMMdd')
    setOrderNumber(`CMD-${newDateString}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Commande <Badge variant="outline">{orderNumber}</Badge></DialogTitle>
          <DialogDescription>
            Entrez les détails de la commande. Les champs obligatoires sont marqués d'un astérisque (*).
          </DialogDescription>
        </DialogHeader>
        
        {stockAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{stockAlert}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations Client</h3>
              
              <div className="flex gap-4 items-center">
                <div className="flex-grow">
                  <Input 
                    placeholder="Rechercher un client (nom, téléphone, email)" 
                    value={clientSearch} 
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>
                {filteredClients.length > 0 && clientSearch && (
                  <Select onValueChange={handleClientSelect}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Clients trouvés" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du client*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom complet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone*</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de téléphone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Adresse email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Material Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Matériel et Dimensions</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="materialType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de matériel*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un matériel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
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
                  name="selectedWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largeur du rouleau*</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        value={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une largeur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialType && materialWidths[materialType as keyof typeof materialWidths]?.map((width) => (
                            <SelectItem key={width} value={width.toString()}>
                              {width} cm {stockAvailable !== null && width === selectedWidth ? 
                                `(${stockAvailable}m disponible)` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Largeur du matériel à utiliser
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largeur de l'impression (cm)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Largeur en cm" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Une marge de 5 cm sera ajoutée automatiquement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longueur de l'impression (cm)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Longueur en cm" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {calculatedArea !== null && (
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Surface calculée</p>
                    <p className="text-lg font-bold">{calculatedArea.toFixed(2)} m²</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Largeur avec marge</p>
                    <p className="text-lg">{width + 5} cm ({width} cm + 5 cm marge)</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Options and Finishing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Options et Finitions</h3>
              
              <Tabs defaultValue="finishing" className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="finishing">Finitions</TabsTrigger>
                  <TabsTrigger value="dates">Dates et Statut</TabsTrigger>
                  <TabsTrigger value="delivery">Livraison</TabsTrigger>
                </TabsList>
                
                <TabsContent value="finishing" className="space-y-4 pt-4">
                  {/* Options for Bâche */}
                  {materialType === "bache" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hasPerforation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Perforation</FormLabel>
                              <FormDescription>
                                Ajouter des perforations à la bâche (gratuit)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hasEyelets"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Œillets</FormLabel>
                              <FormDescription>
                                Ajouter des œillets (100 FCFA par œillet)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {hasEyelets && (
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <FormField
                            control={form.control}
                            name="eyeletCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre d'œillets</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Nombre" 
                                    {...field} 
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="eyeletSpacing"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Espacement</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Espacement" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="standard">Standard (50cm)</SelectItem>
                                    <SelectItem value="tight">Serré (30cm)</SelectItem>
                                    <SelectItem value="wide">Large (70cm)</SelectItem>
                                    <SelectItem value="corners">Coins seulement</SelectItem>
                                    <SelectItem value="custom">Personnalisé</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Options for Autocollant */}
                  {materialType === "autocollant" && (
                    <div className="space-y-4">
                     // ... (suite du code précédent)

<FormField
  control={form.control}
  name="hasCutting"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <FormLabel>Découpe</FormLabel>
        <FormDescription>
          Découpe spéciale (900 FCFA/m²)
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>

{hasCutting && (
  <FormField
    control={form.control}
    name="cuttingType"
    render={({ field }) => (
      <FormItem className="space-y-3 pl-4">
        <FormLabel>Type de découpe</FormLabel>
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            className="flex flex-col space-y-1"
          >
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value="rectangular" />
              </FormControl>
              <FormLabel>Rectangulaire standard</FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value="custom" />
              </FormControl>
              <FormLabel>Contour personnalisé</FormLabel>
            </FormItem>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}

{(materialType === "autocollant" || materialType === "oneway" || materialType === "transparent") && (
  <FormField
    control={form.control}
    name="hasLamination"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <FormLabel>Plastification</FormLabel>
          <FormDescription>
            Plastification supplémentaire (1500 FCFA/m²)
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </FormControl>
      </FormItem>
    )}
  />
)}
</div>
)}
</TabsContent>

<TabsContent value="dates" className="space-y-4 pt-4">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <FormField
      control={form.control}
      name="orderDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date de commande*</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className="pl-3 text-left font-normal"
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Choisir une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
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
          <FormLabel>Date de livraison*</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className="pl-3 text-left font-normal"
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Choisir une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Statut de la commande*</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="pending_payment">En attente de paiement</SelectItem>
              <SelectItem value="pending_production">En attente de production</SelectItem>
              <SelectItem value="in_production">En production</SelectItem>
              <SelectItem value="ready">Prête à être livrée</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Instructions spéciales, remarques..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</TabsContent>

<TabsContent value="delivery" className="space-y-4 pt-4">
  <FormField
    control={form.control}
    name="needsDelivery"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <FormLabel>Livraison nécessaire</FormLabel>
          <FormDescription>
            Cocher si le client a besoin d'une livraison
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </FormControl>
      </FormItem>
    )}
  />

  {needsDelivery && (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="deliveryZone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zone de livraison*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une zone" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {deliveryZones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name} - {zone.fee.toLocaleString()} FCFA
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
        name="deliveryAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse de livraison*</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Adresse complète avec repères"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )}
</TabsContent>
</Tabs>
</div>

{/* File Upload Section */}
<div className="space-y-4">
  <h3 className="text-lg font-medium">Fichiers</h3>
  
  <div className="flex items-center justify-center w-full">
    <label
      htmlFor="dropzone-file"
      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-8 h-8 mb-3" />
        <p className="mb-2 text-sm">
          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
        </p>
        <p className="text-xs text-muted-foreground">
          Fichiers reçus par WhatsApp ou USB (JPG, PNG, PDF, AI, PSD)
        </p>
      </div>
      <input
        id="dropzone-file"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf,.ai,.psd,.eps"
      />
    </label>
  </div>

  {uploadedFiles.length > 0 && (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Fichiers attachés</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploadedFiles.map((file, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{file.name}</TableCell>
              <TableCell>{(file.size / 1024).toFixed(1)} KB</TableCell>
              <TableCell>{file.type}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )}

  {previewUrl && (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Aperçu du premier fichier image</h4>
      <Card>
        <CardContent className="p-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-40 object-contain mx-auto"
          />
        </CardContent>
      </Card>
    </div>
  )}
</div>

{/* Pricing Summary */}
{totalPrice !== null && (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Récapitulatif de prix</h3>
    
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Prix de base</p>
          <p className="text-xl font-bold">
            {calculatedPrice?.toLocaleString()} FCFA
          </p>
          <p className="text-sm">
            {calculatedArea?.toFixed(2)} m² × {materialPrices[materialType as keyof typeof materialPrices]?.toLocaleString()} FCFA/m²
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Options supplémentaires</p>
          <p className="text-xl font-bold">
            {additionalCost.toLocaleString()} FCFA
          </p>
          <div className="text-sm space-y-1">
            {hasPerforation && materialType === "bache" && (
              <p>• Perforation: Inclus</p>
            )}
            {hasEyelets && (
              <p>• Œillets: {(eyeletCount || 0) * additionalServices.eyelets.price} FCFA</p>
            )}
            {hasCutting && (
              <p>• Découpe: {(calculatedArea || 0) * additionalServices.cutting.price} FCFA</p>
            )}
            {hasLamination && (
              <p>• Plastification: {(calculatedArea || 0) * additionalServices.lamination.price} FCFA</p>
            )}
            {needsDelivery && (
              <p>• Livraison: {deliveryFee?.toLocaleString()} FCFA</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-primary/10 border-primary">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Total à payer</p>
          <p className="text-2xl font-bold text-primary">
            {totalPrice.toLocaleString()} FCFA
          </p>
          {stockAvailable !== null && (
            <p className="text-sm">
              Stock disponible: {stockAvailable}m
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    
    {/* Payment Information */}
    <div className="space-y-4 pt-2">
      <h4 className="text-sm font-medium">Informations de paiement</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut du paiement*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="partial">Acompte reçu</SelectItem>
                  <SelectItem value="complete">Payé</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="advancePayment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant versé (FCFA)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Montant déjà payé"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {paymentStatus === "partial" && advancePayment > 0 && totalPrice !== null && (
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm font-medium">
            Reste à payer: {(totalPrice - advancePayment).toLocaleString()} FCFA
          </p>
        </div>
      )}
    </div>
  </div>
)}

<DialogFooter className="pt-4">
  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
    Annuler
  </Button>
  <Button type="submit">
    Enregistrer la commande
  </Button>
</DialogFooter>
</form>
</Form>
</DialogContent>
</Dialog>
)
}