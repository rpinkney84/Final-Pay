const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files (like index.html)

// Square API credentials
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const API_URL = 'https://connect.squareup.com/v2/payments';

// Payment processing endpoint
app.post('/process-payment', async (req, res) => {
    const { nonce, amount } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount." });
    }

    const payload = {
        idempotency_key: new Date().getTime().toString(),
        source_id: nonce,
        amount_money: {
            amount: amount,
            currency: 'USD'
        },
        location_id: LOCATION_ID
    };

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
        console.error('Error:', error.response.data);
        res.status(500).json({ error: error.response.data });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
