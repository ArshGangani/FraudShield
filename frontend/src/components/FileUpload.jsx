import { useState } from "react"
import { Upload, FileText } from "lucide-react"

const FileUpload = ({ onFileAnalyze }) => {
  const [fileSelected, setFileSelected] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [transactionId, setTransactionId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileSelected(e.dataTransfer.files[0])
    }
  }

  const analyzeFile = async () => {
    if (!fileSelected) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("csv", fileSelected)
    formData.append("userId", localStorage.getItem("userId"))

    try {
      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const result = await res.json()
      const transactionId = result.transactionId || result._id // adjust depending on your backend
      setTransactionId(transactionId)
    } catch (err) {
      console.error("Error uploading file:", err)
      alert("Failed to upload and analyze the file.")
    } finally {
      setIsUploading(false)
    }
  }

  const fetchAnalyzedData = async () => {
    if (!transactionId) return

    try {
      const res = await fetch(`http://localhost:3000/api/transactions/${transactionId}`)
      if (!res.ok) throw new Error("Failed to fetch transaction data")
      const result = await res.json()

      // Transform and pass to dashboard
      const transformed = result.data.map((item, idx) => ({
        id: idx + 1,
        date: item.Date,
        description: item.Description,
        credit: parseFloat(item.Credit),
        debit: parseFloat(item.Debit),
        availableBalance: parseFloat(item["Available Balance"]),
        anomalyStatus: item.Anomaly === "-1" ? "Suspicious" : "Normal",
      }))
      onFileAnalyze(fileSelected, transformed)
    } catch (err) {
      console.error("Error fetching analyzed data:", err)
      alert("Failed to fetch transaction data.")
    }
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Upload Transactions</h3>
        <p className="text-sm text-gray-500">Upload a CSV file containing transaction data for analysis</p>
      </div>
      <div className="p-6 pt-0 space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Drag and drop your file here</h3>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Browse Files
              </span>
              <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-4">Supported format: CSV</p>
        </div>

        {fileSelected && (
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">{fileSelected.name}</span>
            </div>
            {transactionId ? (
              <button
                onClick={fetchAnalyzedData}
                className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                View
              </button>
            ) : (
              <button
                disabled={isUploading}
                onClick={analyzeFile}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                {isUploading ? "Analyzing..." : "Analyze"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
