import { Download } from "lucide-react"

const TransactionTable = ({ transactions, fileName, onToggleStatus, onDownload }) => {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex flex-row items-center justify-between p-6">
        <div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Analysis Results</h3>
          <p className="text-sm text-gray-500">
            Transactions from {fileName} - {transactions.length} records found
          </p>
        </div>
        <button
          onClick={onDownload}
          className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </button>
      </div>
      <div className="p-6 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Description</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">Credit</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">Debit</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">Available Balance</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Anomaly Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Modify</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`border-b transition-colors hover:bg-gray-100/50 ${
                    transaction.anomalyStatus === "Suspicious" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="p-4 align-middle">{transaction.date}</td>
                  <td className="p-4 align-middle font-medium">{transaction.description}</td>
                  <td className="p-4 align-middle text-right">
                    {transaction.credit > 0 ? `$${transaction.credit.toFixed(2)}` : "-"}
                  </td>
                  <td className="p-4 align-middle text-right">
                    {transaction.debit > 0 ? `$${transaction.debit.toFixed(2)}` : "-"}
                  </td>
                  <td className="p-4 align-middle text-right">${transaction.availableBalance.toFixed(2)}</td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        transaction.anomalyStatus === "Suspicious"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "border-gray-200 text-gray-800"
                      }`}
                    >
                      {transaction.anomalyStatus}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center space-x-2">
                      <div className="relative inline-flex h-[24px] w-[44px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
                        <input
                          type="checkbox"
                          id={`toggle-${transaction.id}`}
                          checked={transaction.anomalyStatus === "Suspicious"}
                          onChange={() => onToggleStatus(transaction.id)}
                          className="sr-only"
                        />
                        <span
                          className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            transaction.anomalyStatus === "Suspicious" ? "translate-x-5 bg-red-500" : "translate-x-0"
                          }`}
                        />
                      </div>
                      <label htmlFor={`toggle-${transaction.id}`} className="text-xs font-medium">
                        {transaction.anomalyStatus === "Suspicious" ? "Suspicious" : "Normal"}
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TransactionTable