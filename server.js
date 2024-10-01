const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { Client, Environment } = require('square');  // Square SDK

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Square API credentials
const accessToken = process.env.ACCESS_TOKEN || 'YOUR_DEFAULT_ACCESS_TOKEN'; 

// Initialize Square SDK Client
const client = new Client({
  accessToken: accessToken,
  environment: Environment.Production,  // Use 'Sandbox' for testing
});

// Payment processing endpoint
app.post('/process-payment', async (req, res) => {
    const { nonce, amount } = req.body;

    if (!nonce || !amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid nonce or amount." });
    }

    // Read card details from JSON file
    let cardDetails;
    try {
        const data = fs.readFileSync(path.join(__dirname, 'cards.json'), 'utf8');
        cardDetails = JSON.parse(data);
    } catch (error) {
        return res.status(500).json({ error: 'Error reading card details.' });
    }

    // Create payment request payload
    try {
        const response = await client.paymentsApi.createPayment({
            sourceId: nonce,
            idempotencyKey: `key_${new Date().getTime()}`,  // Unique for every payment
            amountMoney: {
                amount: amount,  // Amount in cents
                currency: 'USD',
            },
            locationId: process.env.LOCATION_ID || 'YOUR_DEFAULT_LOCATION_ID',
            note: `Payment for ${cardDetails.name || 'Customer'}`,
        });
        res.json(response.result);
    } catch (error) {
        console.error('Payment failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
