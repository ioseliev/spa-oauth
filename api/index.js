import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.post("/api/token", express.json(), (req, res) => {
  if (!req.body || typeof req.body !== "object" || !req.body.code || !req.body.code_verifier) {
    return res.status(400).json({
      error: "Missing Authorization Code grant and/or code verifier."
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
      code_verifier: req.body.code_verifier,
      redirect_uri: process.env.VITE_REDIRECT_URI
    })
  }).then((response) => {
    return (response.status, response.json());
  }).then((status, data) => {
    if (status != 200) {
      throw new Error(data);
    } else if (data.error) {
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

app.get("/api/repos", (req, res) => {
  fetch("https://api.github.com/user/repos", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${req.headers['token'] ? req.headers['token'] : null}`
    }
  }).then((response) => {
    return response.json();
  }).then((data) => {
    return res.status(200).json(data);
  });
});

export default app;
