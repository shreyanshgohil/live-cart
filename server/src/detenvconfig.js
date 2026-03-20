import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

// Resolve the __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, `config/.env_${process.env.SERVER}`);

config({ path: envPath });
