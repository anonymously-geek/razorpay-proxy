import express from "express";
import crypto from "crypto";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "your_webhook_secret";
const HF_BACKEND_URL = process.env.HF_BACKEND_URL || "https://nexnotes-ai.hf.space/webhook/razorpay";

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post("/razorpay-webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(req.rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Signature mismatch");
    return res.status(403).send("Invalid signature");
  }

  try {
    await axios.post(HF_BACKEND_URL, req.body);
    console.log("✅ Webhook forwarded to HF Space");
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error forwarding to HF backend:", error.message);
    res.status(500).send("Failed to forward webhook");
  }
});

app.get("/", (req, res) => {
  res.send("Razorpay webhook proxy is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});
