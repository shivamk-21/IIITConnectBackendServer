const express = require("express");
const router = express.Router();
const axios = require("axios");

// Cache
let cachedQuote = null;
let lastFetchedDate = null;

// Quote Route Request
router.get("/quote", async (req, res) => {
  const currentDate = new Date().toDateString();
  if (lastFetchedDate === currentDate && cachedQuote) {
    // If a quote was already fetched for today, return the cached quote
    res.send({
      author: cachedQuote.author,
      quote: cachedQuote.quote,
      cached: true,
    });
  } else {
    try {
      const response = await axios.get(
        "https://api.quotable.io/random?tags=education"
      );

      cachedQuote = {
        author: response.data.author,
        quote: response.data.content,
      };
      lastFetchedDate = currentDate;

      res.send({
        author: cachedQuote.author,
        quote: cachedQuote.quote,
        cached: false,
      });
    } catch (error) {
      res.status(500).send({ error: "Error fetching the quote" });
    }
  }
});

module.exports = router;
