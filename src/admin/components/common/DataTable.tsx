import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  flexRender,
} from '@tanstack/react-table';
import { SearchLg, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from '@untitledui/icons';
import { Button } from '../untitledui/Button';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  bulkActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode;
  filterBar?: React.ReactNode;
  defaultPageSize?: number;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onRowClick,
  isLoading = false,
  emptyState,
  bulkActions,
  filterBar,
  defaultPageSize = 25,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4 text-left">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5D5E5F]">
            <SearchLg className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-[8px] border border-[#E1E0DD] bg-white pl-9.5 pr-3.5 py-2 text-sm text-[#17191A] placeholder-[#969594] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F]"
          />
        </div>

        {filterBar && <div className="flex flex-wrap items-center gap-2.5">{filterBar}</div>}
      </div>

      {/* Bulk Actions Banner */}
      {selectedCount > 0 && bulkActions && (
        <div className="bg-[#E2ECEB] border border-[#C5D8D7] rounded-[8px] p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <span className="text-sm font-semibold text-[#17645F]">
            {selectedCount} row{selectedCount > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedRows, () => setRowSelection({}))}
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setRowSelection({})}
              className="!text-[#17645F]"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-[10px] border border-[#E1E0DD] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2E3031]">
            <thead className="bg-[#FAF9F6] text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider border-b border-[#E1E0DD]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          sortDirection === 'asc'
                            ? 'ascending'
                            : sortDirection === 'desc'
                            ? 'descending'
                            : undefined
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        className={`px-4 py-3.5 select-none ${
                          isSortable ? 'cursor-pointer hover:bg-[#F0EFEC]' : ''
                        }`}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (
                            <span className="text-[#5D5E5F]">
                              {sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#17645F]" />
                              ) : sortDirection === 'desc' ? (
                                <ChevronDown className="w-3.5 h-3.5 text-[#17645F]" />
                              ) : (
                                <span className="opacity-0 group-hover:opacity-100">↕</span>
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-[#E1E0DD] bg-white">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-4">
                        <div className="h-4 bg-[#F0EFEC] rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-[#FAF9F6]' : 'hover:bg-[#FAF9F6]/50'
                    } ${row.getIsSelected() ? 'bg-[#E2ECEB]/30' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    {emptyState ? (
                      <div className="space-y-3 max-w-sm mx-auto">
                        <p className="text-base font-semibold text-[#17191A]">{emptyState.title}</p>
                        <p className="text-xs text-[#5D5E5F]">{emptyState.description}</p>
                        {emptyState.actionLabel && emptyState.onAction && (
                          <div className="pt-2">
                            <Button size="sm" onClick={emptyState.onAction}>
                              {emptyState.actionLabel}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#5D5E5F]">No records found.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 border-t border-[#E1E0DD] bg-[#FAF9F6] text-xs text-[#5D5E5F]">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-[#17191A]">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-[#17191A]">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </strong>{' '}
              of <strong className="text-[#17191A]">{table.getFilteredRowModel().rows.length}</strong>{' '}
              results
            </span>

            <div className="flex items-center gap-1.5 ml-3">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded border border-[#E1E0DD] bg-white px-2 py-1 text-xs text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              iconLeading={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-[#17191A]">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              iconTrailing={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
