import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({ 
  columns, 
  data, 
  emptyMessage = "No data available.", 
  className 
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center p-4 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop View: Standard Table */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className={cn(col.align === "right" && "text-right", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell 
                    key={colIndex} 
                    className={cn(col.align === "right" && "text-right", col.className)}
                  >
                    {col.accessor(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View: Card List */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((item, rowIndex) => (
          <Card key={rowIndex} className="p-4 space-y-3 shadow-sm">
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex justify-between items-start gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {col.header}
                </span>
                <div className={cn("text-sm font-medium text-right", col.className)}>
                  {col.accessor(item)}
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
