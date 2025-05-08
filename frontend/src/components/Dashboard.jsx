import { useState , useEffect } from "react"
import Navbar from "./Navbar"
import PreviousReports from "./PreviousReports"
import FileUpload from "./FileUpload"
import TransactionTable from "./TransactionTable"
import Footer from "./Footer"
import jsPDF from "jspdf"
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF);
import { autoTable } from 'jspdf-autotable'

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
]

const Dashboard = () => {
  const [fileSelected, setFileSelected] = useState(null)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [transactions, setTransactions] = useState(sampleTransactionsData)
  const [previousReports, setPreviousReports] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPreviousReports = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/transactions/user/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Transform the data to match the expected format
        const transformedData = data.map((report) => ({
          id: report._id,
          filename: report.originalFileName,
          status: report.status,
          date: new Date(report.uploadedAt).toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
        }));
        setPreviousReports(transformedData);
      } catch (error) {
        console.error('Error fetching previous reports:', error);
      }
    };
  
    if (userId) {
      fetchPreviousReports();
    }
  }, [userId]);
  

  const handleFileAnalyze = (file, transactionData) => {
    setFileSelected(file)
    setIsAnalyzed(true)
    setTransactions(transactionData)
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
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
  
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Analysis Results", 40, 50);
  
    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`${transactions.length} records found`, 40, 75);
  
    // Table headers
    const headers = [["Date", "Description", "Credit", "Debit", "Available Balance", "Anomaly Status"]];
  
    // Table rows with null checks
    const rows = transactions.map((txn) => [
      txn.date,
      txn.description,
      txn.credit > 0 ? `$${(txn.credit || 0).toFixed(2)}` : "-",
      txn.debit > 0 ? `$${(txn.debit || 0).toFixed(2)}` : "-",
      `$${(txn.availableBalance || 0).toFixed(2)}`,
      txn.anomalyStatus,
    ]);
  
    // Generate the table
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 100,
      styles: {
        fontSize: 10,
        cellPadding: 10,
        halign: "left",
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 80,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 130 },
        2: { cellWidth: 80, halign: "left" },
        3: { cellWidth: 80, halign: "left" },
        4: { cellWidth: 100, halign: "left" },
        5: { cellWidth: 90 },
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      didParseCell: (data) => {
        // Style for Suspicious transactions
        if (data.section === "body" && data.column.index === 5) {
          if (data.cell.raw === "Suspicious") {
            data.cell.styles.fillColor = [255, 240, 240]; // Light red
            data.cell.styles.textColor = [180, 0, 0]; // Dark red text
            data.cell.styles.fontStyle = "bold";
          }
        }
      
        // Add light background to entire row if suspicious - FIXED VERSION
        if (data.section === "body" && data.column.index === 0) {
          const isRowSuspicious = rows[data.row.index][5] === "Suspicious";
          if (isRowSuspicious) {
            // Access cells through the row object properly
            for (const cell of Object.values(data.row.cells)) {
              cell.styles.fillColor = [255, 240, 240]; // Light red
            }
          }
        }
      },
    });
  
    doc.save("analysis_report.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <PreviousReports reports={previousReports} />

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
