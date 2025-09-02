// ------------------------------
// Code Review Backend (Express)
// ------------------------------

const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Code Review API is running...");
});

// Review route
app.post("/review", async (req, res) => {
  const { code, language } = req.body;

  // Validate input
  if (!code || !code.trim()) {
    return res.status(400).json({ review: "Please provide some code to review." });
  }

  try {
    // Request to Gemini API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `You are an expert ${language} developer.  

Review the following code:

${code}

If the code has errors:
- Point out the exact error (1–2 lines max). Dont explain the improvements
- Show the corrected code snippet only for the error part.
- Overall keep the review concise according to the code upto 5-10lines only

If the code is correct:
- Reply: "Looks good ✅" and (optionally) suggest 1–2 quick improvements (no long explanation).
Keep responses short and clear.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    // Extract response safely
    const reviewText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Gemini did not return a review. Please try again with a different code snippet.";

    res.json({ review: reviewText });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({
      review: "Failed to get a review from Gemini. Please try again later."
    });
  }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));