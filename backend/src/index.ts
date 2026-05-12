import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pricesRouter from './routes/prices';
import riftboundRouter from './routes/riftbound';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/prices', pricesRouter);
app.use('/api/riftbound', riftboundRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ebayConfigured: !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET) });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  if (!process.env.EBAY_CLIENT_ID) {
    console.log('  Note: No EBAY_CLIENT_ID set — using mock price data. Add .env to enable live eBay prices.');
  }
});
