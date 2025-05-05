const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const app = express();
app.use(cors());
app.options('*', cors()); // <--- THIS LINE
app.use(express.json());

// Mock list of blocked dates (you can later pull from a DB or file)
const blockedDates = [
  "2025-05-08",
  "2025-05-09",
  "2025-05-10"
];

// ✅ Route to return blocked dates
app.get("/blocked-dates", (req, res) => {
  res.json(blockedDates);
});

// ✅ Stripe checkout session route
app.post("/create-checkout-session", async (req, res) => {
  const { nights, total } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Magical Florida Home - ${nights} Night Stay`
            },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://yourgithubpagesdomain.com/success.html",
      cancel_url: "https://yourgithubpagesdomain.com/cancel.html",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
