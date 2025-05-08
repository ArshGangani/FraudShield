import { FileText } from "lucide-react"
import { useState } from "react"

const PreviousReports = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [transactionData, setTransactionData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleView = async (reportId) => {
    setLoading(true)
    setSelectedReport(reportId)

    try {
      const res = await fetch(`http://localhost:3000/api/transactions/${reportId}`)
      const data = await res.json()
      setTransactionData(data)
    } catch (error) {
      console.error("Failed to fetch transaction data:", error)
      setTransactionData(null)
    } finally {
      setLoading(false)
    }
  }

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
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left text-gray-500">Date</th>
                  <th className="h-12 px-4 text-left text-gray-500">Filename</th>
                  <th className="h-12 px-4 text-left text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-100/50">
                    <td className="p-4">{report.date}</td>
                    <td className="p-4 font-medium">{report.filename}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleView(report.id)}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium transition-colors hover:bg-gray-100"
                      >
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

      {/* Transaction Table Section */}
      {loading && (
        <div className="p-6 text-gray-500">Loading transaction data...</div>
      )}

      {transactionData && (
        <div className="p-6">
          <h4 className="text-xl font-semibold mb-2">Transaction Details: {transactionData.file}</h4>
          <p className="text-sm text-gray-500 mb-4">
            Uploaded at: {new Date(transactionData.uploadedAt).toLocaleString()}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Description</th>
                  <th className="px-4 py-2 border-b">Credit</th>
                  <th className="px-4 py-2 border-b">Debit</th>
                  <th className="px-4 py-2 border-b">Available Balance</th>
                  <th className="px-4 py-2 border-b">Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.data.map((txn, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-2">{txn.Date}</td>
                    <td className="px-4 py-2">{txn.Description}</td>
                    <td className="px-4 py-2">{txn.Credit}</td>
                    <td className="px-4 py-2">{txn.Debit}</td>
                    <td className="px-4 py-2">{txn["Available Balance"]}</td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        txn.Anomaly === "-1" ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      {txn.Anomaly === "-1" ? "Suspicious" : "Normal"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviousReports
