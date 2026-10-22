import 'dotenv/config';
import app from './app.js';
import { migrate } from './db.js';

const port = process.env.PORT || 4000;

if (!process.env.DATABASE_URL) console.warn('DATABASE_URL is not set.');
if (!process.env.JWT_SECRET) console.warn('JWT_SECRET is not set. Logins will fail.');

migrate()
  .then(() => app.listen(port, () => console.log(`Partlog API running on port ${port}`)))
  .catch((err) => {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  });
