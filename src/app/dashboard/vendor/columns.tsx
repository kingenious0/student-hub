"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
export type RecentOrder = {
    id: string
    amount: number
    status: "PENDING" | "COMPLETED" | "CANCELLED"
    createdAt: string
    product: {
        title: string
    }
}

export const columns: ColumnDef<RecentOrder>[] = [
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => <span className="font-mono text-xs">{String(row.getValue("id")).slice(0, 8)}</span>
    },
    {
        accessorKey: "product.title",
        header: "Product",
        cell: ({ row }) => <span className="font-bold">{row.original.product?.title || 'Unknown Product'}</span>
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"))
            return <span className="text-foreground/60">{date.toLocaleDateString()}</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'COMPLETED' ? 'default' : status === 'PENDING' ? 'secondary' : 'destructive'}
                    className={`
                ${status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                ${status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : ''}
                ${status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : ''}
            `}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-GH", {
                style: "currency",
                currency: "GHS",
            }).format(amount)

            return <div className="text-right font-black text-primary">{formatted}</div>
        },
    },
]
