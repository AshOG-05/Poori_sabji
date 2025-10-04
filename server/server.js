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

app.post('/calculate-distance', async (req, res) => {
    const { origin, destination } = req.body;
    const api_key = process.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${api_key}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
            res.json({ distance: data.rows[0].elements[0].distance.value });
        } else {
            res.status(400).json({ error: 'Unable to calculate distance' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
