import clsx from "clsx";
import type { DataSource } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function DataSourcesTable({ sources }: { sources: DataSource[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Data Sources</p>
        <p className="text-xs text-muted">Administrator view of every connector registered with the platform.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-xs text-muted">
              <th className="px-5 py-2.5 font-medium">Source</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Imported</th>
              <th className="px-5 py-2.5 font-medium">Last successful import</th>
              <th className="px-5 py-2.5 font-medium">Error</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{source.name}</td>
                <td className="px-5 py-3 text-gray-600">{source.type}</td>
                <td className="px-5 py-3">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                      source.status === "Active" && "bg-success-50 text-success-700 ring-success-500/20",
                      source.status === "Disabled" && "bg-gray-100 text-gray-500 ring-gray-300/40",
                      source.status === "Error" && "bg-danger-50 text-danger-700 ring-danger-500/20",
                    )}
                  >
                    {source.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{source.opportunitiesImported}</td>
                <td className="px-5 py-3 text-gray-600">
                  {source.lastSuccessfulImport ? formatDateTime(source.lastSuccessfulImport) : "—"}
                </td>
                <td className="px-5 py-3 text-danger-600">{source.lastError ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
