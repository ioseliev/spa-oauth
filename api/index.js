import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.post("/token", express.json(), (req, res) => {
  if (!req.body || typeof req.body !== "object" || !req.body.code) {
    return res.status(400).json({
      error: "Missing Authorization Code grant"
    });
  }
  
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.VITE_CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.body.code,
      redirect_uri: process.env.VITE_REDIRECT_URI
    })
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`Error exchanging Authorization Code grant for access token (API returned ${response.status})`);
    }
  }).then((data) => {
    if (data.error) {
      throw new Error(`${data.error} - ${data.error_description}`);
    } else {
      return res.status(200).json({
        token: data.access_token
      });
    }
  }).catch((error) => {
    return res.status(403).json({
      error: error.message
    });
  });
});

app.get("/api", express.json(), (req, res) => {
  return res.status(200).json(
    fetch("https://api.github.com/user/repos", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${req.body.token ? req.body.token : null}`
      }
    }).then((response) => {
      return response.json();
    })
  )
});

export default app;
