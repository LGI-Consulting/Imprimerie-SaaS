"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Download, Eye, FileText, Image, File, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

import { PrintFile } from "@/lib/api/types"
import { formatFileSize } from "@/lib/api/utils"

interface OrderFilesListProps {
  files: PrintFile[]
  loading?: boolean
  onDelete?: (fileId: number) => void
}

export function OrderFilesList({ files, loading = false, onDelete }: OrderFilesListProps) {
  const [previewFile, setPreviewFile] = useState<PrintFile | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Fonction pour déterminer l'icône en fonction du type de fichier
  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-5 w-5" />
    
    if (mimeType.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />
    } else if (mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  // Fonction pour déterminer le type de fichier à afficher
  const getFileType = (mimeType: string | null) => {
    if (!mimeType) return "Autre"
    
    if (mimeType.startsWith("image/")) {
      return "Image"
    } else if (mimeType === "application/pdf") {
      return "PDF"
    } else {
      return "Document"
    }
  }

  // Fonction pour télécharger un fichier
  const handleDownload = async (file: PrintFile) => {
    try {
      // Récupérer le fichier depuis l'API
      const response = await fetch(`/api/files/${file.print_file_id}/download`)
      
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement")
      }
      
      // Créer un blob à partir de la réponse
      const blob = await response.blob()
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.file_name
      document.body.appendChild(a)
      a.click()
      
      // Nettoyer
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Fichier téléchargé avec succès")
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast.error("Erreur lors du téléchargement du fichier")
    }
  }

  // Fonction pour prévisualiser un fichier
  const handlePreview = (file: PrintFile) => {
    setPreviewFile(file)
    setPreviewOpen(true)
  }

  // Fonction pour fermer la prévisualisation
  const handleClosePreview = () => {
    setPreviewOpen(false)
    setPreviewFile(null)
  }

  // Rendu de la prévisualisation
  const renderPreview = () => {
    if (!previewFile) return null

    const mimeType = previewFile.mime_type || ""
    
    if (mimeType.startsWith("image/")) {
      return (
        <img 
          src={`/api/files/${previewFile.print_file_id}/preview`} 
          alt={previewFile.file_name}
          className="max-h-[80vh] max-w-full object-contain"
        />
      )
    } else if (mimeType === "application/pdf") {
      return (
        <iframe 
          src={`/api/files/${previewFile.print_file_id}/preview`}
          className="w-full h-[80vh]"
          title={previewFile.file_name}
        />
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <File className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium">{previewFile.file_name}</p>
          <p className="text-sm text-gray-500 mt-2">
            Ce type de fichier ne peut pas être prévisualisé
          </p>
          <Button 
            className="mt-4" 
            onClick={() => handleDownload(previewFile)}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nom du fichier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Taille</TableHead>
              <TableHead>Date d'upload</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // État de chargement
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : files.length === 0 ? (
              // État vide
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucun fichier attaché à cette commande
                </TableCell>
              </TableRow>
            ) : (
              // Données
              files.map((file) => (
                <TableRow key={file.print_file_id}>
                  <TableCell>
                    {getFileIcon(file.mime_type)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {file.file_name}
                    {file.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getFileType(file.mime_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {file.file_size ? formatFileSize(file.file_size) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(file.date_upload), "dd MMMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePreview(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(file.print_file_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de prévisualisation */}
      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewFile?.file_name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {renderPreview()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 