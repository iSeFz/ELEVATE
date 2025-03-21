import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { loadSwaggerFiles } from '../utils/swaggerLoader.js';

const router = express.Router();

// Load and combine all swagger definitions
const swaggerDocument = loadSwaggerFiles();

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui.css',
  customJs: [
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui-bundle.js',
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js'
  ]
}));

export default router;
