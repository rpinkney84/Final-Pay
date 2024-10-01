const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files (like index.html)

// Square API credentials should be stored as environment variables
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'YOUR_DEFAULT_ACCESS_TOKEN'; 
const LOCATION_ID = process.env.LOCATION_ID || 'YOUR_DEFAULT_LOCATION_ID'; 
const API_URL = 'https://connect.squareup.com/v2/transactions';

// Endpoint to process payments
app.post('/process-payment', async (req, res) => {
    const { nonce, amount } = req.body;

    // Ensure the amount is valid
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount." });
    }

    // Load card data from cards.json using a relative path
    let cardDetails;
    try {
        const data = fs.readFileSync(path.join(__dirname, 'cards.json'), 'utf8');
        cardDetails = JSON.parse(data);
    } catch (error) {
        return res.status(500).json({ error: 'Error reading card details.' });
    }

    // Prepare the payload
    const payload = {
        idempotency_key: 'some_unique_key', // Use a unique key for each transaction
        amount_money: {
            amount: amount, // Amount in cents
            currency: 'USD'
        },
        card_nonce: nonce, // Use the nonce from the front-end
        location_id: LOCATION_ID,
    };

    // Include authorization code if present
    if (cardDetails.authorization_code) {
        payload.authorization_code = cardDetails.authorization_code;
    }

    try {
        const response = await axios.post(API_URL, payload, {
            headers: {
                'Square-Version': '2023-09-13',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        res.json(response.data); // Send response back to client
    } catch (error) {
        res.status(500).json(error.response.data); // Handle errors
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
