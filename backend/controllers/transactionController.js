const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const TransactionData = require('../db/TransactionData'); // Update path as needed

// GET /api/transactions/:id
exports.getDataById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await TransactionData.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const resultFilePath = transaction.resultFilePath;
    console.log('Result file path:', resultFilePath);

    console.log('Checking if file exists at:', resultFilePath);
    console.log('Exists:', fs.existsSync(resultFilePath));

    // Check if the file exists
    if (!fs.existsSync(resultFilePath)) {
      return res.status(404).json({ message: 'Processed file not found' });
    }

    const results = [];

    // Read and parse the CSV file
    fs.createReadStream(resultFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.status(200).json({
          file: transaction.originalFileName,
          uploadedAt: transaction.uploadedAt,
          data: results,
        });
      })
      .on('error', (err) => {
        console.error('CSV read error:', err);
        res.status(500).json({ message: 'Error reading CSV file' });
      });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getListofTransactions = async (req, res) => {

  try {
    const {id} = req.params;

    const transactionsData = await TransactionData.find({ user: id }).sort({ uploadedAt: -1 });
    console.log('Transactions data:', transactionsData);

    return res.status(200).json(transactionsData);

  }catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
