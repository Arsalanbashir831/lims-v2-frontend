"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { ServerPagination } from "@/components/ui/server-pagination";
import { FilterSearch } from "@/components/ui/filter-search";
import { ConfirmPopover } from "@/components/ui/confirm-popover";
import { Equipment } from "@/services/equipments.service";
import { toast } from "sonner";
import { FileSpreadsheetIcon, PencilIcon, TrashIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEquipments, useDeleteEquipment } from "@/hooks/use-equipments";
import { formatDateSafe } from "@/utils/hydration-fix";
import ExportExcelButton from "@/components/common/ExportExcelButton";

export default function LabEquipmentsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: equipmentsData, isFetching } = useEquipments(
    currentPage,
    searchQuery
  );
  const items = equipmentsData?.results ?? [];
  const totalCount = equipmentsData?.count ?? 0;
  const pageSize = equipmentsData?.pagination?.limit ?? 20;
  const hasNext =
    equipmentsData?.pagination?.has_next ??
    (equipmentsData?.next !== undefined
      ? Boolean(equipmentsData?.next)
      : totalCount > currentPage * pageSize);
  const hasPrevious = currentPage > 1;

  const deleteMutation = useDeleteEquipment();
  const doDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Deleted");
        },
        onError: (error) => {
          toast.error("Failed to delete equipment");
          console.error("Delete error:", error);
        },
      });
    },
    [deleteMutation]
  );

  const columns: ColumnDef<Equipment>[] = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
        meta: { className: "w-fit min-w-fit px-4" },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "equipment_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Equipment Name" />
        ),
      },
      {
        accessorKey: "equipment_serial",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Equipment Serial" />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
      },
      {
        accessorKey: "last_verification",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Verification" />
        ),
        cell: ({ row }) => {
          const lastVerification = row.original.last_verification;
          if (!lastVerification)
            return <span className="text-muted-foreground">N/A</span>;
          return <span>{formatDateSafe(lastVerification)}</span>;
        },
      },
      {
        accessorKey: "verification_due",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Verification Due" />
        ),
        cell: ({ row }) => {
          const verificationDue = row.original.verification_due;
          if (!verificationDue)
            return <span className="text-muted-foreground">N/A</span>;
          return <span>{formatDateSafe(verificationDue)}</span>;
        },
      },
      {
        accessorKey: "created_by",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created By" />
        ),
      },
      {
        accessorKey: "updated_by",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated By" />
        ),
      },
      {
        accessorKey: "remarks",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Remarks" />
        ),
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          <div className="text-right space-x-2 inline-flex">
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={ROUTES.APP.LAB_EQUIPMENTS.EDIT(String(row.original.id))}
              >
                <PencilIcon className="w-4 h-4" />
              </Link>
            </Button>
            <ConfirmPopover
              title="Delete this record?"
              confirmText="Delete"
              onConfirm={() => doDelete(row.original.id)}
              trigger={
                <Button variant="destructive" size="sm">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    [doDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      empty={<span className="text-muted-foreground">No records yet</span>}
      pageSize={pageSize}
      tableKey="lab-equipments"
      onRowClick={(row) =>
        router.push(ROUTES.APP.LAB_EQUIPMENTS.EDIT(String(row.original.id)))
      }
      toolbar={useCallback(
        (table: TanstackTable<Equipment>) => {
          const handleSearchChange = useCallback((value: string) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }, []);

          return (
            <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
              <FilterSearch
                placeholder="Search equipments..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
                inputClassName="max-w-md"
              />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <DataTableViewOptions table={table} />
                <ExportExcelButton
                  table={table}
                  fileName="Lab_Equipments.xlsx"
                  logos={{
                    imagePath: "/gripco-logo.webp",
                    rightImagePath: "/ias-logo-vertical.webp",
                  }}
                />
              </div>
                <Button asChild size="sm">
                  <Link href={ROUTES.APP.LAB_EQUIPMENTS.NEW}>New Record</Link>
                </Button>
            </div>
          );
        },
        [searchQuery]
      )}
      footer={useCallback(
        (table: TanstackTable<Equipment>) => (
          <ServerPagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={setCurrentPage}
            isLoading={isFetching}
          />
        ),
        [currentPage, totalCount, pageSize, hasNext, hasPrevious, isFetching]
      )}
    />
  );
}
