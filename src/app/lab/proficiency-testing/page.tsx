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
import {
  proficiencyTestingService,
  ProficiencyTesting,
} from "@/services/proficiency-testing.service";
import { toast } from "sonner";
import { PencilIcon, TrashIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatDateSafe } from "@/utils/hydration-fix";
import ExportExcelButton from "@/components/common/ExportExcelButton";

export default function ProficiencyTestingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: ptData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["proficiency-tests", currentPage, searchQuery],
    queryFn: () =>
      searchQuery.trim()
        ? proficiencyTestingService.search(searchQuery.trim(), currentPage)
        : proficiencyTestingService.getAll(currentPage),
    staleTime: 0, // Always refetch when page changes
    gcTime: 10 * 60 * 1000,
    // Remove placeholderData to ensure queries refetch when page changes
  });

  const items = ptData?.results ?? [];
  const totalCount = ptData?.count ?? 0;
  const pageSize = ptData?.pagination?.limit ?? 20;
  const hasNext =
    ptData?.pagination?.has_next ??
    (ptData?.next !== undefined
      ? Boolean(ptData?.next)
      : totalCount > currentPage * pageSize);
  const hasPrevious = currentPage > 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => proficiencyTestingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proficiency-tests"] });
      toast.success("Deleted");
    },
  });
  const doDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const columns: ColumnDef<ProficiencyTesting>[] = useMemo(
    () => [
      {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
        meta: { className: "w-fit min-w-fit px-4" },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
          <div className="font-medium truncate max-w-[28ch]">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "provider1",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="PT Provider 1" />
        ),
      },
      {
        accessorKey: "provider2",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="PT Provider 2" />
        ),
      },
      {
        accessorKey: "last_test_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Test Date" />
        ),
        cell: ({ row }) => {
          const lastTestDate = row.original.last_test_date;
          if (!lastTestDate)
            return <span className="text-muted-foreground">N/A</span>;
          return <span>{formatDateSafe(lastTestDate)}</span>;
        },
      },
      {
        accessorKey: "due_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Due Date" />
        ),
        cell: ({ row }) => {
          const dueDate = row.original.due_date;
          if (!dueDate)
            return <span className="text-muted-foreground">N/A</span>;
          return <span>{formatDateSafe(dueDate)}</span>;
        },
      },
      {
        accessorKey: "next_scheduled_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Next Scheduled Date" />
        ),
        cell: ({ row }) => {
          const nextScheduledDate = row.original.next_scheduled_date;
          if (!nextScheduledDate)
            return <span className="text-muted-foreground">N/A</span>;
          return <span>{formatDateSafe(nextScheduledDate)}</span>;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
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
                href={ROUTES.APP.PROFICIENCY_TESTING.EDIT(
                  String(row.original.id)
                )}
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
      pageSize={20}
      tableKey="proficiency-testing"
      onRowClick={(row) =>
        router.push(
          ROUTES.APP.PROFICIENCY_TESTING.EDIT(String(row.original.id))
        )
      }
      toolbar={useCallback(
        (table: TanstackTable<ProficiencyTesting>) => {
          const handleSearchChange = useCallback((value: string) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }, []);

          return (
            <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
              <FilterSearch
                placeholder="Search description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
                inputClassName="max-w-md"
              />

              <div className="flex items-center gap-2 w-full md:w-auto">
                <DataTableViewOptions table={table} />
                <ExportExcelButton
                  table={table}
                  fileName="Proficiency_Testing.xlsx"
                  logos={{
                    imagePath: "/gripco-logo.webp",
                    rightImagePath: "/ias-logo-vertical.webp",
                  }}
                />
                <Button asChild size="sm">
                  <Link href={ROUTES.APP.PROFICIENCY_TESTING.NEW}>
                    New Record
                  </Link>
                </Button>
              </div>
            </div>
          );
        },
        [searchQuery]
      )}
      footer={useCallback(
        (table: TanstackTable<ProficiencyTesting>) => (
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
