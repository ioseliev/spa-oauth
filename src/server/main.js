import express from "express";
import ViteExpress from "vite-express";

const app = express();

app.get("/token", (req, res) => {
  res.send('\'Tis a message from the back-end!');
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
