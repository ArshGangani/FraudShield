import { useState } from "react"
import Navbar from "./Navbar"
import PreviousReports from "./PreviousReports"
import FileUpload from "./FileUpload"
import TransactionTable from "./TransactionTable"
import Footer from "./Footer"

// Sample data for previous reports
const previousReportsData = [
  { id: 1, filename: "transactions_jan_2023.csv", status: "Completed", date: "2023-01-15" },
  { id: 2, filename: "transactions_feb_2023.csv", status: "Completed", date: "2023-02-12" },
  { id: 3, filename: "transactions_mar_2023.csv", status: "In Progress", date: "2023-03-10" },
]

// Sample data for transactions
const sampleTransactionsData = [
  {
    id: 1,
    date: "2023-03-01",
    description: "Grocery Store Purchase",
    credit: 0,
    debit: 45.67,
    availableBalance: 1254.33,
    anomalyStatus: "Normal",
  },
  {
    id: 2,
    date: "2023-03-02",
    description: "ATM Withdrawal",
    credit: 0,
    debit: 200.0,
    availableBalance: 1054.33,
    anomalyStatus: "Normal",
  },
  {
    id: 3,
    date: "2023-03-03",
    description: "Online Purchase - Unknown Vendor",
    credit: 0,
    debit: 499.99,
    availableBalance: 554.34,
    anomalyStatus: "Suspicious",
  },
  {
    id: 4,
    date: "2023-03-04",
    description: "Salary Deposit",
    credit: 2500.0,
    debit: 0,
    availableBalance: 3054.34,
    anomalyStatus: "Normal",
  },
  {
    id: 5,
    date: "2023-03-05",
    description: "International Transfer",
    credit: 0,
    debit: 1000.0,
    availableBalance: 2054.34,
    anomalyStatus: "Suspicious",
  },
]

const Dashboard = () => {
  const [fileSelected, setFileSelected] = useState(null)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [transactions, setTransactions] = useState(sampleTransactionsData)

  const handleFileAnalyze = (file) => {
    setFileSelected(file)
    setIsAnalyzed(true)
    // this would send the file to the server for processing
    // and then update the transactions state with the results
  }

  const toggleAnomalyStatus = (id) => {
    setTransactions(
      transactions.map((transaction) => {
        if (transaction.id === id) {
          return {
            ...transaction,
            anomalyStatus: transaction.anomalyStatus === "Normal" ? "Suspicious" : "Normal",
          }
        }
        return transaction
      }),
    )
  }

  const downloadReport = () => {
    //this would generate and download a report
    alert("Downloading report...")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <PreviousReports reports={previousReportsData} />

        <FileUpload onFileAnalyze={handleFileAnalyze} />

        {isAnalyzed && (
          <TransactionTable
            transactions={transactions}
            fileName={fileSelected?.name}
            onToggleStatus={toggleAnomalyStatus}
            onDownload={downloadReport}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Dashboard
