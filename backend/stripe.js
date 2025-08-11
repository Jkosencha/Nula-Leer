const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
    const { amount, paymentMethodId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // in cents
            currency: "kes",
            payment_method: paymentMethodId,
            confirm: true,
        });

        res.json({ success: true, paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Stripe payment failed" });
    }
});

module.exports = router;
