require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = {}; // In-memory database for storing URLs
let idCounter = 1;

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// API endpoint to handle short URL creation
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    // Check if the hostname is valid
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Store the URL and generate a short ID
      const id = idCounter++;
      urlDatabase[id] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: id,
      });
    });
  } catch (error) {
    res.json({ error: "invalid url" });
  }
});

// API endpoint to redirect using short URL
app.get("/api/shorturl/:id", function (req, res) {
  const id = req.params.id;

  if (urlDatabase[id]) {
    res.redirect(urlDatabase[id]);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
