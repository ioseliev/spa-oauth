import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')));

app.get('/api', (req, res) => {
  res.send("'Tis a message from the back-end!");
});

export default app;
