const mongoose = require('mongoose');

const transactionDataSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFileName: { type: String, required: true },
    storedFilePath: { type: String, required: true },
    resultFilePath: { type: String }, // output after processing
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Processed', 'Failed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('TransactionData', transactionDataSchema);

