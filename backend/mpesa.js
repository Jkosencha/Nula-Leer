const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_PASSKEY,
    MPESA_SHORTCODE,
    MPESA_CALLBACK_URL,
} = process.env;

const getAccessToken = async () => {
    try {
        const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");

        const res = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        return res.data.access_token;
    } catch (error) {
        console.error("❌ Failed to get access token:", error.response?.data || error.message);
        throw new Error("Access token error");
    }
};


// const getAccessToken = async () => {
//     const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");

//     const res = await axios.get(
//         "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
//         {
//             headers: {
//                 Authorization: `Basic ${auth}`,
//             },
//         }
//     );

//     return res.data.access_token;
// };

router.post("/", async (req, res) => {
    const { phone, amount } = req.body;
    const accessToken = await getAccessToken();

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    const stkPushRequest = {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: "NulaLeer",
        TransactionDesc: "Leather products",
    };

    try {
        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            stkPushRequest,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error(error.response.data);
        res.status(500).json({ error: "Failed to initiate MPesa payment" });
    }
});

module.exports = router;
