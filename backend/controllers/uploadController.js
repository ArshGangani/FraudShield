const TransactionData = require("../db/TransactionData");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

exports.handleUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('File not received. Make sure you send it as form-data with key "csv"');
    }

    const inputFile = req.file.path;
    console.log('Input file path:', inputFile);
    console.log('Original file name:', req.file.originalname);

    const userId = req.body.userId || '6619f7abc1234567890abcde';

    try {
        const transaction = new TransactionData({
            user: userId,
            originalFileName: req.file.originalname,
            storedFilePath: inputFile,
            status: 'Pending',
        });
        await transaction.save();

        exec(`python3 models/isolationForest.py ${inputFile}`, async (error, stdout, stderr) => {
            if (error) {
                console.error('Exec error:', error);
                return res.status(500).send('Python script error');
            }

            const cleanOutput = stdout.trim().replace(/\r?\n|\r/g, '');
            const outputFilePath = path.resolve(cleanOutput);

            transaction.resultFilePath = outputFilePath;
            await transaction.save();

            if (!fs.existsSync(outputFilePath)) {
                return res.status(500).send('Output file missing');
            }

            // Instead of downloading the file, return the transaction ID
            res.status(200).json({ transactionId: transaction._id });
        });

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Internal server error');
    }
};
