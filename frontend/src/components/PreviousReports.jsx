import { FileText } from "lucide-react"

const PreviousReports = ({ reports }) => {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Previous Reports</h3>
        <p className="text-sm text-gray-500">View and manage your previously analyzed reports</p>
      </div>
      <div className="p-6 pt-0">
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Filename</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {reports.map((report) => (
                  <tr key={report.id} className="border-b transition-colors hover:bg-gray-100/50">
                    <td className="p-4 align-middle">{report.date}</td>
                    <td className="p-4 align-middle font-medium">{report.filename}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          report.status === "Completed" ? "border-gray-200 text-gray-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <button className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium transition-colors hover:bg-gray-100">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No previous reports found</p>
        )}
      </div>
    </div>
  )
}

export default PreviousReports
