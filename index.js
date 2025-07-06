const dotenv = require("dotenv");
const path = require("path");

// Explicitly specify the .env file path
const envPath = path.resolve(__dirname, ".env");
const envConfig = dotenv.config({ path: envPath });

// if (envConfig.error) {
//   console.error("Error loading .env file:", envConfig.error);
//   throw envConfig.error;
// }

// Debug: Log all environment variables and the .env file path
// console.log("Environment Variables:", process.env);
// console.log("Attempted .env Path:", envPath);
// console.log("Stripe Key:", process.env.STRIPE_KEY);

const stripe = require("stripe")(process.env.STRIPE_KEY);
const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "success!" });
});

app.post("/payments/create", async (req, res) => {
  const total = parseInt(req.query.total);

  if (isNaN(total) || total <= 0) {
    return res.status(400).json({ message: "Invalid or negative total amount" });
  }

  try {
    const paymentIntentResponse = await stripe.paymentIntents.create({
      amount: total * 100, // Convert dollars to cents
      currency: "cad",
    });

    res.status(201).json({ clientSecret: paymentIntentResponse.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ message: "Failed to create payment intent", error: error.message });
  }
});

app.listen(5000, (err) => {
  if (err) {
    console.error("Server Error:", err);
    throw err;
  }
  console.log("Amazon server is running on port 5000");
});