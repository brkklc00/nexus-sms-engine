type DataTableProps = {
  columns: string[];
  rows: Array<Array<string | number>>;
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="nexus-surface-strong overflow-hidden rounded-2xl">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-slate-900/90">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-slate-950/80">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-900/70">
              {row.map((cell, cellIdx) => (
                <td key={`${idx}-${cellIdx}`} className="px-4 py-3 text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
