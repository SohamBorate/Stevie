// Hosting bot on Render
module.exports = () => {
    const dotenv = require("dotenv").config();
    const https = require("https")
    const express = require("express");

    const uptimeUrl = process.env.UPTIME_URL;
    const port = process.env.PORT || 3000;
    const app = express();

    app.get("/", (req, res) => {
        res.send("Bot is live");
    });

    app.get("/health", (req, res) => {
        res.send("Bot is live");
    });

    var uptime = () => {
        https.get(uptimeUrl);
        setTimeout(uptime, 840000);
    }

    if (uptimeUrl) setTimeout(uptime, 840000);

    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
}
