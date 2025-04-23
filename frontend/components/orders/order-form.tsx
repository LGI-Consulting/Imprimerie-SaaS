"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Order, CreateOrderData } from "@/lib/order-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, FileIcon, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Define form schema
const orderFormSchema = z.object({
  clientInfo: z.object({
    client_id: z.string().optional(),
    nom: z.string().min(1, { message: "Le nom est requis" }),
    prenom: z.string().min(1, { message: "Le prénom est requis" }),
    email: z.string().email({ message: "Email invalide" }).optional().or(z.literal("")),
    telephone: z.string().min(1, { message: "Le téléphone est requis" }),
    adresse: z.string().optional().or(z.literal("")),
  }),
  materialType: z.string().min(1, { message: "Le type de matériau est requis" }),
  width: z.coerce.number().min(1, { message: "La largeur doit être supérieure à 0" }),
  length: z.coerce.number().min(1, { message: "La longueur doit être supérieure à 0" }),
  quantity: z.coerce.number().min(1, { message: "La quantité doit être supérieure à 0" }).default(1),
  options: z.object({
    comments: z.string().optional(),
    designFiles: z.array(z.object({
      name: z.string(),
      size: z.string(),
      type: z.string(),
    })).optional(),
  }).optional(),
  est_commande_speciale: z.boolean().default(false),
})

// Material options
const materialOptions = [
  { value: "banner", label: "Bannière" },
  { value: "vinyl", label: "Vinyle" },
  { value: "sticker", label: "Sticker" },
  { value: "canvas", label: "Toile" },
  { value: "paper", label: "Papier" },
]

// Additional options for each material type
const additionalOptions = {
  banner: [
    { id: "lamination", label: "Lamination", type: "fixed", price: 5000 },
    { id: "eyelets", label: "Œillets", type: "per_unit", price: 500 },
  ],
  vinyl: [
    { id: "lamination", label: "Lamination", type: "fixed", price: 5000 },
    { id: "cutting", label: "Découpe", type: "fixed", price: 3000 },
  ],
  sticker: [
    { id: "lamination", label: "Lamination", type: "fixed", price: 5000 },
    { id: "cutting", label: "Découpe", type: "fixed", price: 3000 },
  ],
  canvas: [
    { id: "stretching", label: "Tension", type: "fixed", price: 10000 },
  ],
  paper: [
    { id: "lamination", label: "Lamination", type: "fixed", price: 5000 },
  ],
}

// Add this after the materialOptions constant
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/ai': ['.ai'],
  'application/pdf': ['.pdf'],
  'image/psd': ['.psd'],
}

