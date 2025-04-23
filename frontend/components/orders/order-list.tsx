"use client"

import { useState } from "react"
import { useOrders } from "@/hooks/use-orders"
import { Order } from "@/lib/order-service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash, 
  MoreHorizontal, 
  Filter,
  RefreshCw,
  Search
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface OrderListProps {
  onViewOrder: (orderId: string) => void
  onEditOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
}

export function OrderList({ onViewOrder, onEditOrder, onDeleteOrder }: OrderListProps) {
  const { orders, loading, error, filter, updateFilter } = useOrders()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortBy, setSortBy] = useState<"date" | "status" | "client">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.numero_commande.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.client?.nom} ${order.client?.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.statut.toLowerCase() === statusFilter.toLowerCase()

    const matchesDateRange = !dateRange?.from || !dateRange?.to || (
      new Date(order.date_creation) >= dateRange.from &&
      new Date(order.date_creation) <= dateRange.to
    )

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
        : new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
    }
    if (sortBy === "status") {
      return sortOrder === "asc"
        ? a.statut.localeCompare(b.statut)
        : b.statut.localeCompare(a.statut)
    }
    if (sortBy === "client") {
      const clientA = `${a.client?.nom} ${a.client?.prenom}`.toLowerCase()
      const clientB = `${b.client?.nom} ${b.client?.prenom}`.toLowerCase()
      return sortOrder === "asc"
        ? clientA.localeCompare(clientB)
        : clientB.localeCompare(clientA)
    }
    return 0
  })

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des commandes..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => {
                    setSortBy("date")
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }}
                >
                  Date
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => {
                    setSortBy("client")
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }}
                >
                  Client
                </TableHead>
                <TableHead>Détails</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => {
                    setSortBy("status")
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }}
                >
                  Statut
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => (
                  <TableRow key={order.commande_id}>
                    <TableCell>{new Date(order.date_creation).toLocaleDateString()}</TableCell>
                    <TableCell>{`${order.client?.nom} ${order.client?.prenom}`}</TableCell>
                    <TableCell>{order.numero_commande}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.statut)}>
                        {order.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Voir la commande" 
                          onClick={() => onViewOrder(order.commande_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Modifier la commande" 
                          onClick={() => onEditOrder(order.commande_id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Supprimer la commande"
                          onClick={() => onDeleteOrder(order.commande_id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aucune commande trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 