"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit } from "lucide-react"
import { Button } from "#components/shadcn/ui/button"
import { Input } from "#components/shadcn/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/shadcn/ui/table"
import { Card, CardContent } from "#components/shadcn/ui/card"
import { MaterialApi } from "../../../../lib/utils/api"
import { Material } from "../../../../lib/utils/api/types"

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materialsData = await MaterialApi.getAll()
        setMaterials(materialsData)
      } catch (error) {
        console.error("Failed to fetch materials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Filter materials based on search query
  const filteredMaterials = materials.filter((material) =>
    material.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.type_materiau.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage and track your materials inventory</p>
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search materials by name or type..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Measurement Unit</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.materiau_id}>
                      <TableCell className="font-medium">{material.nom}</TableCell>
                      <TableCell>{material.type_materiau}</TableCell>
                      <TableCell>{formatCurrency(material.prix_unitaire)}</TableCell>
                      <TableCell>{material.unite_mesure}</TableCell>
                      <TableCell>{new Date(material.date_modification).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Edit Material">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No materials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}