interface OrderFormProps {
  order?: CreateOrderData
  onSubmit: (data: CreateOrderData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

// Add this interface after the OrderFormProps interface
interface DesignFile {
  name: string
  size: string
  type: string
  preview?: string
}

export function OrderForm({ order, onSubmit, onCancel, isSubmitting = false }: OrderFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [selectedMaterial, setSelectedMaterial] = useState<string>("")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({})
  const [optionQuantities, setOptionQuantities] = useState<Record<string, number>>({})
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize form
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      clientInfo: {
        client_id: order?.clientInfo.client_id || "",
        nom: order?.clientInfo.nom || "",
        prenom: order?.clientInfo.prenom || "",
        email: order?.clientInfo.email || "",
        telephone: order?.clientInfo.telephone || "",
        adresse: order?.clientInfo.adresse || "",
      },
      materialType: order?.materialType || "",
      width: order?.width || 0,
      length: order?.length || 0,
      quantity: order?.quantity || 1,
      options: {
        comments: order?.options?.comments || "",
        designFiles: order?.options?.designFiles || [],
      },
      est_commande_speciale: order?.est_commande_speciale || false,
    },
  })
  
  // Update form when order changes
  useEffect(() => {
    if (order) {
      form.reset({
        clientInfo: {
          client_id: order.clientInfo.client_id,
          nom: order.clientInfo.nom || "",
          prenom: order.clientInfo.prenom || "",
          email: order.clientInfo.email || "",
          telephone: order.clientInfo.telephone || "",
          adresse: order.clientInfo.adresse || "",
        },
        materialType: order.materialType || "",
        width: order.width || 0,
        length: order.length || 0,
        quantity: order.quantity || 1,
        options: {
          comments: order.options?.comments || "",
          designFiles: order.options?.designFiles || [],
        },
        est_commande_speciale: order.est_commande_speciale || false,
      })
      
      setSelectedMaterial(order.materialType || "")
      
      // Set selected options
      if (order.options?.designFiles) {
        const options: Record<string, boolean> = {}
        const quantities: Record<string, number> = {}
        
        order.options.designFiles.forEach(file => {
          options[file.name.toLowerCase()] = true
          quantities[file.name.toLowerCase()] = file.size ? parseInt(file.size.split(' ')[0]) : 1
        })
        
        setSelectedOptions(options)
        setOptionQuantities(quantities)
      }
    }
  }, [order, form])
  
  // Handle material type change
  const handleMaterialChange = (value: string) => {
    setSelectedMaterial(value)
    form.setValue("materialType", value)
  }
  
  // Handle option toggle
  const handleOptionToggle = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: checked
    }))
  }
  
  // Handle option quantity change
  const handleOptionQuantityChange = (optionId: string, value: string) => {
    const quantity = parseInt(value) || 0
    setOptionQuantities(prev => ({
      ...prev,
      [optionId]: quantity
    }))
  }

  // Add this function after the existing handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      const newFiles: DesignFile[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
          throw new Error(`Type de fichier non supporté: ${file.type}`)
        }

        // Create preview URL for images
        const preview = file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : ''

        const fileObj: DesignFile = {
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          preview,
        }

        newFiles.push(fileObj)
      }

      setDesignFiles(prev => [...prev, ...newFiles])
      form.setValue("options.designFiles", [...(form.getValues("options.designFiles") || []), ...newFiles])
    } catch (error) {
      console.error('Error uploading files:', error)
      // You might want to show an error toast here
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (index: number) => {
    const updatedFiles = designFiles.filter((_, i) => i !== index)
    setDesignFiles(updatedFiles)
    form.setValue("options.designFiles", updatedFiles)

    // Revoke object URL if it exists
    if (designFiles[index].preview) {
      URL.revokeObjectURL(designFiles[index].preview)
    }
  }
  
  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    try {
      await onSubmit(values)
      form.reset()
      setSelectedMaterial("")
      setSelectedOptions({})
      setOptionQuantities({})
      setDesignFiles([])
    } catch (error) {
      console.error("Error submitting order:", error)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="text-2xl font-bold">
          {order ? "Modifier la commande" : "Nouvelle commande"}
        </h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="files">Fichiers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du produit</CardTitle>
                  <CardDescription>
                    Spécifiez les détails du produit commandé
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="materialType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de matériau</FormLabel>
                        <Select 
                          onValueChange={handleMaterialChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un matériau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Largeur (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longueur (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="est_commande_speciale"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Commande spéciale
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si la commande nécessite un traitement spécial
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Fichiers de design</FormLabel>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Téléchargement..." : "Ajouter des fichiers"}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
                          onChange={handleFileUpload}
                        />
                        <p className="text-sm text-muted-foreground">
                          Formats acceptés: JPG, PNG, AI, PDF, PSD
                        </p>
                      </div>

                      {designFiles.length > 0 && (
                        <div className="grid gap-2">
                          {designFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                {file.preview ? (
                                  <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                    <FileIcon className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{file.size}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                  <CardDescription>
                    Entrez les informations du client
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientInfo.nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientInfo.prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Prénom du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientInfo.telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="Numéro de téléphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientInfo.adresse"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="Adresse du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers de design</CardTitle>
                  <CardDescription>
                    Ajoutez ou supprimez des fichiers de design
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full gap-4">
                    <div className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-8">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Déposez vos fichiers ici ou cliquez pour télécharger</h3>
                        <p className="text-sm text-muted-foreground">
                          Formats acceptés: PDF, AI, PSD, JPG, PNG (max 50MB)
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Sélectionner des fichiers
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.ai,.psd,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>

                    {designFiles.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <h4 className="mb-2 text-sm font-medium">Fichiers téléchargés</h4>
                        <div className="space-y-2">
                          {designFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-md bg-muted p-2"
                            >
                              <div className="flex items-center overflow-hidden">
                                <span className="truncate text-sm">{file.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {file.size}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {order ? "Mettre à jour" : "Créer la commande"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 