"use client"

import { useState } from "react"
import { Search, Plus, Edit } from "lucide-react"
import { Button } from "#components/shadcn/ui/button"
import { Input } from "#components/shadcn/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/shadcn/ui/table"
import { Card, CardContent } from "#components/shadcn/ui/card"

// Sample data for inventory
const materials = [
  {
    id: 1,
    name: "Cotton Fabric",
    stockQuantity: 500,
    unitPrice: 5.99,
    lastUpdated: "2023-04-15",
  },
  {
    id: 2,
    name: "Polyester Blend",
    stockQuantity: 350,
    unitPrice: 4.5,
    lastUpdated: "2023-04-12",
  },
  {
    id: 3,
    name: "Denim",
    stockQuantity: 200,
    unitPrice: 8.75,
    lastUpdated: "2023-04-10",
  },
  {
    id: 4,
    name: "Silk",
    stockQuantity: 100,
    unitPrice: 15.99,
    lastUpdated: "2023-04-08",
  },
  {
    id: 5,
    name: "Wool",
    stockQuantity: 150,
    unitPrice: 12.25,
    lastUpdated: "2023-04-05",
  },
  {
    id: 6,
    name: "Linen",
    stockQuantity: 180,
    unitPrice: 9.5,
    lastUpdated: "2023-04-03",
  },
  {
    id: 7,
    name: "Leather",
    stockQuantity: 75,
    unitPrice: 22.99,
    lastUpdated: "2023-03-30",
  },
  {
    id: 8,
    name: "Buttons (pack of 100)",
    stockQuantity: 50,
    unitPrice: 3.99,
    lastUpdated: "2023-03-28",
  },
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter materials based on search query
  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
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
              placeholder="Search materials by name..."
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
                  <TableHead>Stock Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.stockQuantity}</TableCell>
                      <TableCell>{formatCurrency(material.unitPrice)}</TableCell>
                      <TableCell>{new Date(material.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Edit Material">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
