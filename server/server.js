require("dotenv").config({ path: "../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cors = require("cors");

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log("Twilio SID:", accountSid);
console.log("Twilio Auth Token:", authToken ? "Loaded ✅" : "Missing ❌");
console.log("From Phone:", twilioPhoneNumber);

const client = twilio(accountSid, authToken);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post("/send-message", async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({
            success: false,
            error: "Missing 'to' or 'message' in request body."
        });
    }

    const msgOptions = {
        from: twilioPhoneNumber,
        to: to,
        body: message,
    };

    try {
        const sentMessage = await client.messages.create(msgOptions);
        res.json({
            success: true,
            message: "SMS sent successfully!",
            messageSid: sentMessage.sid,
        });
    } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
