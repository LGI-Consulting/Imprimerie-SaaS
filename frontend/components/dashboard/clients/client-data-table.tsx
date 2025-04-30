"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye, MoreHorizontal, Mail, Phone, MapPin, Calendar, Edit, Trash2, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Client } from "@/lib/api/types"
import { clients } from "@/lib/api/client"

interface ClientDataTableProps {
  data: Client[]
  onViewClient?: (client: Client, e?: React.MouseEvent) => void
  onEditClient?: (client: Client, e?: React.MouseEvent) => void
  onDeleteClient?: (client: Client, e?: React.MouseEvent) => void
  onTransactionsClient?: (client: Client, e?: React.MouseEvent) => void
}

export function ClientDataTable({
  data,
  onViewClient,
  onEditClient,
  onDeleteClient,
  onTransactionsClient,
}: ClientDataTableProps) {
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "client_id",
      header: "ID",
      cell: ({ row }) => {
        return <div className="font-medium">CLT-{row.original.client_id.toString().padStart(4, "0")}</div>
      },
    },
    {
      accessorKey: "nom",
      header: "Nom",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.prenom} {row.original.nom}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex flex-col gap-1">
            {client.email && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{client.telephone}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "adresse",
      header: "Adresse",
      cell: ({ row }) => {
        const client = row.original
        if (!client.adresse) return null
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{client.adresse}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "date_creation",
      header: "Date d'inscription",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(row.original.date_creation), "dd MMM yyyy", { locale: fr })}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "derniere_visite",
      header: "Dernière visite",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(row.original.derniere_visite), "dd MMM yyyy", { locale: fr })}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => onViewClient?.(client, e)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => onEditClient?.(client, e)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => onTransactionsClient?.(client, e)}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Transactions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => onDeleteClient?.(client, e)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      filterColumn="nom"
      onRowClick={onViewClient}
    />
  )
} 