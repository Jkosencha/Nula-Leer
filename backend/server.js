const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mpesaRouter = require("./mpesa");
const stripeRouter = require("./stripe");

app.use("/api/stkpush", mpesaRouter);
app.use("/api/stripe-payment", stripeRouter);

app.get("/", (req, res) => {
    res.send("Nula Leer Backend is Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
