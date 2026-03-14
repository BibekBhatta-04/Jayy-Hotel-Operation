import cron from 'node-cron';
import axios from 'axios';

// The URL of the live Render backend
// We use the environment variable if available, otherwise default to localhost for dev
const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';

export const startKeepAlive = () => {
  // Run every 10 minutes (* / 10 * * * *)
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log(`[KeepAlive] Pinging ${BACKEND_URL}/api/health to prevent Render sleep...`);
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      console.log(`[KeepAlive] Success: ${response.data.status} at ${response.data.timestamp}`);
    } catch (error: any) {
      console.error(`[KeepAlive] Error pinging server: ${error.message}`);
    }
  });

  console.log('[KeepAlive] Cron job started: Will ping server every 10 minutes.');
};
