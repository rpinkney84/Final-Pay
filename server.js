const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files (like index.html)

// Square API credentials
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'YOUR_DEFAULT_ACCESS_TOKEN'; 
const LOCATION_ID = process.env.LOCATION_ID || 'YOUR_DEFAULT_LOCATION_ID'; 
const API_URL = 'https://connect.squareup.com/v2/transactions';

// Payment processing endpoint
app.post('/process-payment', async (req, res) => {
    const { nonce, amount } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount." });
    }

    let cardDetails;
    try {
        const data = fs.readFileSync(path.join(__dirname, 'cards.json'), 'utf8');
        cardDetails = JSON.parse(data);
    } catch (error) {
        return res.status(500).json({ error: 'Error reading card details.' });
    }

    const payload = {
        idempotency_key: 'some_unique_key',
        amount_money: {
            amount: amount,
            currency: 'USD'
        },
        card_nonce: nonce,
        location_id: LOCATION_ID,
    };

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
        res.json(response.data);
    } catch (error) {
        res.status(500).json(error.response.data);
    }
});

// Start the server
const PORT = process.env.PORT || 3000; // Ensure we are using the PORT variable correctly
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Log the actual port number
});
