const axios = require('axios');

// Replace with your Square Access Token
const accessToken = 'EAAAliS5Q7j0ZX7qYswxZblD-IQOHJEOdfqvgiFlz-PbaTyixfYb9aH-eC7QxA_e';

// Function to get Merchant ID
async function getMerchantId() {
    try {
        const response = await axios.get('https://connect.squareup.com/v2/merchants/me', {
            headers: {
                'Square-Version': '2024-07-17',
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Merchant ID:', response.data.merchant.id);
    } catch (error) {
        console.error('Error retrieving Merchant ID:', error.response ? error.response.data : error.message);
    }
}

// Run the function
getMerchantId();
