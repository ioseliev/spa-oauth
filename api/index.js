import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.post("/api", express.json(), (req, res) => {
  if (!req.body || typeof req.body !== "object" || !req.body.code) {
    return res.status(400).json({
      message: "Missing Authorization Code grant"
    });
  }
  
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    client_id: process.env.VITE_CLIENT_ID,
    code: req.body.code,
    redirect_uri: process.env.VITE_REDIRECT_URI
  }).then((response) => {
    if (response.ok) {
      return res.status(200).json({
        token: response.json().access_token
      });
    } else {
      return res.status(403).json({
        message: `Error exchanging Authorization Code grant for access token (API returned ${response.status})`
      });
    }
  });
});

export default app;
