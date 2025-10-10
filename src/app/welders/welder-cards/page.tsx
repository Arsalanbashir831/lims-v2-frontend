/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { ROUTES } from "@/constants/routes"
import Link from "next/link"

// Mock data and functions - replace with actual implementation
interface WelderCard {
  id: string
  issuedIn: string
  certificateNumber: string
  welderId: string
  welderName: string
  clientName: string
}

const mockData: WelderCard[] = [
  {
    id: "1",
    issuedIn: "2024",
    certificateNumber: "WQ-2024-001",
    welderId: "W001",
    welderName: "John Smith",
    clientName: "ACME Corporation"
  },
  {
    id: "2",
    issuedIn: "2024",
    certificateNumber: "WQ-2024-002",
    welderId: "W002",
    welderName: "Sarah Johnson",
    clientName: "Global Industries"
  },
  {
    id: "3",
    issuedIn: "2023",
    certificateNumber: "WQ-2023-045",
    welderId: "W003",
    welderName: "Mike Wilson",
    clientName: "Steel Works Ltd"
  },
  {
    id: "4",
    issuedIn: "2024",
    certificateNumber: "WQ-2024-003",
    welderId: "W004",
    welderName: "Emily Davis",
    clientName: "ACME Corporation"
  }
]

const listWelderCards = (): WelderCard[] => {
  if (typeof window === "undefined") return mockData
  try {
    const stored = localStorage.getItem("welder-qualifications")
    return stored ? JSON.parse(stored) : mockData
  } catch {
    return mockData
  }
}

const deleteWelderQualification = (id: string): boolean => {
  try {
    const stored = localStorage.getItem("welder-qualifications")
    const data = stored ? JSON.parse(stored) : mockData
    const filtered = data.filter((item: WelderCard) => item.id !== id)
    localStorage.setItem("welder-qualifications", JSON.stringify(filtered))
    return true
  } catch {
    return false
  }
}

const deleteMultipleWelderCards = (ids: string[]): boolean => {
  try {
    const stored = localStorage.getItem("welder-qualifications")
    const data = stored ? JSON.parse(stored) : mockData
    const filtered = data.filter((item: WelderCard) => !ids.includes(item.id))
    localStorage.setItem("welder-qualifications", JSON.stringify(filtered))
    return true
  } catch {
    return false
  }
}

export default function WelderCardPage() {
  const router = useRouter()
  const [data] = useState(() => listWelderCards())
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<WelderCard>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "serialNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Serial No" />,
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
    {
      accessorKey: "issuedIn",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issued In" />,
      cell: ({ row }) => {
        const issuedIn = row.getValue("issuedIn") as string
        return (
          <div className="font-medium">
            {issuedIn}
          </div>
        )
      },
    },
    {
      accessorKey: "certificateNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Certificate No" />,
      cell: ({ row }) => {
        const certificateNumber = row.getValue("certificateNumber") as string
        return (
          <div className="max-w-[150px] truncate font-medium" title={certificateNumber}>
            {certificateNumber}
          </div>
        )
      },
    },
    {
      accessorKey: "welderId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder ID" />,
      cell: ({ row }) => {
        const welderId = row.getValue("welderId") as string
        return (
          <div className="max-w-[100px] truncate font-medium" title={welderId}>
            {welderId}
          </div>
        )
      },
    },
    {
      accessorKey: "welderName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder Name" />,
      cell: ({ row }) => {
        const welderName = row.getValue("welderName") as string
        return (
          <div className="max-w-[150px] truncate" title={welderName}>
            {welderName}
          </div>
        )
      },
    },
    {
      accessorKey: "clientName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name" />,
      cell: ({ row }) => {
        const clientName = row.getValue("clientName") as string
        return (
          <div className="max-w-[200px] truncate" title={clientName}>
            {clientName}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.EDIT(row.original.id)}>
                <PencilIcon className="w-4 h-4" />
              </Link>
            </Button>
            <ConfirmPopover 
              title="Delete this certificate?" 
              confirmText="Delete" 
              onConfirm={() => deleteWelderQualification(row.original.id)} 
              trigger={
                <Button variant="destructive" size="sm">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              } 
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 100,
    },
  ]

  const filteredData = useMemo(() => {
    if (!globalFilter) return data

    return data.filter((qualification) => {
      const searchTerm = globalFilter.toLowerCase()
      return (
        qualification.welderName.toLowerCase().includes(searchTerm) ||
        qualification.certificateNumber.toLowerCase().includes(searchTerm) ||
        qualification.welderId.toLowerCase().includes(searchTerm) ||
        qualification.clientName.toLowerCase().includes(searchTerm) ||
        qualification.issuedIn.toLowerCase().includes(searchTerm)
      )
    })
  }, [data, globalFilter])

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      tableKey="welder-qualification"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.WELDER_CARDS.VIEW(row.original.id))}
      toolbar={(table) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = () => {
          const ids = selected.map((r: any) => r.original.id)
          if (deleteMultipleWelderCards(ids)) {
            table.resetRowSelection()
            window.location.reload()
          }
        }
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search certificates..."
              value={globalFilter}
              onChange={setGlobalFilter}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover
                  title={`Delete ${selected.length} selected certificate(s)?`}
                  confirmText="Delete"
                  onConfirm={onBulkDelete}
                  trigger={
                    <Button variant="destructive" size="sm">
                      Delete selected ({selected.length})
                    </Button>
                  }
                />
              )}
              <Link href={ROUTES.APP.WELDERS.WELDER_QUALIFICATION.NEW}>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Certificate
                </Button>
              </Link>
            </div>
          </div>
        )
      }}
      footer={(table) => (
        <DataTablePagination table={table} />
      )}
    />
  )
}
